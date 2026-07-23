<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules } from 'naive-ui';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateDepartment, fetchUpdateDepartment, type Department, type DepartmentForm } from '../api';

defineOptions({
  name: 'DepartmentOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Department | null;
  parentOptions: { label: string; value: number }[];
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.department.editDept') : $t('page.system.department.addDept')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const model = ref<DepartmentForm>(createDefaultModel());

function createDefaultModel(): DepartmentForm {
  return {
    name: '',
    parentId: 0,
    leader: '',
    sort: 0,
    status: 1
  };
}

const rules: FormRules = {
  name: [{ required: true, message: $t('page.system.department.namePlaceholder'), trigger: 'blur' }]
};

const parentSelectOptions = computed(() => props.parentOptions.filter(o => o.value !== (props.editingData?.ID ?? -1)));

watch(
  () => props.visible,
  val => {
    if (!val) return;
    const editing = props.operateType === 'edit' && props.editingData;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          name: props.editingData!.name,
          parentId: props.editingData!.parentId,
          leader: props.editingData!.leader,
          sort: props.editingData!.sort,
          status: props.editingData!.status
        }
      : createDefaultModel();
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const payload: DepartmentForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateDepartment(payload as DepartmentForm & { ID: number })
      : await fetchCreateDepartment(payload as DepartmentForm);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.department.editSuccess') : $t('page.system.department.addSuccess')
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
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="90">
        <NFormItem :label="$t('page.system.department.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.department.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.department.parentId')" path="parentId">
          <NSelect
            v-model:value="model.parentId"
            :options="parentSelectOptions"
            :placeholder="$t('page.system.department.parentIdPlaceholder')"
            clearable
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.department.leader')" path="leader">
          <NInput v-model:value="model.leader" :placeholder="$t('page.system.department.leaderPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.department.sort')" path="sort">
          <NInputNumber
            v-model:value="model.sort"
            :placeholder="$t('page.system.department.sortPlaceholder')"
            :min="0"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.department.status')" path="status">
          <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2" />
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
