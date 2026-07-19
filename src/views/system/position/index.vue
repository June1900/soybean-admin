<script setup lang="ts">
import { computed, h, onMounted, reactive } from 'vue';
import { NButton, NPopconfirm, NTag, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeletePosition, fetchGetPositionList, type Position, type PositionListQuery, type PositionSearchParams } from './api';
import PositionOperateDrawer from './modules/position-operate-drawer.vue';
import PositionSearch from './modules/position-search.vue';

defineOptions({
  name: 'SystemPosition'
});

const appStore = useAppStore();

/* ---------- search model ---------- */
const searchModel = reactive<PositionSearchParams>({
  name: ''
});

/* ---------- table ---------- */
type PositionListResponse = Awaited<ReturnType<typeof fetchGetPositionList>>;

function getQueryParams(): PositionListQuery {
  return {
    name: searchModel.name || undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

const {
  data,
  columns,
  columnChecks,
  getData,
  getDataByPage,
  loading,
  mobilePagination
} = useNaivePaginatedTable<PositionListResponse, Position>({
  api: () => fetchGetPositionList(getQueryParams()),
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
} = useTableOperate<Position>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeletePosition(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const results = await Promise.all(ids.map(id => fetchDeletePosition(id)));
  if (!results.some(r => r.error)) {
    await onBatchDeleted();
  }
}

onMounted(() => {
  getData();
});

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Position>[] {
  return [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.position.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'name', title: $t('page.system.position.name'), minWidth: 160 },
    { key: 'code', title: $t('page.system.position.code'), minWidth: 140, render: row => row.code || '-' },
    { key: 'sort', title: $t('page.system.position.sort'), width: 80, align: 'center', render: row => row.sort ?? '-' },
    {
      key: 'status',
      title: $t('page.system.position.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.status === 1 ? 'success' : 'default', bordered: false },
          { default: () => (row.status === 1 ? $t('page.system.position.enabled') : $t('page.system.position.disabled')) }
        )
    },
    { key: 'remark', title: $t('page.system.position.remark'), minWidth: 180, render: row => row.remark || '-' },
    {
      key: 'operation',
      title: $t('page.system.position.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row =>
        h(NTooltip, {}, {
          trigger: () =>
            h(NSpace, { justify: 'center', size: 'small' }, {
              default: () => [
                h(NButton, { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEdit(row.ID) }, {
                  default: () => $t('page.system.position.editPosition')
                }),
                h(NPopconfirm, { onPositiveClick: () => handleDelete(row.ID) }, {
                  trigger: () =>
                    h(NButton, { size: 'small', tertiary: true, type: 'error' }, {
                      default: () => $t('page.system.position.deletePosition')
                    }),
                  default: () => $t('page.system.position.confirmDelete')
                })
              ]
            }),
          default: () => $t('page.system.position.operation')
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PositionSearch v-model:model="searchModel" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.position.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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

      <PositionOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>
