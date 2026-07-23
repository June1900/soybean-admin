<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateParams, fetchUpdateParams, type Params, type ParamsForm } from '../api';

defineOptions({
  name: 'ParamsOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Params | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.params.editParam') : $t('page.system.params.addParam')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<ParamsForm>(createDefaultModel());

function createDefaultModel(): ParamsForm {
  return {
    name: '',
    key: '',
    value: '',
    desc: ''
  };
}

const rules: FormRules = {
  name: [{ required: true, message: $t('page.system.params.namePlaceholder'), trigger: 'blur' }],
  key: [{ required: true, message: $t('page.system.params.keyPlaceholder'), trigger: 'blur' }]
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
          key: props.editingData!.key,
          value: props.editingData!.value,
          desc: props.editingData!.desc
        }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: ParamsForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateParams(payload as ParamsForm & { ID: number })
      : await fetchCreateParams(payload as ParamsForm);

    if (!error) {
      window.$message?.success(isEdit ? $t('page.system.params.editSuccess') : $t('page.system.params.addSuccess'));
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
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="90">
        <NFormItem :label="$t('page.system.params.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.params.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.params.key')" path="key">
          <NInput v-model:value="model.key" :placeholder="$t('page.system.params.keyPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.params.value')" path="value">
          <NInput v-model:value="model.value" :placeholder="$t('page.system.params.valuePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.params.desc')" path="desc">
          <NInput
            v-model:value="model.desc"
            :placeholder="$t('page.system.params.descPlaceholder')"
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
