<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateAuthority, fetchGetAuthorityList, fetchUpdateAuthority, type Authority } from '../api';

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Authority | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = reactive({
  authorityId: '',
  authorityName: '',
  parentId: 0,
  dataScope: 1
});

const parentOptions = ref<{ label: string; value: number }[]>([]);

const rules: FormRules = {
  authorityId: [
    { required: true, message: $t('page.system.authority.authorityIdPlaceholder'), trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: $t('page.system.authority.authorityIdPlaceholder'), trigger: 'blur' }
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

function flatten(list: Authority[], acc: { label: string; value: number }[] = []) {
  list.forEach(item => {
    acc.push({ label: item.authorityName, value: Number(item.authorityId) || 0 });
    if (item.children?.length) flatten(item.children, acc);
  });
  return acc;
}

watch(
  () => props.visible,
  async visible => {
    if (!visible) return;

    const { data } = await fetchGetAuthorityList();
    parentOptions.value = [{ label: $t('page.system.authority.parentRole'), value: 0 }, ...(flatten(data ?? []))];

    if (props.operateType === 'edit' && props.editingData) {
      const d = props.editingData;
      model.authorityId = d.authorityId;
      model.authorityName = d.authorityName ?? '';
      model.parentId = d.parentId ?? 0;
      model.dataScope = d.dataScope ?? 1;
    } else {
      model.authorityId = '';
      model.authorityName = '';
      model.parentId = 0;
      model.dataScope = 1;
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  await formRef.value?.validate();

  startLoading();

  const payload = {
    authorityId: model.authorityId,
    authorityName: model.authorityName,
    parentId: model.parentId,
    dataScope: model.dataScope
  };

  try {
    const { error } =
      props.operateType === 'add'
        ? await fetchCreateAuthority(payload)
        : await fetchUpdateAuthority(payload);

    if (!error) {
      window.$message?.success(
        props.operateType === 'add'
          ? $t('page.system.authority.addSuccess')
          : $t('page.system.authority.editSuccess')
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
        <NFormItem :label="$t('page.system.authority.authorityId')" path="authorityId">
          <NInput
            v-model:value="model.authorityId"
            :placeholder="$t('page.system.authority.authorityIdPlaceholder')"
            :disabled="operateType === 'edit'"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.authority.authorityName')" path="authorityName">
          <NInput
            v-model:value="model.authorityName"
            :placeholder="$t('page.system.authority.authorityNamePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.authority.parentRole')" path="parentId">
          <NSelect v-model:value="model.parentId" :options="parentOptions" clearable />
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
