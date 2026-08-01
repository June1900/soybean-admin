<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { NButton, NDataTable, NDrawer, NDrawerContent, NSpace, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useTableOperate } from '@/hooks/common/table';
import { fetchDeleteDictionaryDetail, fetchGetDictionaryDetailList, type DictionaryDetail } from '../api';
import TableActionButtons from '@/components/common/table-action-buttons';
import DictionaryDetailOperateDrawer from './dictionary-detail-operate-drawer.vue';

defineOptions({
  name: 'DictionaryDetailDrawer'
});

const props = defineProps<{
  visible: boolean;
  dictId: number | null;
  dictName: string;
}>();

const emit = defineEmits<{ close: [] }>();

const appStore = useAppStore();

/* 字典项数据 */
const detailData = ref<DictionaryDetail[]>([]);
const detailLoading = ref(false);

async function getDetailData() {
  if (!props.dictId) {
    detailData.value = [];
    return;
  }
  detailLoading.value = true;
  const { data, error } = await fetchGetDictionaryDetailList({ sysDictionaryID: props.dictId });
  if (!error) detailData.value = data?.list ?? [];
  detailLoading.value = false;
}

// 抽屉打开时加载字典项
watch(
  () => props.visible,
  val => {
    if (val && props.dictId) getDetailData();
  }
);

/* 字典项新增/编辑 */
const {
  drawerVisible: formDrawerVisible,
  closeDrawer: closeFormDrawer,
  operateType: formOperateType,
  handleAdd: handleAddDetail,
  editingData: detailEditingData,
  handleEdit: handleEditDetail,
  onDeleted: onDetailDeleted
} = useTableOperate<DictionaryDetail>(detailData, 'ID', getDetailData);

const defaultParentId = ref<number | null>(null);

function handleAddDetailClick() {
  defaultParentId.value = null;
  handleAddDetail();
}

function handleAddChild(row: DictionaryDetail) {
  defaultParentId.value = row.ID;
  handleAddDetail();
}

function closeFormDrawerAndReset() {
  closeFormDrawer();
  defaultParentId.value = null;
}

function handleClose() {
  emit('close');
}

async function handleDeleteDetail(id: number) {
  const { error } = await fetchDeleteDictionaryDetail(id);
  if (!error) await onDetailDeleted();
}

/* 表格列 */
const drawerTitle = computed(() =>
  props.dictName
    ? `${$t('page.system.dictionary.detailTitle')}（${props.dictName}）`
    : $t('page.system.dictionary.detailTitle')
);

const drawerWidth = computed(() => (appStore.isMobile ? '100%' : 900));

function createDetailColumns(): NaiveUI.TableColumn<DictionaryDetail>[] {
  return [
    { key: 'label', title: $t('page.system.dictionary.label'), minWidth: 200, tree: true },
    { key: 'value', title: $t('page.system.dictionary.value'), minWidth: 140 },
    { key: 'extend', title: $t('page.system.dictionary.extend'), minWidth: 120, render: row => row.extend || '-' },
    {
      key: 'status',
      title: $t('page.system.dictionary.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error' },
          { default: () => (row.status ? $t('page.system.dictionary.enabled') : $t('page.system.dictionary.disabled')) }
        )
    },
    { key: 'sort', title: $t('page.system.dictionary.sort'), width: 90, align: 'center' },
    {
      key: 'operation',
      title: $t('page.system.dictionary.operation'),
      align: 'center',
      fixed: 'right',
      width: 280,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.system.dictionary.addChildDetail'),
              icon: 'ri:add-line',
              type: 'primary',
              onClick: () => handleAddChild(row)
            },
            {
              label: $t('page.system.dictionary.modifyDetail'),
              icon: 'ri:edit-line',
              type: 'info',
              onClick: () => handleEditDetail(row.ID)
            },
            {
              kind: 'delete',
              icon: 'ri:delete-bin-line',
              type: 'error',
              popconfirm: {
                content: $t('page.system.dictionary.confirmDeleteDetail'),
                onPositiveClick: () => handleDeleteDetail(row.ID)
              }
            }
          ]
        })
    }
  ];
}

const detailColumns = computed(() => createDetailColumns());
const detailScrollX = computed(() =>
  detailColumns.value.reduce(
    (acc, col) =>
      acc +
      Number(
        (col as { minWidth?: number; width?: number }).minWidth ??
          (col as { minWidth?: number; width?: number }).width ??
          120
      ),
    0
  )
);
</script>

<template>
  <NDrawer
    :show="props.visible"
    display-directive="show"
    :width="drawerWidth"
    @update:show="val => !val && emit('close')"
  >
    <NDrawerContent :native-scrollbar="false">
      <template #header>
        <div class="flex w-full items-center justify-between">
          <span class="text-16px font-500">{{ drawerTitle }}</span>
          <NSpace>
            <NButton size="small" :loading="detailLoading" @click="getDetailData">
              {{ $t('page.system.dictionary.refresh') }}
            </NButton>
            <NButton size="small" type="primary" @click="handleAddDetailClick">
              {{ $t('page.system.dictionary.addDetail') }}
            </NButton>
          </NSpace>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end">
          <NButton size="small" @click="handleClose">
            {{ $t('common.close') }}
          </NButton>
        </div>
      </template>

      <NDataTable
        :columns="detailColumns"
        :data="detailData"
        :loading="detailLoading"
        :row-key="row => String(row.ID)"
        :scroll-x="detailScrollX"
        :default-expand-all="true"
        max-height="calc(100vh - 200px)"
        size="small"
        :bordered="false"
      />

      <DictionaryDetailOperateDrawer
        :visible="formDrawerVisible"
        :operate-type="formOperateType"
        :editing-data="detailEditingData"
        :dict-id="props.dictId"
        :details="detailData"
        :default-parent-id="defaultParentId"
        @close="closeFormDrawerAndReset"
        @submitted="getDetailData"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
