<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NAlert, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSelect, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateApi, fetchGetApiGroups, fetchUpdateApi, type Api, type ApiForm } from '../api';
import { methodOptions } from '../shared';

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
    method: ''
  };
}

const groupOptions = ref<{ label: string; value: string }[]>([]);
const { loading: groupLoading, startLoading: startGroupLoading, endLoading: endGroupLoading } = useLoading();

async function loadApiGroups() {
  startGroupLoading();
  const { data, error } = await fetchGetApiGroups();
  endGroupLoading();
  if (!error && data) {
    groupOptions.value = (data.groups ?? []).map(group => ({
      label: data.apiGroupMap?.[group] ?? group,
      value: group
    }));
  }
}

onMounted(() => {
  loadApiGroups();
});

const rules: FormRules = {
  path: [{ required: true, message: $t('page.system.api.drawerPathPlaceholder'), trigger: 'blur' }],
  method: [{ required: true, message: $t('page.system.api.drawerMethodPlaceholder'), trigger: 'change' }],
  apiGroup: [{ required: true, message: $t('page.system.api.drawerApiGroupPlaceholder'), trigger: 'change' }]
};

watch(
  () => props.visible,
  val => {
    if (!val) {
      // 抽屉关闭时清除表单校验状态，避免下次打开残留错误提示
      formRef.value?.restoreValidation();
      return;
    }
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
      window.$message?.success(isEdit ? $t('page.system.api.editSuccess') : $t('page.system.api.addSuccess'));
      emit('submitted');
      emit('close');
    }
  } finally {
    endLoading();
  }
}
</script>

<template>
  <NDrawer :show="props.visible" display-directive="show" :width="640" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :label-width="90">
        <NAlert v-if="props.operateType !== 'edit'" type="warning" class="mb-16px">
          {{ $t('page.system.api.drawerNotice') }}
        </NAlert>
        <NFormItem :label="$t('page.system.api.drawerPath')" path="path">
          <NInput v-model:value="model.path" :placeholder="$t('page.system.api.drawerPathPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.drawerMethod')" path="method">
          <NSelect
            v-model:value="model.method"
            :placeholder="$t('page.system.api.drawerMethodPlaceholder')"
            :options="methodOptions"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.drawerApiGroup')" path="apiGroup">
          <NSelect
            v-model:value="model.apiGroup"
            :placeholder="$t('page.system.api.drawerApiGroupPlaceholder')"
            :options="groupOptions"
            :loading="groupLoading"
            filterable
            tag
            clearable
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.api.drawerDescription')" path="description">
          <NInput
            v-model:value="model.description"
            :placeholder="$t('page.system.api.drawerDescriptionPlaceholder')"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
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
