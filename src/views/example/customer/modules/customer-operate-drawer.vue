<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { $t } from '@/locales';
import { createCustomer, updateCustomer, type Customer, type CustomerForm } from '../api';

defineOptions({ name: 'CustomerOperateDrawer' });

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Customer | null;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const model = reactive<CustomerForm>({
  customerName: '',
  customerPhoneData: ''
});

const isEdit = computed(() => props.operateType === 'edit');

watch(
  () => props.visible,
  val => {
    if (val) {
      model.customerName = props.editingData?.customerName ?? '';
      model.customerPhoneData = props.editingData?.customerPhoneData ?? '';
    }
  }
);

async function handleSubmit() {
  if (!model.customerName.trim()) {
    window.$message?.warning($t('page.example.customer.drawer.customerName'));
    return;
  }
  const payload: CustomerForm = {
    customerName: model.customerName.trim(),
    customerPhoneData: model.customerPhoneData.trim()
  };
  if (isEdit.value && props.editingData) {
    const { error } = await updateCustomer(props.editingData.ID, payload);
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  } else {
    const { error } = await createCustomer(payload);
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }
  closeDrawer();
  emit('submitted');
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="400" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent
      :title="isEdit ? $t('page.example.customer.edit') : $t('page.example.customer.add')"
      :native-scrollbar="false"
    >
      <NForm label-placement="top">
        <NFormItem :label="$t('page.example.customer.drawer.customerName')" required>
          <NInput v-model:value="model.customerName" :placeholder="$t('page.example.customer.drawer.customerName')" />
        </NFormItem>
        <NFormItem :label="$t('page.example.customer.drawer.customerPhoneData')">
          <NInput
            v-model:value="model.customerPhoneData"
            :placeholder="$t('page.example.customer.drawer.customerPhoneData')"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('page.example.customer.drawer.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('page.example.customer.drawer.submit') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
