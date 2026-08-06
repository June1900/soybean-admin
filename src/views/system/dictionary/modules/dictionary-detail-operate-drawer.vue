<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import {
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadioGroup,
  NRadio,
  NSelect,
  NSpace
} from 'naive-ui';
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
  defaultParentId?: number | null;
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
    parentID: undefined
  };
}

const rules: FormRules = {
  label: [{ required: true, message: $t('page.system.dictionary.labelPlaceholder'), trigger: 'blur' }],
  value: [{ required: true, message: $t('page.system.dictionary.valuePlaceholder'), trigger: 'blur' }],
  sort: [
    {
      required: true,
      type: 'number',
      message: $t('page.system.dictionary.sortPlaceholder'),
      trigger: ['input', 'blur']
    }
  ]
};

/** "无父级"选项的哨兵值（真实字典项 ID 均为正数） */
const NO_PARENT = '__no_parent__';

/** 拍平（可能嵌套的）字典项树，便于作为父级候选 */
function flattenDetails(items: DictionaryDetail[]): DictionaryDetail[] {
  const result: DictionaryDetail[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children?.length) result.push(...flattenDetails(item.children));
  }
  return result;
}

const parentOptions = computed<SelectOption[]>(() => {
  const nodes = flattenDetails(props.details).filter(
    item => !(props.operateType === 'edit' && props.editingData && item.ID === props.editingData.ID)
  );
  return [
    { label: $t('page.system.dictionary.noParent'), value: NO_PARENT },
    ...nodes.map(item => ({ label: `${item.label}（${item.value}）`, value: item.ID }))
  ];
});

const parentIdForSelect = computed<number | string>({
  get: () => (model.value.parentID == null ? NO_PARENT : model.value.parentID),
  set: val => {
    model.value.parentID = val === NO_PARENT ? null : (val as number);
  }
});

/** 排序数字的显式代理，强制写回响应式 model */
const sortModel = computed<number | null>({
  get: () => model.value.sort ?? null,
  set: val => {
    model.value.sort = val ?? 1;
  }
});

watch(
  () => props.visible,
  val => {
    if (!val) {
      // 关闭时重置校验状态，避免下次打开残留错误提示
      formRef.value?.restoreValidation();
      return;
    }
    const editing = props.operateType === 'edit' && props.editingData;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          label: props.editingData!.label,
          value: props.editingData!.value,
          extend: props.editingData!.extend ?? '',
          status: props.editingData!.status,
          sort: Number.isFinite(Number(props.editingData!.sort)) ? Number(props.editingData!.sort) : 1,
          parentID: props.editingData!.parentID ?? undefined
        }
      : { ...createDefaultModel(), parentID: props.defaultParentId ?? undefined };
  }
);

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    // 校验失败，Naive UI 已就地显示字段错误，直接终止提交
    return;
  }

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
  <NDrawer :show="props.visible" display-directive="show" :width="480" @update:show="val => !val && emit('close')">
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
            v-model:value="parentIdForSelect"
            :options="parentOptions"
            :placeholder="$t('page.system.dictionary.parentIdPlaceholder')"
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
          <NInputNumber
            v-model:value="sortModel"
            :placeholder="$t('page.system.dictionary.sortPlaceholder')"
            :min="0"
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
