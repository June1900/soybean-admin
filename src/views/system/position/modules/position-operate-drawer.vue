<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NInputNumber, NSwitch, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreatePosition, fetchUpdatePosition, type Position, type PositionForm } from '../api';

defineOptions({
  name: 'PositionOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Position | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.position.editPosition') : $t('page.system.position.addPosition')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<PositionForm>(createDefaultModel());

function createDefaultModel(): PositionForm {
  return {
    name: '',
    code: '',
    sort: 0,
    status: true,
    remark: ''
  };
}

const rules: FormRules = {
  name: [{ required: true, message: $t('page.system.position.namePlaceholder'), trigger: 'blur' }],
  code: [{ required: true, message: $t('page.system.position.codePlaceholder'), trigger: 'blur' }]
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
              code: props.editingData!.code,
              sort: props.editingData!.sort,
              status: props.editingData!.status,
              remark: props.editingData!.remark
            }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: PositionForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdatePosition(payload as PositionForm & { ID: number })
      : await fetchCreatePosition(payload as PositionForm);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.position.editSuccess') : $t('page.system.position.addSuccess')
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
        <NFormItem :label="$t('page.system.position.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.position.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.position.code')" path="code">
          <NInput v-model:value="model.code" :placeholder="$t('page.system.position.codePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.position.sort')" path="sort">
          <NInputNumber v-model:value="model.sort" :placeholder="$t('page.system.position.sortPlaceholder')" :min="0" />
        </NFormItem>
        <NFormItem :label="$t('page.system.position.status')" path="status">
          <NSwitch v-model:value="model.status" :checked-value="true" :unchecked-value="false" />
        </NFormItem>
        <NFormItem :label="$t('page.system.position.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            :placeholder="$t('page.system.position.remarkPlaceholder')"
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
