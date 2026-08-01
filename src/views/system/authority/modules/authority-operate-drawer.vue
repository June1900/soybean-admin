<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, TreeSelectOption } from 'naive-ui';
import { NForm, NFormItem, NInput, NInputNumber, NTreeSelect } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateAuthority, fetchGetAuthorityList, fetchUpdateAuthority, type Authority } from '../api';
import { buildParentOptions, buildRoleNameMap, collectRoleDisabledIds, dataScopeOptions } from '../shared';

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
        // 新增时校验正整数
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

/** 父级角色展示文案：顶级=根角色，其余按 parentId 查名称 */
const parentRoleLabel = computed(() => {
  if (model.parentId === 0) return $t('page.system.authority.rootRole');
  return roleNameMap.value[model.parentId] ?? '';
});

watch(
  () => props.visible,
  async visible => {
    if (!visible) return;

    const { data } = await fetchGetAuthorityList();
    roleNameMap.value = buildRoleNameMap(data ?? []);
    // 编辑时禁用当前节点及子孙，防循环引用
    const disableId =
      props.operateType === 'edit' && props.editingData ? Number(props.editingData.authorityId) || 0 : null;
    const disableIds = disableId != null ? collectRoleDisabledIds(data ?? [], disableId) : new Set<number>();
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
          <NSelect v-model:value="model.dataScope" :options="dataScopeOptions()" />
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
