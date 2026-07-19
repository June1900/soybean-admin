<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSelect, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateApi, fetchUpdateApi, type Api, type ApiForm } from '../api';

defineOptions({
  name: 'ApiOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Api | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.api.editApi') : $t('page.system.api.addApi')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<ApiForm>(createDefaultModel());

function createDefaultModel(): ApiForm {
  return {
    path: '',
    apiGroup: '',
    description: '',
    method: 'GET'
  };
}

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
];

const rules: FormRules = {
  path: [{ required: true, message: $t('page.system.api.pathPlaceholder'), trigger: 'blur' }],
  apiGroup: [{ required: true, message: $t('page.system.api.apiGroupPlaceholder'), trigger: 'blur' }],
  method: [{ required: true, message: $t('page.system.api.methodPlaceholder'), trigger: 'change' }]
};

watch(
  () => props.visible,
  val => {
    if (!val) return;
    const editing = props.operateType === 'edit' && props.editingData;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          path: props.editingData!.path,
          apiGroup: props.editingData!.apiGroup,
          description: props.editingData!.description,
          method: props.editingData!.method
        }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: ApiForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateApi(payload as ApiForm & { ID: number })
      : await fetchCreateApi(payload as ApiForm);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.api.editSuccess') : $t('page.system.api.addSuccess')
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
  <NDrawer
    :show="props.visible"
    display-directive="show"
    :width="480"
    @update:show="val => !val && emit('close')"
  >
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="90">
        <NFormItem :label="$t('page.system.api.path')" path="path">
          <NInput v-model:value="model.path" :placeholder="$t('page.system.api.pathPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.apiGroup')" path="apiGroup">
          <NInput v-model:value="model.apiGroup" :placeholder="$t('page.system.api.apiGroupPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.description')" path="description">
          <NInput
            v-model:value="model.description"
            :placeholder="$t('page.system.api.descriptionPlaceholder')"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.method')" path="method">
          <NSelect v-model:value="model.method" :options="methodOptions" :placeholder="$t('page.system.api.methodPlaceholder')" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
