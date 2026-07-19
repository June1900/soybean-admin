<script setup lang="ts">
import { computed, h, onMounted, reactive } from 'vue';
import { NButton, NPopconfirm, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteParams, fetchGetParamsList, type Params, type ParamsListQuery, type ParamsSearchParams } from './api';
import ParamsOperateDrawer from './modules/params-operate-drawer.vue';
import ParamsSearch from './modules/params-search.vue';

defineOptions({
  name: 'SystemParams'
});

const appStore = useAppStore();

/* ---------- search model ---------- */
const searchModel = reactive<ParamsSearchParams>({
  name: '',
  key: ''
});

/* ---------- table ---------- */
type ParamsListResponse = Awaited<ReturnType<typeof fetchGetParamsList>>;

function getQueryParams(): ParamsListQuery {
  return {
    name: searchModel.name || undefined,
    key: searchModel.key || undefined,
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
} = useNaivePaginatedTable<ParamsListResponse, Params>({
  api: () => fetchGetParamsList(getQueryParams()),
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
} = useTableOperate<Params>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteParams(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const results = await Promise.all(ids.map(id => fetchDeleteParams(id)));
  if (!results.some(r => r.error)) {
    await onBatchDeleted();
  }
}

onMounted(() => {
  getData();
});

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Params>[] {
  return [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.params.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'name', title: $t('page.system.params.name'), minWidth: 160 },
    { key: 'key', title: $t('page.system.params.key'), minWidth: 140 },
    { key: 'value', title: $t('page.system.params.value'), minWidth: 140, render: row => row.value || '-' },
    { key: 'desc', title: $t('page.system.params.desc'), minWidth: 180, render: row => row.desc || '-' },
    {
      key: 'operation',
      title: $t('page.system.params.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row =>
        h(NTooltip, {}, {
          trigger: () =>
            h(NSpace, { justify: 'center', size: 'small' }, {
              default: () => [
                h(NButton, { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEdit(row.ID) }, {
                  default: () => $t('page.system.params.editParam')
                }),
                h(NPopconfirm, { onPositiveClick: () => handleDelete(row.ID) }, {
                  trigger: () =>
                    h(NButton, { size: 'small', tertiary: true, type: 'error' }, {
                      default: () => $t('page.system.params.deleteParam')
                    }),
                  default: () => $t('page.system.params.confirmDelete')
                })
              ]
            }),
          default: () => $t('page.system.params.operation')
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ParamsSearch v-model:model="searchModel" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.params.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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

      <ParamsOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>
