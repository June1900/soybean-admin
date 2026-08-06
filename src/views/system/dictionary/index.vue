<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import type { PaginationData } from '@sa/hooks';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import {
  fetchDeleteDictionary,
  fetchGetDictionaryPage,
  type Dictionary,
  type DictionaryPageQuery,
  type DictionarySearchParams
} from './api';
import DictionaryOperateDrawer from './modules/dictionary-operate-drawer.vue';
import DictionaryDetailDrawer from './modules/dictionary-detail-drawer.vue';
import DictionarySearch from './modules/dictionary-search.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemDictionary'
});

const appStore = useAppStore();

/* 搜索条件 */
const searchParams = reactive<DictionarySearchParams>({
  name: '',
  type: ''
});

/* 字典列表 */
type DictListResponse = Awaited<ReturnType<typeof fetchGetDictionaryPage>>;

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  DictListResponse,
  Dictionary
>({
  api: () => fetchGetDictionaryPage(getQueryParams()),
  // 分页接口返回真实服务端分页数据，直接映射即可
  transform: (res): PaginationData<Dictionary> => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? mobilePagination.value.page ?? 1,
    pageSize: res.data?.pageSize ?? mobilePagination.value.pageSize ?? 10
  }),
  columns: () => createAllColumns()
});

function getQueryParams(): DictionaryPageQuery {
  return {
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize,
    name: searchParams.name || undefined,
    type: searchParams.type || undefined
  };
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const {
  drawerVisible,
  closeDrawer,
  operateType,
  handleAdd,
  editingData,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate<Dictionary>(data, 'ID', getData);

/* 字典详情抽屉 */
const detailDrawerVisible = ref(false);
const detailDict = ref<{ id: number; name: string } | null>(null);

function openDetailDrawer(row: Dictionary) {
  detailDict.value = { id: row.ID, name: row.name };
  detailDrawerVisible.value = true;
}

function closeDetailDrawer() {
  detailDrawerVisible.value = false;
  detailDict.value = null;
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteDictionary(id);
  if (!error) {
    // 若详情抽屉正在展示被删除的字典，则一并关闭
    if (detailDict.value?.id === id) closeDetailDrawer();
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(Number);
  for (const id of ids) {
    const { error } = await fetchDeleteDictionary(id);
    if (error) return;
  }
  await onBatchDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<Dictionary>[] {
  return [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.dictionary.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'name', title: $t('page.system.dictionary.name'), minWidth: 140 },
    { key: 'type', title: $t('page.system.dictionary.type'), minWidth: 140 },
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
    { key: 'desc', title: $t('page.system.dictionary.desc'), minWidth: 160, render: row => row.desc || '-' },
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
              label: $t('page.system.dictionary.detail'),
              icon: 'ri:eye-line',
              type: 'info',
              onClick: () => openDetailDrawer(row)
            },
            {
              kind: 'edit',
              icon: 'ri:edit-line',
              type: 'primary',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'ri:delete-bin-line',
              type: 'error',
              popconfirm: {
                content: $t('page.system.dictionary.confirmDeleteDictionary'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DictionarySearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.system.dictionary.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => String(row.ID)"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>

    <DictionaryOperateDrawer
      :visible="drawerVisible"
      :operate-type="operateType"
      :editing-data="editingData"
      @close="closeDrawer"
      @submitted="getDataByPage"
    />

    <DictionaryDetailDrawer
      :visible="detailDrawerVisible"
      :dict-id="detailDict?.id ?? null"
      :dict-name="detailDict?.name ?? ''"
      @close="closeDetailDrawer"
    />
  </div>
</template>
