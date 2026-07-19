<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NInputNumber, NRadioGroup, NRadio, NSelect, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import {
  fetchCreateDictionaryDetail,
  fetchUpdateDictionaryDetail,
  type DictionaryDetail,
  type DictionaryDetailForm
} from '../api';

defineOptions({
  name: 'DictionaryDetailOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: DictionaryDetail | null;
  dictId: number | null;
  details: DictionaryDetail[];
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.dictionary.editDetail') : $t('page.system.dictionary.addDetail')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<DictionaryDetailForm>(createDefaultModel());

function createDefaultModel(): DictionaryDetailForm {
  return {
    label: '',
    value: '',
    extend: '',
    status: true,
    sort: 1,
    parentID: null
  };
}

const rules: FormRules = {
  label: [{ required: true, message: $t('page.system.dictionary.labelPlaceholder'), trigger: 'blur' }],
  value: [{ required: true, message: $t('page.system.dictionary.valuePlaceholder'), trigger: 'blur' }],
  sort: [{ required: true, message: $t('page.system.dictionary.sortPlaceholder'), trigger: 'blur' }]
};

const parentOptions = computed<SelectOption[]>(() =>
  props.details
    .filter(item => !(props.operateType === 'edit' && props.editingData && item.ID === props.editingData.ID))
    .map(item => ({ label: item.label, value: item.ID }))
);

watch(
  () => props.visible,
  val => {
    if (!val) return;
    const editing = props.operateType === 'edit' && props.editingData;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          label: props.editingData!.label,
          value: props.editingData!.value,
          extend: props.editingData!.extend ?? '',
          status: props.editingData!.status,
          sort: props.editingData!.sort,
          parentID: props.editingData!.parentID ?? null
        }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: DictionaryDetailForm & { ID?: number } = {
    ...model.value,
    sysDictionaryID: props.dictId ?? undefined
  };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateDictionaryDetail(payload as DictionaryDetailForm & { ID: number })
      : await fetchCreateDictionaryDetail(payload as DictionaryDetailForm);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.dictionary.editDetailSuccess') : $t('page.system.dictionary.addDetailSuccess')
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
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem :label="$t('page.system.dictionary.label')" path="label">
          <NInput v-model:value="model.label" :placeholder="$t('page.system.dictionary.labelPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.value')" path="value">
          <NInput v-model:value="model.value" :placeholder="$t('page.system.dictionary.valuePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.extend')" path="extend">
          <NInput v-model:value="model.extend" :placeholder="$t('page.system.dictionary.extendPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.parentId')" path="parentID">
          <NSelect
            v-model:value="model.parentID"
            :options="parentOptions"
            :placeholder="$t('page.system.dictionary.parentIdPlaceholder')"
            clearable
            filterable
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio :value="true">{{ $t('page.system.dictionary.enabled') }}</NRadio>
            <NRadio :value="false">{{ $t('page.system.dictionary.disabled') }}</NRadio>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.sort')" path="sort">
          <NInputNumber v-model:value="model.sort" :placeholder="$t('page.system.dictionary.sortPlaceholder')" :min="0" />
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
