<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchSysErrorList,
  findSysError,
  deleteSysError,
  deleteSysErrorByIds,
  type SysError,
  type SysErrorLevel,
  type SysErrorListQuery,
  type SysErrorStatus,
  type SysErrorSearchParams
} from './api';
import SysErrorViewDrawer from './modules/sys-error-view-drawer.vue';
import SysErrorSearch from './modules/sys-error-search.vue';

type SysErrorListApiResponse = Awaited<ReturnType<typeof fetchSysErrorList>>;

import TableActionButtons from '@/components/common/table-action-buttons';
import { formatDateTime } from '@/utils/date';

defineOptions({
  name: 'SystemToolsSysError'
});

const appStore = useAppStore();

const searchParams = reactive<SysErrorSearchParams>({
  form: '',
  info: '',
  startCreatedAt: '',
  endCreatedAt: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  SysErrorListApiResponse,
  SysError
>({
  api: () => fetchSysErrorList(getQueryParams()),
  transform: res => {
    const body = res.data || { list: [], total: 0, page: 1, pageSize: 10 };
    return {
      data: body.list ?? [],
      total: body.total ?? 0,
      pageNum: body.page ?? 1,
      pageSize: body.pageSize ?? 10
    };
  },
  columns: () => createAllColumns(),
  immediate: false
});

function getQueryParams(): SysErrorListQuery {
  const params: SysErrorListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.form) params.form = searchParams.form;
  if (searchParams.info) params.info = searchParams.info;
  if (searchParams.startCreatedAt) params.startCreatedAt = searchParams.startCreatedAt;
  if (searchParams.endCreatedAt) params.endCreatedAt = searchParams.endCreatedAt;
  return params;
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

/* ---------- operate ---------- */
const { checkedRowKeys, onDeleted, onBatchDeleted } = useTableOperate<SysError>(data, 'ID', getData);

const viewVisible = ref(false);
const viewData = ref<SysError | null>(null);

async function openView(row: SysError) {
  const { data: detail, error } = await findSysError(row.ID);
  if (!error && detail) {
    viewData.value = detail;
    viewVisible.value = true;
  }
}

async function handleDelete(row: SysError) {
  const { error } = await deleteSysError(row.ID);
  if (!error) await onDeleted();
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  if (ids.length === 0) return;
  const { error } = await deleteSysErrorByIds(ids);
  if (!error) await onBatchDeleted();
}

const levelTagType: Record<SysErrorLevel, 'error' | 'warning'> = {
  fatal: 'error',
  error: 'warning'
};

const statusTagType: Record<SysErrorStatus, 'warning' | 'info' | 'success' | 'error'> = {
  未处理: 'info',
  处理中: 'warning',
  处理完成: 'success',
  处理失败: 'error'
};

function createAllColumns(): NaiveUI.TableColumn<SysError>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.opsMonitor.sysError.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    {
      key: 'CreatedAt',
      title: $t('page.opsMonitor.sysError.columns.createdAt'),
      width: 200,
      sorter: 'default',
      render: row => formatDateTime(row.CreatedAt)
    },
    {
      key: 'level',
      title: $t('page.opsMonitor.sysError.columns.level'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: levelTagType[row.level], size: 'small', bordered: false },
          { default: () => $t(`page.opsMonitor.sysError.level.${row.level}`) }
        )
    },
    {
      key: 'status',
      title: $t('page.opsMonitor.sysError.columns.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: statusTagType[row.status], size: 'small', bordered: false },
          { default: () => $t(`page.opsMonitor.sysError.status.${row.status}`) }
        )
    },
    { key: 'form', title: $t('page.opsMonitor.sysError.columns.form'), minWidth: 120 },
    { key: 'info', title: $t('page.opsMonitor.sysError.columns.info'), minWidth: 260, ellipsis: { tooltip: true } },
    {
      key: 'solution',
      title: $t('page.opsMonitor.sysError.columns.solution'),
      minWidth: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: 'operation',
      title: $t('page.opsMonitor.sysError.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 220,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.opsMonitor.sysError.columns.view'),
              icon: 'material-symbols:visibility',
              type: 'default',
              onClick: () => openView(row)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('common.confirmDelete'),
                onPositiveClick: () => handleDelete(row)
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
    <SysErrorSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.opsMonitor.sysError.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <div class="flex-center gap-8px">
          <NPopconfirm :disabled="checkedRowKeys.length === 0" @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton size="small" type="error" ghost :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <icon-ri-delete-bin-line class="text-16px" />
                </template>
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
          <NButton size="small" :loading="loading" @click="getData">
            <template #icon>
              <icon-ri-refresh-line class="text-16px" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
          <TableColumnSetting v-model:columns="columnChecks" />
        </div>
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="row => String(row.ID)"
        :flex-height="!appStore.isMobile"
        remote
        :scroll-x="scrollX"
        :pagination="mobilePagination"
        :bordered="false"
        class="sm:h-full"
      />
    </NCard>

    <SysErrorViewDrawer :visible="viewVisible" :data="viewData" @close="viewVisible = false" />
  </div>
</template>
