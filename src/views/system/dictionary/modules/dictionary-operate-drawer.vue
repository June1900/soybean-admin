<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NRadioGroup, NRadio, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateDictionary, fetchUpdateDictionary, type Dictionary, type DictionaryForm } from '../api';

defineOptions({
  name: 'DictionaryOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Dictionary | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit'
    ? $t('page.system.dictionary.editDictionary')
    : $t('page.system.dictionary.addDictionary')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<DictionaryForm>(createDefaultModel());

function createDefaultModel(): DictionaryForm {
  return {
    name: '',
    type: '',
    status: true,
    desc: ''
  };
}

const rules: FormRules = {
  name: [{ required: true, message: $t('page.system.dictionary.namePlaceholder'), trigger: 'blur' }],
  type: [{ required: true, message: $t('page.system.dictionary.typePlaceholder'), trigger: 'blur' }]
};

watch(
  () => props.visible,
  val => {
    if (!val) return;
    const editing = props.operateType === 'edit' && props.editingData;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          name: props.editingData!.name,
          type: props.editingData!.type,
          status: props.editingData!.status,
          desc: props.editingData!.desc ?? ''
        }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: DictionaryForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateDictionary(payload as DictionaryForm & { ID: number })
      : await fetchCreateDictionary(payload as DictionaryForm);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.dictionary.editDictSuccess') : $t('page.system.dictionary.addDictSuccess')
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
  <NDrawer :show="props.visible" display-directive="show" :width="480" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem :label="$t('page.system.dictionary.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.dictionary.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.type')" path="type">
          <NInput v-model:value="model.type" :placeholder="$t('page.system.dictionary.typePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio :value="true">{{ $t('page.system.dictionary.enabled') }}</NRadio>
            <NRadio :value="false">{{ $t('page.system.dictionary.disabled') }}</NRadio>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.system.dictionary.desc')" path="desc">
          <NInput
            v-model:value="model.desc"
            :placeholder="$t('page.system.dictionary.descPlaceholder')"
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
