<script setup lang="ts">
import { computed, h, onMounted, reactive } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteApi, fetchGetApiList, type Api, type ApiListQuery, type ApiSearchParams } from './api';
import ApiOperateDrawer from './modules/api-operate-drawer.vue';
import ApiSearch from './modules/api-search.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemApi'
});

const appStore = useAppStore();

/* ---------- table ---------- */
type ApiListResponse = Awaited<ReturnType<typeof fetchGetApiList>>;

const methodTagType = (method: string): 'success' | 'primary' | 'warning' | 'error' | 'info' | 'default' => {
  switch (method) {
    case 'GET':
      return 'success';
    case 'POST':
      return 'primary';
    case 'PUT':
      return 'warning';
    case 'DELETE':
      return 'error';
    case 'PATCH':
      return 'info';
    default:
      return 'default';
  }
};

const searchParams = reactive<ApiSearchParams>({
  path: '',
  apiGroup: '',
  method: ''
});

function getQueryParams(): ApiListQuery {
  return {
    path: searchParams.path || undefined,
    apiGroup: searchParams.apiGroup || undefined,
    method: searchParams.method || undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  ApiListResponse,
  Api
>({
  api: () => fetchGetApiList(getQueryParams()),
  transform: res => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? 1,
    pageSize: res.data?.pageSize ?? 10
  }),
  columns: () => createAllColumns(),
  immediate: false
});

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

/* ---------- operate (add / edit / delete) ---------- */
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
} = useTableOperate<Api>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteApi(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  for (const id of checkedRowKeys.value.map(id => Number(id))) {
    // eslint-disable-next-line no-await-in-loop
    await fetchDeleteApi(id);
  }
  await onBatchDeleted();
}

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Api>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.system.api.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'path', title: $t('page.system.api.path'), minWidth: 200 },
    { key: 'apiGroup', title: $t('page.system.api.apiGroup'), minWidth: 140 },
    { key: 'description', title: $t('page.system.api.description'), minWidth: 180 },
    {
      key: 'method',
      title: $t('page.system.api.method'),
      width: 120,
      align: 'center',
      render: row =>
        h(NTag, { type: methodTagType(row.method), size: 'small', bordered: false }, { default: () => row.method })
    },
    {
      key: 'operation',
      title: $t('page.system.api.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'primary',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.system.api.confirmDelete'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
    }
  ];
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ApiSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.api.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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

      <ApiOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
