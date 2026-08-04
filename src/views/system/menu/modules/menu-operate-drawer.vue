<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import {
  type FormInst,
  NAlert,
  NButton,
  NDataTable,
  NDivider,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItemGi,
  NGrid,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTreeSelect,
  type TreeSelectOption
} from 'naive-ui';
import { $t } from '@/locales';
import { views } from '@/router/elegant/imports';
import { generatedRoutes } from '@/router/elegant/routes';
import { getRoutePath } from '@/router/elegant/transform';
import { fetchCreateMenu, fetchGetMenuList, fetchUpdateMenu, type Menu, type MenuForm } from '../api';
import { layoutOptions, menuTypeOptions, resolveMenuType, showHiddenOptions, translateTitle, yesOrNoOptions } from '../shared';
import IconPickerModal from './icon-picker-modal.vue';

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
/** 图标选择弹窗显隐 */
const iconPickerVisible = ref(false);
/** 父节点树形选项 */
const parentTreeOptions = ref<TreeSelectOption[]>([]);
/** 当前已加载的菜单原始数据，用于按上级过滤菜单型组件 */
const loadedMenuList = ref<Menu[]>([]);

/** 目录型可选项：按父级约束层级
 * - 父级为根节点（parentId=0）：仅显示 generatedRoutes 第一层中含 children 的路由
 * - 父级为某目录：在 generatedRoutes 中找到同名路由，显示其 children 中含 children 的路由（下一层目录）
 */
const directoryOptions = computed(() => {
  const result: { label: string; value: string }[] = [];
  type RouteNode = { name?: string; meta?: { hideInMenu?: boolean }; children?: RouteNode[] };

  const buildLabel = (name: string) => {
    const titleKey = `route.${name}` as const;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const title = $t(titleKey as any);
    const hasTitle = title && title !== titleKey;
    return hasTitle ? `${name}（${title}）` : name;
  };

  // 收集当前层级中未隐藏且含 children 的路由
  const collectDirRoutes = (routes: RouteNode[]) => {
    for (const r of routes) {
      if (!r.name || r.meta?.hideInMenu) continue;
      if (r.children?.length) {
        result.push({ label: buildLabel(r.name), value: r.name });
      }
    }
  };

  // 在 generatedRoutes 中按 name 查找路由节点
  const findRouteByName = (routes: RouteNode[], name: string): RouteNode | null => {
    for (const r of routes) {
      if (r.name === name) return r;
      if (r.children?.length) {
        const found = findRouteByName(r.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  const parentName = findParentMenuName(model.value.parentId);
  if (!parentName) {
    // 父级为根节点：显示第一层目录路由
    collectDirRoutes(generatedRoutes as RouteNode[]);
  } else {
    // 父级为某目录：显示该目录下下一层目录路由
    const parentRoute = findRouteByName(generatedRoutes as RouteNode[], parentName);
    if (parentRoute?.children?.length) {
      collectDirRoutes(parentRoute.children);
    } else {
      // 父级不在 generatedRoutes 中（自定义目录），回退到第一层
      collectDirRoutes(generatedRoutes as RouteNode[]);
    }
  }
  return result;
});

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

/** 菜单型可选项：根据选择的上级过滤；上级为根或无匹配时显示全部未隐藏视图 */
const fileOptions = computed(() => {
  const parentName = findParentMenuName(model.value.parentId);
  const allViews = Object.keys(views).filter(k => !hiddenRouteNames.value.has(k));
  let filtered = allViews;
  if (parentName) {
    const matching = allViews.filter(k => k.startsWith(`${parentName}_`));
    // 仅当存在匹配项时才过滤，避免父级为自定义目录时无选项可选
    if (matching.length > 0) {
      filtered = matching;
    }
  }
  return filtered.map(k => {
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
  });
});

/** 目录型组件录入方式：select 从 generatedRoutes 目录路由选择 / manual 手动输入组件路径 */
const directoryManualMode = ref(false);
/** 菜单型组件录入方式：select 从 views 选择 / manual 手动输入组件路径 */
const menuManualMode = ref(false);

/** 组件录入模式统一控制：select 选择 / manual 手动输入 */
const componentMode = computed<'select' | 'manual'>({
  get: () => {
    if (model.value.menuType === 'directory') return directoryManualMode.value ? 'manual' : 'select';
    if (model.value.menuType === 'menu') return menuManualMode.value ? 'manual' : 'select';
    return 'select';
  },
  set: val => {
    if (model.value.menuType === 'directory') directoryManualMode.value = val === 'manual';
    if (model.value.menuType === 'menu') menuManualMode.value = val === 'manual';
  }
});

/** 需要手动编辑 name/path/title 的场景：外链，或目录/菜单型切换为手动输入组件 */
const manualFields = computed(
  () =>
    model.value.menuType === 'link' ||
    (model.value.menuType === 'directory' && directoryManualMode.value) ||
    (model.value.menuType === 'menu' && menuManualMode.value)
);

/** 菜单类型可选项：directory 目录 | menu 菜单 */
const menuTypeOpts = computed(() => menuTypeOptions());

/** 布局方式可选项：label 为简短文案（单选按钮显示），完整描述见 tooltip */
const layoutOpts = computed(() => layoutOptions());

/** 路由切换动画可选项：空字符串表示跟随全局 */
const transitionTypeOptions = computed(() => [
  { label: $t('page.system.menu.followGlobal'), value: '' },
  { label: 'fade', value: 'fade' },
  { label: 'slide', value: 'slide' }
]);

/** 切换菜单类型：选择目录时锁定布局为 layout.base，并清空已选组件；外链时清空路径相关自动填充 */
function handleMenuTypeChange(val: 'directory' | 'menu' | 'link') {
  model.value.menuType = val;
  model.value.component = '';
  directoryManualMode.value = false;
  menuManualMode.value = false;
  if (val === 'directory') {
    model.value.layout = 'layout.base';
  }
  if (val === 'link') {
    model.value.path = '';
    model.value.name = '';
    model.value.meta.title = '';
  }
}

/** 外链地址变更 */
function handleHrefChange(val: string) {
  model.value.path = val;
  const url = (val || '').trim();
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    host = url.replace(/^https?:\/\//i, '').split('/')[0];
  }
  model.value.name = host || 'external';
  model.value.component = 'layout.base$view.iframe-page'
}

/** 表单校验规则：核心字段必填 */
const formRules = computed(() => {
  const rules: Record<
    string,
    { required: boolean; message: string; trigger: ('blur' | 'input' | 'change')[]; type?: 'number' }
  > = {
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
    parentId: {
      required: true,
      type: 'number',
      message: $t('page.system.menu.parentIdRequired'),
      trigger: ['blur', 'change']
    },
    path: {
      required: true,
      message: $t('page.system.menu.pathRequired'),
      trigger: ['blur', 'input']
    }
  };
  if (model.value.menuType === 'link') {
    // rules['meta.href'] = {
    //   required: true,
    //   message: $t('page.system.menu.linkRequired'),
    //   trigger: ['blur', 'input']
    // };
    rules.path = {
      required: true,
      message: $t('page.system.menu.linkRequired'),
      trigger: ['blur', 'change']
    };
    // rules.component = {
    //   required: true,
    //   message: $t('page.system.menu.linkRequired'),
    //   trigger: ['blur', 'change']
    // };
  } else if (!(model.value.menuType === 'menu' && menuManualMode.value)) {
    // 菜单型手动输入模式：component 由 name 派生，无需校验
    rules.component = {
      required: true,
      message: $t('page.system.menu.componentRequired'),
      trigger: ['blur', 'change']
    };
  }
  return rules;
});

/** 选择组件后自动回显 path、name、meta.title
 * - 菜单型：值为 view.xxx，xxx 即为路由名（如 view.system_menu → system_menu）
 * - 目录型：值为路由名本身（如 system）
 * 选中的路由名作为 name 默认值，便于用户在此基础上调整
 */
function handleComponentChange(val: string) {
  model.value.component = val;
  let routeName = '';
  if (model.value.menuType === 'menu' && val.startsWith('view.')) {
    routeName = val.slice('view.'.length);
  } else if (model.value.menuType === 'directory') {
    routeName = val;
  }
  if (!routeName) return;

  // 路由名回显到 name 字段，用户仍可手动编辑
  model.value.name = routeName;

  // 路由路径回显到 path 字段
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

/** 抽屉显隐变化：关闭时触发 close 事件 */
function handleDrawerUpdateShow(val: boolean) {
  if (!val) emit('close');
}

/** 父级菜单变更 */
function handleParentIdChange(val: number | null) {
  model.value.parentId = val ?? 0;
}

/** 是否隐藏变更（下拉 value 为 0/1，转换为 boolean） */
function handleHiddenChange(val: number) {
  model.value.hidden = val === 1;
}

/** keepAlive 变更 */
function handleKeepAliveChange(val: number) {
  model.value.meta.keepAlive = val === 1;
}

/** 选择图标 */
function handleIconSelect(icon: string) {
  model.value.meta.icon = icon;
}

/** 新增一行菜单参数 */
function handleAddParam() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  paramList.value.push({ _id: nextRowId(), type: 'query', key: '', value: '' });
}

/** 新增一行可控按钮 */
function handleAddBtn() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  btnList.value.push({ _id: nextRowId(), name: '', desc: '' });
}

/** 参数行 row-key（使用前端内部 id 稳定渲染） */
function paramRowKey(row: { _id: number }) {
  return row._id;
}

/** 按钮行 row-key */
function btnRowKey(row: { _id: number }) {
  return row._id;
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
      closeTab: true,
      defaultMenu: false,
      activeName: '',
      transitionType: '',
      href: ''
    }
  };
}

/** 将后端菜单树构造为 NTreeSelect 选项，仅保留目录类型节点作为父级候选；
 *  编辑时排除自身（同时排除其整个子树，避免形成环），隐藏菜单不参与选择 */
function buildMenuTree(list: Menu[] = [], excludeId?: number): TreeSelectOption[] {
  return list
    .filter(m => m.ID !== excludeId && !m.hidden && resolveMenuType(m) === 'directory')
    .map(m => {
      const node: TreeSelectOption = {
        key: m.ID,
        label: m.meta?.title ? translateTitle(m.meta.title) : m.name
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
  loadedMenuList.value = data ?? [];
  parentTreeOptions.value = [
    {
      key: 0,
      label: $t('page.system.menu.rootDirectory'),
      children: buildMenuTree(data ?? [], excludeId)
    }
  ];
}

/** 根据 parentId 查找父级菜单的 name，用于按上级过滤菜单型组件 */
function findParentMenuName(parentId: number): string | null {
  if (!parentId) return null;
  const walk = (list: Menu[]): Menu | null => {
    for (const m of list) {
      if (m.ID === parentId) return m;
      if (m.children?.length) {
        const found = walk(m.children);
        if (found) return found;
      }
    }
    return null;
  };
  const found = walk(loadedMenuList.value);
  return found?.name ?? null;
}

/** 根据编辑数据构造表单模型；新增时使用默认模型，并预置父级 */
function buildModelFromProps(): MenuForm {
  const editing = props.operateType === 'edit' && props.editingData;
  if (!editing) {
    const fresh = createDefaultModel();
    if (props.defaultParentId) fresh.parentId = props.defaultParentId;
    return fresh;
  }
  return {
    ID: props.editingData!.ID,
    path: props.editingData!.path,
    name: props.editingData!.name,
    component: props.editingData!.component,
    parentId: props.editingData!.parentId,
    sort: props.editingData!.sort,
    hidden: props.editingData!.hidden,
    menuType: props.editingData!.menuType ?? 'menu',
    layout: props.editingData!.layout ?? 'layout.base',
    meta: { ...props.editingData!.meta, closeTab: true }
  };
}

/** 初始化参数与按钮列表（编辑时回填，补前端行 id 以稳定渲染） */
function initParamAndBtnList() {
  const editing = props.operateType === 'edit' && props.editingData;
  paramList.value = editing ? (props.editingData!.parameters ?? []).map(p => ({ _id: nextRowId(), ...p })) : [];
  btnList.value = editing
    ? (props.editingData!.menuBtn ?? []).map(b => ({ _id: nextRowId(), name: b.name, desc: b.desc }))
    : [];
}

/** 抽屉打开时初始化表单：构造模型、加载父级选项、回填参数与按钮 */
function initFormOnOpen() {
  model.value = buildModelFromProps();
  const editingId = props.operateType === 'edit' ? props.editingData?.ID : undefined;
  loadParentTreeOptions(editingId);
  initParamAndBtnList();
  // 编辑目录且已存组件不在可选目录路由中，判定为手动输入模式
  if (props.operateType === 'edit' && model.value.menuType === 'directory' && model.value.component) {
    directoryManualMode.value = !directoryOptions.value.some(o => o.value === model.value.component);
  } else {
    directoryManualMode.value = false;
  }
  // 编辑菜单且已存组件不在可选视图列表中，判定为手动输入模式
  if (props.operateType === 'edit' && model.value.menuType === 'menu' && model.value.component) {
    menuManualMode.value = !fileOptions.value.some(o => o.value === model.value.component);
  } else {
    menuManualMode.value = false;
  }
}

watch(
  () => props.visible,
  val => {
    if (val) initFormOnOpen();
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
  // 菜单型手动输入模式：component 由 name 派生（view.{name}），避免后端缺字段
  if (model.value.menuType === 'menu' && menuManualMode.value && !model.value.component && model.value.name) {
    model.value.component = `view.${model.value.name}`;
  }
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
  // 高亮菜单字段已移除 UI，提交/编辑统一使用空字符串
  payload.meta = { ...model.value.meta, activeName: '' };
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
  <NDrawer :show="props.visible" display-directive="show" :width="640" @update:show="handleDrawerUpdateShow">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <!-- 顶部警告 -->
      <NAlert type="warning" :bordered="false" class="mb-16px">
        {{ $t('page.system.menu.addMenuWarning') }}
      </NAlert>

      <NForm ref="formRef" :model="model" :rules="formRules" label-placement="top">
        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="24" :label="$t('page.system.menu.parentId')" path="parentId">
            <NTreeSelect
              :value="model.parentId"
              :options="parentTreeOptions"
              :placeholder="$t('page.system.menu.parentIdPlaceholder')"
              key-field="key"
              label-field="label"
              children-field="children"
              default-expand-all
              clearable
              @update:value="handleParentIdChange"
            />
          </NFormItemGi>
        </NGrid>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="12" :label="$t('page.system.menu.fieldMenuType')" path="menuType">
            <NRadioGroup v-model:value="model.menuType" @update:value="handleMenuTypeChange">
              <NRadio v-for="opt in menuTypeOpts" :key="opt.value" :value="opt.value" :label="opt.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="12" path="layout">
            <template #label>
              <div class="flex items-center gap-4px">
                <span>{{ $t('page.system.menu.fieldLayout') }}</span>
                <IconTooltip placement="top">
                  <template #trigger>
                    <span class="text-14px cursor-pointer text-[var(--n-text-color-3)] inline-flex">
                      <SvgIcon icon="ri:information-line" />
                    </span>
                  </template>
                  {{ $t('page.system.menu.layoutBase') }}
                  <br />
                  {{ $t('page.system.menu.layoutBlank') }}
                </IconTooltip>
              </div>
            </template>
            <NRadioGroup
              v-model:value="model.layout"
              :disabled="model.menuType === 'directory' || model.menuType === 'link'"
            >
              <NRadio v-for="opt in layoutOpts" :key="opt.value" :value="opt.value" :label="opt.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="model.menuType === 'directory'"
            :span="24"
            :label="$t('page.system.menu.componentInputMode')"
          >
            <NRadioGroup v-model:value="componentMode">
              <NRadio value="select">
                {{
                  model.menuType === 'directory'
                    ? $t('page.system.menu.selectPath')
                    : $t('page.system.menu.selectInput')
                }}
              </NRadio>
              <NRadio value="manual">{{ $t('page.system.menu.manualInput') }}</NRadio>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="model.menuType === 'directory' && !directoryManualMode"
            :span="24"
            :label="$t('page.system.menu.component')"
            path="component"
          >
            <NSelect
              :value="model.component"
              :placeholder="$t('page.system.menu.componentDirPlaceholder')"
              :options="directoryOptions"
              filterable
              clearable
              @update:value="handleComponentChange"
            />
          </NFormItemGi>
          <NFormItemGi
            v-else-if="model.menuType === 'menu' && !menuManualMode"
            :span="24"
            :label="$t('page.system.menu.component')"
            path="component"
          >
            <!-- 菜单型：从 views 中选择，选中后自动回显路由路径 -->
            <NSelect
              :value="model.component"
              :placeholder="$t('page.system.menu.componentFilePlaceholder')"
              :options="fileOptions"
              filterable
              clearable
              @update:value="handleComponentChange"
            />
          </NFormItemGi>
          <NFormItemGi
            v-else-if="model.menuType === 'link'"
            :span="24"
            :label="$t('page.system.menu.linkAddress')"
            path="path"
          >
            <!-- 使用 path 接收外链地址 -->
            <NInput
              v-model:value="model.path"
              :placeholder="$t('page.system.menu.linkAddressPlaceholder')"
              @update:value="handleHrefChange"
            />
          </NFormItemGi>
          <template v-if="model.menuType === 'link'">
            <NFormItemGi :span="24" :label="$t('page.system.menu.titleField')" path="meta.title">
              <NInput v-model:value="model.meta.title" :placeholder="$t('page.system.menu.titlePlaceholder')" />
            </NFormItemGi>
          </template>
<!--          <template v-if="manualFields">-->
<!--            <NFormItemGi :span="24" :label="$t('page.system.menu.name')" path="name">-->
<!--              <NInput v-model:value="model.name" :placeholder="$t('page.system.menu.namePlaceholder')" />-->
<!--            </NFormItemGi>-->
<!--            <NFormItemGi :span="24" :label="$t('page.system.menu.path')" path="path">-->
<!--              <NInput-->
<!--                v-model:value="model.path"-->
<!--                :placeholder="-->
<!--                  model.menuType === 'link'-->
<!--                    ? $t('page.system.menu.linkPathPlaceholder')-->
<!--                    : $t('page.system.menu.pathPlaceholder')-->
<!--                "-->
<!--              />-->
<!--            </NFormItemGi>-->
<!--            <NFormItemGi :span="24" :label="$t('page.system.menu.titleField')" path="meta.title">-->
<!--              <NInput v-model:value="model.meta.title" :placeholder="$t('page.system.menu.titlePlaceholder')" />-->
<!--            </NFormItemGi>-->
<!--          </template>-->
<!--          <template v-else>-->
<!--            <NFormItemGi :span="24" :label="$t('page.system.menu.titleField')" path="meta.title">-->
<!--              <NInput-->
<!--                :value="translateTitle(model.meta.title)"-->
<!--                :placeholder="$t('page.system.menu.titlePlaceholder')"-->
<!--                readonly-->
<!--              />-->
<!--            </NFormItemGi>-->
<!--            <NFormItemGi :span="24" :label="$t('page.system.menu.path')" path="path">-->
<!--              <NInput v-model:value="model.path" :placeholder="$t('page.system.menu.pathPlaceholder')" readonly />-->
<!--            </NFormItemGi>-->
<!--          </template>-->
        </NGrid>

        <!-- 显示设置 -->
        <NDivider title-placement="left">{{ $t('page.system.menu.sectionDisplay') }}</NDivider>

        <NGrid :cols="24" :x-gap="16" :y-gap="8">
          <NFormItemGi :span="12" :label="$t('page.system.menu.icon')" path="meta.icon">
            <div class="flex items-center gap-4px">
              <NInput
                v-model:value="model.meta.icon"
                :placeholder="$t('page.system.menu.iconPlaceholder')"
                readonly
                clearable
                class="flex-1"
              >
                <template #prefix>
                  <SvgIcon
                    v-if="model.meta.icon"
                    :icon="model.meta.icon"
                    class="text-16px text-[var(--n-text-color-2)]"
                  />
                  <SvgIcon v-else icon="ri:image-line" class="text-16px text-[var(--n-text-color-3)] op-50" />
                </template>
              </NInput>
              <NButton size="small" type="primary" @click="iconPickerVisible = true">
                {{ $t('common.select') }}
              </NButton>
            </div>
          </NFormItemGi>
          <NFormItemGi :span="12" :label="$t('page.system.menu.sortLabel')" path="sort">
            <NInputNumber
              v-model:value="model.sort"
              :placeholder="$t('page.system.menu.sortPlaceholder')"
              style="width: 100%"
            />
          </NFormItemGi>
          <NFormItemGi :span="12" :label="$t('page.system.menu.visibility')" path="hidden">
            <NSelect :value="model.hidden ? 1 : 0" :options="showHiddenOptions()" @update:value="handleHiddenChange" />
          </NFormItemGi>
          <NFormItemGi :span="12" label="KeepAlive" path="meta.keepAlive">
            <NSelect
              :value="model.meta.keepAlive ? 1 : 0"
              :options="yesOrNoOptions()"
              @update:value="handleKeepAliveChange"
            />
          </NFormItemGi>
          <NFormItemGi :span="12" :label="$t('page.system.menu.transitionType')" path="meta.transitionType">
            <NSelect v-model:value="model.meta.transitionType" :options="transitionTypeOptions" clearable />
          </NFormItemGi>
        </NGrid>

        <!-- 菜单参数配置 -->
        <NDivider title-placement="left">
          <NSpace align="center" :wrap="false">
            <span>{{ $t('page.system.menu.sectionParams') }}</span>
            <NButton type="primary" size="tiny" @click="handleAddParam">
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
          :row-key="paramRowKey"
        >
          <template #empty>
            <span class="text-12px op-50">{{ $t('page.system.menu.paramEmptyTip') }}</span>
          </template>
        </NDataTable>

        <!-- 可控按钮配置 -->
        <NDivider title-placement="left">
          <NSpace align="center" :wrap="false">
            <span>{{ $t('page.system.menu.sectionButtons') }}</span>
            <NButton type="primary" size="tiny" @click="handleAddBtn">
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
          :row-key="btnRowKey"
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

    <IconPickerModal :visible="iconPickerVisible" @close="iconPickerVisible = false" @select="handleIconSelect" />
  </NDrawer>
</template>
