<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, TreeSelectOption } from 'naive-ui';
import { NForm, NFormItem, NInput, NInputNumber, NTreeSelect } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateAuthority, fetchGetAuthorityList, fetchUpdateAuthority, type Authority } from '../api';

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Authority | null;
  /** 新增子角色时，预置的父级角色 ID（顶级用 0） */
  defaultParentId?: number | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = reactive({
  authorityId: null as number | null,
  authorityName: '',
  parentId: 0,
  dataScope: 1
});

const roleNameMap = ref<Record<number, string>>({});
const parentOptions = ref<TreeSelectOption[]>([]);

const rules: FormRules = {
  authorityId: [
    {
      required: true,
      type: 'number',
      message: $t('page.system.authority.authorityIdPlaceholder'),
      trigger: ['blur', 'change']
    },
    {
      validator: (_rule, value) => {
        // 仅新增时强制校验：必须为正整数
        if (props.operateType !== 'add') return true;
        if (typeof value === 'number' && Number.isInteger(value) && value > 0) return true;
        return new Error($t('page.system.authority.authorityIdPositiveInt'));
      },
      trigger: ['blur', 'change']
    }
  ],
  authorityName: [{ required: true, message: $t('page.system.authority.authorityNamePlaceholder'), trigger: 'blur' }]
};

const title = computed(() =>
  props.operateType === 'add' ? $t('page.system.authority.addRole') : $t('page.system.authority.editRole')
);

const dataScopeOptions = computed(() => [
  { label: $t('page.system.authority.allData'), value: 1 },
  { label: $t('page.system.authority.deptAndBelow'), value: 2 },
  { label: $t('page.system.authority.deptOnly'), value: 3 },
  { label: $t('page.system.authority.selfOnly'), value: 4 },
  { label: $t('page.system.authority.customDept'), value: 5 }
]);

/** 把角色树拍平为 { authorityId: authorityName }，用于只读展示父级角色名称 */
function buildNameMap(list: Authority[]): Record<number, string> {
  const map: Record<number, string> = {};
  const walk = (items: Authority[]) => {
    for (const it of items ?? []) {
      map[Number(it.authorityId) || 0] = it.authorityName ?? '';
      walk(it.children ?? []);
    }
  };
  walk(list);
  return map;
}

/** 把所有节点（含子孙）的 id 收集进 acc */
function collectAll(items: Authority[], acc: Set<number>): void {
  for (const it of items ?? []) {
    acc.add(Number(it.authorityId) || 0);
    collectAll(it.children ?? [], acc);
  }
}

/** 收集 targetId 自身及其所有子孙的 id（用于编辑时禁用，防循环引用） */
function collectDisabledIds(list: Authority[], targetId: number): Set<number> {
  const result = new Set<number>();
  const walk = (items: Authority[]): boolean => {
    for (const it of items ?? []) {
      const id = Number(it.authorityId) || 0;
      if (id === targetId) {
        result.add(id);
        collectAll(it.children ?? [], result);
        return true;
      }
      if (walk(it.children ?? [])) return true;
    }
    return false;
  };
  walk(list);
  return result;
}

/** 构建编辑时可选择的父级角色树：disableIds 中的节点（当前节点及其子孙）禁用 */
function buildParentOptions(list: Authority[], disableIds: Set<number>): TreeSelectOption[] {
  return (list ?? []).map(item => {
    const id = Number(item.authorityId) || 0;
    const children = item.children?.length ? buildParentOptions(item.children, disableIds) : undefined;
    return {
      label: item.authorityName ?? '',
      value: id,
      disabled: disableIds.has(id),
      children
    };
  });
}

/** 父级角色展示文案（只读/新增模式）：顶级=根角色，其余按 parentId 查名称 */
const parentRoleLabel = computed(() => {
  if (model.parentId === 0) return $t('page.system.authority.rootRole');
  return roleNameMap.value[model.parentId] ?? '';
});

watch(
  () => props.visible,
  async visible => {
    if (!visible) return;

    const { data } = await fetchGetAuthorityList();
    roleNameMap.value = buildNameMap(data ?? []);
    // 编辑时禁用"当前节点及其所有子孙"，避免循环引用；新增时无需禁用（字段只读）
    const disableId =
      props.operateType === 'edit' && props.editingData ? Number(props.editingData.authorityId) || 0 : null;
    const disableIds = disableId != null ? collectDisabledIds(data ?? [], disableId) : new Set<number>();
    parentOptions.value = [
      { label: $t('page.system.authority.rootRole'), value: 0 },
      ...buildParentOptions(data ?? [], disableIds)
    ];

    if (props.operateType === 'edit' && props.editingData) {
      const d = props.editingData;
      model.authorityId = d.authorityId;
      model.authorityName = d.authorityName ?? '';
      model.parentId = d.parentId ?? 0;
      model.dataScope = d.dataScope ?? 1;
    } else {
      model.authorityId = null;
      model.authorityName = '';
      model.parentId = props.defaultParentId ?? 0;
      model.dataScope = 1;
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  await formRef.value?.validate();

  startLoading();

  const payload = {
    authorityId: model.authorityId as number,
    authorityName: model.authorityName,
    parentId: model.parentId ?? 0,
    dataScope: model.dataScope
  };

  try {
    const { error } =
      props.operateType === 'add' ? await fetchCreateAuthority(payload) : await fetchUpdateAuthority(payload);

    if (!error) {
      window.$message?.success(
        props.operateType === 'add' ? $t('page.system.authority.addSuccess') : $t('page.system.authority.editSuccess')
      );
      emit('submitted');
      emit('close');
    }
  } finally {
    endLoading();
  }
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="480" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem :label="$t('page.system.authority.parentRole')" path="parentId">
          <NInput
            v-if="operateType === 'add'"
            :value="parentRoleLabel"
            readonly
            :placeholder="$t('page.system.authority.parentRolePlaceholder')"
          />
          <NTreeSelect
            v-else
            v-model:value="model.parentId"
            :options="parentOptions"
            key-field="value"
            clearable
            :placeholder="$t('page.system.authority.parentRolePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.authority.authorityId')" path="authorityId">
          <NInputNumber
            v-model:value="model.authorityId"
            :placeholder="$t('page.system.authority.authorityIdPlaceholder')"
            :disabled="operateType === 'edit'"
            :min="1"
            :precision="0"
            :show-button="false"
            class="w-full"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.authority.authorityName')" path="authorityName">
          <NInput
            v-model:value="model.authorityName"
            :placeholder="$t('page.system.authority.authorityNamePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.authority.dataScope')" path="dataScope">
          <NSelect v-model:value="model.dataScope" :options="dataScopeOptions" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
