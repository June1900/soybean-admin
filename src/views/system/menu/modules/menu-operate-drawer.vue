<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadioGroup,
  NRadioButton,
  NSwitch,
  type FormInst
} from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateMenu, fetchGetMenuList, fetchUpdateMenu, type Menu, type MenuForm } from '../api';

defineOptions({
  name: 'MenuOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Menu | null;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.menu.editMenu') : $t('page.system.menu.addMenu')
);

const formRef = ref<FormInst | null>(null);
const model = ref<MenuForm>(createDefaultModel());
const saving = ref(false);
const parentOptions = ref<{ label: string; value: number }[]>([]);

function createDefaultModel(): MenuForm {
  return {
    path: '',
    name: '',
    component: '',
    parentId: 0,
    sort: 0,
    hidden: false,
    meta: {
      title: '',
      icon: '',
      keepAlive: false,
      closeTab: false,
      defaultMenu: false
    }
  };
}

function flatten(list: Menu[] = [], acc: Menu[] = []): Menu[] {
  for (const item of list) {
    acc.push(item);
    if (item.children?.length) flatten(item.children, acc);
  }
  return acc;
}

async function loadParentOptions(excludeId?: number) {
  const { data } = await fetchGetMenuList({ page: 1, pageSize: 9999 });
  const all = flatten(data?.list ?? []);
  parentOptions.value = all
    .filter(m => m.ID !== excludeId)
    .map(m => ({ label: m.meta?.title || m.name, value: m.ID }));
}

watch(
  () => props.visible,
  val => {
    if (val) {
      const editing = props.operateType === 'edit' && props.editingData;
      model.value = editing
        ? {
            ID: props.editingData!.ID,
            path: props.editingData!.path,
            name: props.editingData!.name,
            component: props.editingData!.component,
            parentId: props.editingData!.parentId,
            sort: props.editingData!.sort,
            hidden: props.editingData!.hidden,
            meta: { ...props.editingData!.meta }
          }
        : createDefaultModel();
      loadParentOptions(editing ? props.editingData!.ID : undefined);
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  saving.value = true;
  const payload: MenuForm & { ID?: number } = { ...model.value };
  const isEdit = props.operateType === 'edit';
  if (!isEdit) delete (payload as { ID?: number }).ID;

  const { error } = isEdit
    ? await fetchUpdateMenu(payload as MenuForm & { ID: number })
    : await fetchCreateMenu(payload as MenuForm);

  saving.value = false;
  if (!error) {
    window.$message?.success(
      isEdit ? $t('page.system.menu.editSuccess') : $t('page.system.menu.addSuccess')
    );
    emit('submitted');
    emit('close');
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
      <NForm ref="formRef" :model="model" label-placement="left" :label-width="100">
        <NFormItem :label="$t('page.system.menu.titleField')" path="meta.title">
          <NInput v-model:value="model.meta.title" :placeholder="$t('page.system.menu.titlePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.menu.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.path')" path="path">
          <NInput v-model:value="model.path" :placeholder="$t('page.system.menu.pathPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.component')" path="component">
          <NInput v-model:value="model.component" :placeholder="$t('page.system.menu.componentPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.parentId')" path="parentId">
          <NSelect
            v-model:value="model.parentId"
            :options="parentOptions"
            :placeholder="$t('page.system.menu.parentIdPlaceholder')"
            clearable
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.sort')" path="sort">
          <NInputNumber v-model:value="model.sort" :placeholder="$t('page.system.menu.sortPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.icon')" path="meta.icon">
          <NInput v-model:value="model.meta.icon" :placeholder="$t('page.system.menu.iconPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.visibility')" path="hidden">
          <NRadioGroup v-model:value="model.hidden">
            <NRadioButton :value="false">{{ $t('page.system.menu.show') }}</NRadioButton>
            <NRadioButton :value="true">{{ $t('page.system.menu.hidden') }}</NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.keepAlive')" path="meta.keepAlive">
          <NSwitch v-model:value="model.meta.keepAlive" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.closeTab')" path="meta.closeTab">
          <NSwitch v-model:value="model.meta.closeTab" />
        </NFormItem>
        <NFormItem :label="$t('page.system.menu.defaultMenu')" path="meta.defaultMenu">
          <NSwitch v-model:value="model.meta.defaultMenu" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="saving" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
