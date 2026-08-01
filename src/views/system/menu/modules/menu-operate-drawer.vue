<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NCheckbox,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NDivider,
  NForm,
  NFormItemGi,
  NGrid,
  NIcon,
  NInput,
  NInputNumber,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace,
  NTooltip,
  NTreeSelect,
  type FormInst,
  type TreeSelectOption
} from 'naive-ui';
import { $t } from '@/locales';
import { layouts, views } from '@/router/elegant/imports';
import { generatedRoutes } from '@/router/elegant/routes';
import { getRoutePath } from '@/router/elegant/transform';
import { fetchCreateMenu, fetchGetMenuList, fetchUpdateMenu, type Menu, type MenuForm } from '../api';

defineOptions({
  name: 'MenuOperateDrawer'
});

const props = withDefaults(
  defineProps<{
    visible: boolean;
    operateType: NaiveUI.TableOperateType;
    editingData: Menu | null;
    defaultParentId?: number;
  }>(),
  {
    defaultParentId: 0
  }
);

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.menu.editMenu') : $t('page.system.menu.addMenu')
);

const formRef = ref<FormInst | null>(null);
const model = ref<MenuForm>(createDefaultModel());
const saving = ref(false);
/** 父节点树形选项 */
const parentTreeOptions = ref<TreeSelectOption[]>([]);
const addParam = ref(false);

/** 目录型可选项（来源于 elegant-router 自动生成的 layouts 映射） */
const directoryOptions = computed(() =>
  Object.keys(layouts).map(k => ({ label: `layout.${k}`, value: `layout.${k}` }))
);

/** 递归收集 generatedRoutes 中标记为 hideInMenu 的路由 name，这些不参与选择 */
function collectHiddenRouteNames(
  routes: { name?: string; meta?: { hideInMenu?: boolean }; children?: unknown[] }[] = [],
  acc: Set<string> = new Set()
): Set<string> {
  for (const r of routes) {
    if (r.meta?.hideInMenu && r.name) acc.add(r.name);
    if (r.children?.length) collectHiddenRouteNames(r.children as typeof routes, acc);
  }
  return acc;
}

const hiddenRouteNames = computed(() =>
  collectHiddenRouteNames(generatedRoutes as Parameters<typeof collectHiddenRouteNames>[0])
);

/** 最终文件型可选项，显示为"组件名（菜单名称）（路由路径）"，便于直观选择；hideInMenu 的路由不参与选择 */
const fileOptions = computed(() =>
  Object.keys(views)
    .filter(k => !hiddenRouteNames.value.has(k))
    .map(k => {
      const routePath = getRoutePath(k as Parameters<typeof getRoutePath>[0]);
      const routeTitleKey = `route.${k}` as const;
      const routeTitle = $t(routeTitleKey as any);
      // 未配置翻译时 $t 返回 key 本身，此时不展示菜单名称括号
      const hasTitle = routeTitle && routeTitle !== routeTitleKey;
      const suffix = [hasTitle ? routeTitle : '', routePath].filter(Boolean).join('）（');
      return {
        label: suffix ? `view.${k}（${suffix}）` : `view.${k}`,
        value: `view.${k}`
      };
    })
);

/** 组件录入模式：由菜单类型决定，目录选 layouts，菜单选 views */
const componentMode = computed<'directory' | 'file'>(() =>
  model.value.menuType === 'directory' ? 'directory' : 'file'
);

/** 菜单类型可选项：directory 目录 | menu 菜单 */
const menuTypeOptions = computed(() => [
  { label: $t('page.system.menu.typeDirectory'), value: 'directory' },
  { label: $t('page.system.menu.typeMenu'), value: 'menu' }
]);

/** 布局方式可选项：label 为简短文案（单选按钮显示），完整描述见 tooltip */
const layoutOptions = computed(() => [
  { label: $t('page.system.menu.layoutBaseLabel'), value: 'layout.base' },
  { label: $t('page.system.menu.layoutBlankLabel'), value: 'layout.blank' }
]);

/** 切换菜单类型：选择目录时锁定布局为 layout.base，并清空已选组件 */
function handleMenuTypeChange(val: 'directory' | 'menu') {
  model.value.menuType = val;
  model.value.component = '';
  if (val === 'directory') {
    model.value.layout = 'layout.base';
  }
}

/** 表单校验规则：核心字段必填 */
const formRules = computed(() => ({
  'meta.title': {
    required: true,
    message: $t('page.system.menu.titleRequired'),
    trigger: ['blur', 'input']
  },
  name: {
    required: true,
    message: $t('page.system.menu.nameRequired'),
    trigger: ['blur', 'input']
  },
  component: {
    required: true,
    message: $t('page.system.menu.componentRequired'),
    trigger: ['blur', 'change']
  },
  parentId: {
    required: true,
    type: 'number' as const,
    message: $t('page.system.menu.parentIdRequired'),
    trigger: ['blur', 'change']
  },
  path: {
    required: true,
    message: $t('page.system.menu.pathRequired'),
    trigger: ['blur', 'input']
  }
}));

/** 选择组件文件后，自动回显对应的路由路径到 path 字段，并回显 i18n key 到 meta.title */
function handleComponentChange(val: string) {
  model.value.component = val;
  if (componentMode.value === 'file' && val.startsWith('view.')) {
    const routeName = val.slice('view.'.length);
    const routePath = getRoutePath(routeName as Parameters<typeof getRoutePath>[0]);
    if (routePath) {
      model.value.path = routePath;
    }
    // meta.title 保存 i18n 的 key（如 route.system_menu），运行时由路由模块解析为多语言文案
    const routeTitleKey = `route.${routeName}` as const;
    const routeTitle = $t(routeTitleKey as any);
    if (routeTitle && routeTitle !== routeTitleKey) {
      model.value.meta.title = routeTitleKey;
    }
  }
}

/** 行唯一 id 生成器（前端内部使用，提交时剥离），用于稳定 NDataTable 行渲染，避免输入框失焦 */
let _rowUid = 0;
const nextRowId = () => ++_rowUid;

/** 菜单参数列表 */
const paramList = ref<{ _id: number; type: string; key: string; value: string }[]>([]);
/** 可控按钮列表 */
const btnList = ref<{ _id: number; name: string; desc: string }[]>([]);

function createDefaultModel(): MenuForm {
  return {
    path: '',
    name: '',
    component: '',
    parentId: 0,
    sort: 0,
    hidden: false,
    menuType: 'menu',
    layout: 'layout.base',
    meta: {
      title: '',
      icon: '',
      keepAlive: false,
      closeTab: false,
      defaultMenu: false,
      activeName: '',
      transitionType: ''
    }
  };
}

/** 将后端菜单树构造为 NTreeSelect 选项，编辑时排除自身（同时排除其整个子树，避免形成环），隐藏菜单不参与选择 */
function buildMenuTree(list: Menu[] = [], excludeId?: number): TreeSelectOption[] {
  return list
    .filter(m => m.ID !== excludeId && !m.hidden)
    .map(m => {
      const node: TreeSelectOption = {
        key: m.ID,
        label: m.meta?.title ? $t(m.meta.title as any) : m.name
      };
      if (m.children?.length) {
        const children = buildMenuTree(m.children, excludeId);
        if (children.length) node.children = children;
      }
      return node;
    });
}

async function loadParentTreeOptions(excludeId?: number) {
  const { data } = await fetchGetMenuList();
  parentTreeOptions.value = [
    {
      key: 0,
      label: $t('page.system.menu.rootDirectory'),
      children: buildMenuTree(data ?? [], excludeId)
    }
  ];
}

watch(
  () => props.visible,
  val => {
    if (val) {
      const editing = props.operateType === 'edit' && props.editingData;
      model.value = editing
        ? {
            ID: props.editingData!.ID,
            path: props.editingData!.path,
            name: props.editingData!.name,
            component: props.editingData!.component,
            parentId: props.editingData!.parentId,
            sort: props.editingData!.sort,
            hidden: props.editingData!.hidden,
            menuType: props.editingData!.menuType ?? 'menu',
            layout: props.editingData!.layout ?? 'layout.base',
            meta: { ...props.editingData!.meta }
          }
        : createDefaultModel();
      // 新增子菜单时预置父级
      if (!editing && props.defaultParentId) {
        model.value.parentId = props.defaultParentId;
      }
      loadParentTreeOptions(editing ? props.editingData!.ID : undefined);
      // 加载已有参数和按钮（补前端行 id 以稳定渲染）
      paramList.value =
        editing && props.editingData!.parameters
          ? props.editingData!.parameters.map(p => ({ _id: nextRowId(), ...p }))
          : [];
      btnList.value =
        editing && props.editingData!.menuBtn
          ? props.editingData!.menuBtn.map(b => ({ _id: nextRowId(), name: b.name, desc: b.desc }))
          : [];
    }
  }
);

/** 参数类型可选项：query 路径参数 / params 查询参数 */
const paramTypeOptions = [
  { label: 'query', value: 'query' },
  { label: 'params', value: 'params' }
];

/* ---------- parameter table columns ---------- */
const paramColumns: NaiveUI.TableColumn<{ _id: number; type: string; key: string; value: string }>[] = [
  {
    title: $t('page.system.menu.paramType'),
    key: 'type',
    width: 120,
    render: (row, index) =>
      h(NSelect, {
        value: row.type,
        size: 'small',
        placeholder: $t('page.system.menu.paramType'),
        options: paramTypeOptions,
        status: !row.type ? 'error' : undefined,
        onUpdateValue: (val: string) => {
          paramList.value[index].type = val;
        }
      })
  },
  {
    title: $t('page.system.menu.paramKey'),
    key: 'key',
    minWidth: 140,
    render: (row, index) =>
      h(NInput, {
        value: row.key,
        size: 'small',
        placeholder: $t('page.system.menu.paramKey'),
        status: !row.key ? 'error' : undefined,
        onUpdateValue: (val: string) => {
          paramList.value[index].key = val;
        }
      })
  },
  {
    title: $t('page.system.menu.paramValue'),
    key: 'value',
    minWidth: 160,
    render: (row, index) =>
      h(NInput, {
        value: row.value,
        size: 'small',
        placeholder: $t('page.system.menu.paramValue'),
        status: !row.value ? 'error' : undefined,
        onUpdateValue: (val: string) => {
          paramList.value[index].value = val;
        }
      })
  },
  {
    title: $t('page.system.menu.operation'),
    key: 'action',
    width: 80,
    align: 'center',
    render: (_row, index) =>
      h(
        NButton,
        { size: 'small', type: 'error', text: true, onClick: () => paramList.value.splice(index, 1) },
        { default: () => $t('common.delete') }
      )
  }
];

/* ---------- button table columns ---------- */
const btnColumns: NaiveUI.TableColumn<{ _id: number; name: string; desc: string }>[] = [
  {
    title: $t('page.system.menu.btnName'),
    key: 'name',
    minWidth: 140,
    render: (row, index) =>
      h(NInput, {
        value: row.name,
        size: 'small',
        placeholder: $t('page.system.menu.btnName'),
        status: !row.name ? 'error' : undefined,
        onUpdateValue: (val: string) => {
          btnList.value[index].name = val;
        }
      })
  },
  {
    title: $t('page.system.menu.btnDesc'),
    key: 'desc',
    minWidth: 160,
    render: (row, index) =>
      h(NInput, {
        value: row.desc,
        size: 'small',
        placeholder: $t('page.system.menu.btnDesc'),
        status: !row.desc ? 'error' : undefined,
        onUpdateValue: (val: string) => {
          btnList.value[index].desc = val;
        }
      })
  },
  {
    title: $t('page.system.menu.operation'),
    key: 'action',
    width: 80,
    align: 'center',
    render: (_row, index) =>
      h(
        NButton,
        { size: 'small', type: 'error', text: true, onClick: () => btnList.value.splice(index, 1) },
        { default: () => $t('common.delete') }
      )
  }
];

async function handleSubmit() {
  await formRef.value?.validate();
  // 校验菜单参数与可控按钮：存在行时所有字段必填
  const invalidParam = paramList.value.findIndex(p => !p.type || !p.key || !p.value);
  if (invalidParam > -1) {
    window.$message?.warning($t('page.system.menu.paramRequiredTip'));
    return;
  }
  const invalidBtn = btnList.value.findIndex(b => !b.name || !b.desc);
  if (invalidBtn > -1) {
    window.$message?.warning($t('page.system.menu.btnRequiredTip'));
    return;
  }
  saving.value = true;
  const payload: Record<string, unknown> = { ...model.value };
  // 提交时剥离前端行 id
  payload.parameters = paramList.value.map(({ _id, ...rest }) => rest);
  payload.menuBtn = btnList.value.map(({ _id, ...rest }) => rest);

  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete payload.ID;

  const { error } = isEdit
    ? await fetchUpdateMenu(payload as unknown as MenuForm & { ID: number })
    : await fetchCreateMenu(payload as unknown as MenuForm);

  saving.value = false;
  if (!error) {
    window.$message?.success(isEdit ? $t('page.system.menu.editSuccess') : $t('page.system.menu.addSuccess'));
    emit('submitted');
    emit('close');
  }
}
</script>

<template>
  <NDrawer :show="props.visible" display-directive="show" :width="640" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <!-- 顶部警告 -->
      <NAlert type="warning" :bordered="false" class="mb-16px">
        {{ $t('page.system.menu.addMenuWarning') }}
      </NAlert>

      <NForm ref="formRef" :model="model" :rules="formRules" label-placement="top">
        <!-- 基础信息 -->
        <NDivider title-placement="left">{{ $t('page.system.menu.sectionBasic') }}</NDivider>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="8" :label="$t('page.system.menu.parentId')" path="parentId">
            <NTreeSelect
              :value="model.parentId"
              :options="parentTreeOptions"
              :placeholder="$t('page.system.menu.parentIdPlaceholder')"
              key-field="key"
              label-field="label"
              children-field="children"
              default-expand-all
              clearable
              @update:value="
                (val: number | null) => {
                  model.parentId = val ?? 0;
                }
              "
            />
          </NFormItemGi>
          <NFormItemGi :span="16" path="path">
            <template #label>
              <NSpace align="center" :wrap="false" :size="4">
                <span>{{ $t('page.system.menu.path') }}</span>
                <NCheckbox v-model:checked="addParam">{{ $t('page.system.menu.addParam') }}</NCheckbox>
              </NSpace>
            </template>
            <NInput v-model:value="model.path" :placeholder="$t('page.system.menu.pathPlaceholder')" />
          </NFormItemGi>
        </NGrid>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="12" :label="$t('page.system.menu.fieldMenuType')" path="menuType">
            <NRadioGroup v-model:value="model.menuType" @update:value="handleMenuTypeChange">
              <NRadioButton v-for="opt in menuTypeOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="12" path="layout">
            <template #label>
              <div class="flex items-center gap-4px">
                <span>{{ $t('page.system.menu.fieldLayout') }}</span>
                <NTooltip trigger="hover" placement="top">
                  <template #trigger>
                    <NIcon class="text-14px text-gray-400 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                    </NIcon>
                  </template>
                  {{ $t('page.system.menu.layoutBase') }}
                  <br />
                  {{ $t('page.system.menu.layoutBlank') }}
                </NTooltip>
              </div>
            </template>
            <NRadioGroup v-model:value="model.layout" :disabled="model.menuType === 'directory'">
              <NRadioButton v-for="opt in layoutOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="24" :label="$t('page.system.menu.component')" path="component">
            <!-- 目录型：从 layouts 中选择 -->
            <NSelect
              v-if="componentMode === 'directory'"
              v-model:value="model.component"
              :placeholder="$t('page.system.menu.componentDirPlaceholder')"
              :options="directoryOptions"
              clearable
            />
            <!-- 菜单型：从 views 中选择，选中后自动回显路由路径 -->
            <NSelect
              v-else
              :value="model.component"
              :placeholder="$t('page.system.menu.componentFilePlaceholder')"
              :options="fileOptions"
              filterable
              clearable
              @update:value="handleComponentChange"
            />
          </NFormItemGi>
          <NFormItemGi :span="12" :label="$t('page.system.menu.titleField')" path="meta.title">
            <NInput
              :value="$t(model.meta.title as any)"
              :placeholder="$t('page.system.menu.titlePlaceholder')"
              @update:value="val => (model.meta.title = val)"
            />
          </NFormItemGi>
          <NFormItemGi :span="12" :label="$t('page.system.menu.name')" path="name">
            <NInput v-model:value="model.name" :placeholder="$t('page.system.menu.namePlaceholder')" />
          </NFormItemGi>
        </NGrid>

        <!-- 显示设置 -->
        <NDivider title-placement="left">{{ $t('page.system.menu.sectionDisplay') }}</NDivider>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="8" :label="$t('page.system.menu.icon')" path="meta.icon">
            <NSelect
              v-model:value="model.meta.icon"
              :placeholder="$t('page.system.menu.iconPlaceholder')"
              :options="[]"
              clearable
            />
          </NFormItemGi>
          <NFormItemGi :span="8" :label="$t('page.system.menu.sortLabel')" path="sort">
            <NInputNumber
              v-model:value="model.sort"
              :placeholder="$t('page.system.menu.sortPlaceholder')"
              style="width: 100%"
            />
          </NFormItemGi>
          <NFormItemGi :span="8" :label="$t('page.system.menu.visibility')" path="hidden">
            <NSelect
              :value="model.hidden ? 1 : 0"
              :options="[
                { label: $t('page.system.menu.show'), value: 0 },
                { label: $t('page.system.menu.hidden'), value: 1 }
              ]"
              @update:value="
                val => {
                  model.hidden = val === 1;
                }
              "
            />
          </NFormItemGi>
        </NGrid>

        <!-- 高级配置 -->
        <NDivider title-placement="left">{{ $t('page.system.menu.sectionAdvanced') }}</NDivider>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="8" :label="$t('page.system.menu.activeName')" path="meta.activeName">
            <NInput v-model:value="model.meta.activeName" :placeholder="$t('page.system.menu.activeNamePlaceholder')" />
          </NFormItemGi>
          <NFormItemGi :span="8" label="KeepAlive" path="meta.keepAlive">
            <NSelect
              :value="model.meta.keepAlive ? 1 : 0"
              :options="[
                { label: $t('common.yesOrNo.yes'), value: 1 },
                { label: $t('common.yesOrNo.no'), value: 0 }
              ]"
              @update:value="
                val => {
                  model.meta.keepAlive = val === 1;
                }
              "
            />
          </NFormItemGi>
          <NFormItemGi :span="8" label="CloseTab" path="meta.closeTab">
            <NSelect
              :value="model.meta.closeTab ? 1 : 0"
              :options="[
                { label: $t('common.yesOrNo.yes'), value: 1 },
                { label: $t('common.yesOrNo.no'), value: 0 }
              ]"
              @update:value="
                val => {
                  model.meta.closeTab = val === 1;
                }
              "
            />
          </NFormItemGi>
          <NFormItemGi :span="8" :label="$t('page.system.menu.defaultMenu')" path="meta.defaultMenu">
            <NSelect
              :value="model.meta.defaultMenu ? 1 : 0"
              :options="[
                { label: $t('common.yesOrNo.yes'), value: 1 },
                { label: $t('common.yesOrNo.no'), value: 0 }
              ]"
              @update:value="
                val => {
                  model.meta.defaultMenu = val === 1;
                }
              "
            />
          </NFormItemGi>
          <NFormItemGi :span="8" :label="$t('page.system.menu.transitionType')" path="meta.transitionType">
            <NSelect
              v-model:value="model.meta.transitionType"
              :options="[
                { label: $t('page.system.menu.followGlobal'), value: '' },
                { label: 'fade', value: 'fade' },
                { label: 'slide', value: 'slide' }
              ]"
              clearable
            />
          </NFormItemGi>
        </NGrid>

        <!-- 菜单参数配置 -->
        <NDivider title-placement="left">
          <NSpace align="center" :wrap="false">
            <span>{{ $t('page.system.menu.sectionParams') }}</span>
            <NButton
              type="primary"
              size="small"
              @click="paramList.push({ _id: nextRowId(), type: 'query', key: '', value: '' })"
            >
              {{ $t('page.system.menu.addParamBtn') }}
            </NButton>
          </NSpace>
        </NDivider>

        <NDataTable
          :columns="paramColumns"
          :data="paramList"
          size="small"
          :bordered="false"
          :single-line="false"
          :row-key="(row: { _id: number }) => row._id"
        >
          <template #empty>
            <span class="text-12px op-50">{{ $t('page.system.menu.paramEmptyTip') }}</span>
          </template>
        </NDataTable>

        <!-- 可控按钮配置 -->
        <NDivider title-placement="left">
          <NSpace align="center" :wrap="false">
            <span>{{ $t('page.system.menu.sectionButtons') }}</span>
            <NButton type="primary" size="small" @click="btnList.push({ _id: nextRowId(), name: '', desc: '' })">
              {{ $t('page.system.menu.addBtnBtn') }}
            </NButton>
          </NSpace>
        </NDivider>

        <NDataTable
          :columns="btnColumns"
          :data="btnList"
          size="small"
          :bordered="false"
          :single-line="false"
          :row-key="(row: { _id: number }) => row._id"
        >
          <template #empty>
            <span class="text-12px op-50">{{ $t('page.system.menu.btnEmptyTip') }}</span>
          </template>
        </NDataTable>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="saving" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
