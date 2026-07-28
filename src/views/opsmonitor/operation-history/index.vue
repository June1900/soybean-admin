<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { formatDateTime } from '@/utils/date';
import {
  fetchOperationRecordList,
  deleteOperationRecord,
  deleteOperationRecordByIds,
  type OperationRecord,
  type OperationRecordListQuery,
  type OperationRecordSearchParams
} from './api';
import OperationHistoryViewDrawer from './modules/operation-history-view-drawer.vue';
import OperationHistorySearch from './modules/operation-history-search.vue';

type OperationHistoryListApiResponse = Awaited<ReturnType<typeof fetchOperationRecordList>>;

import TableActionButtons from '@/components/common/table-action-buttons';
import { statusTagType } from '@/views/opsmonitor/operation-history/share';

defineOptions({
  name: 'OpsMonitorOperationHistory'
});

const appStore = useAppStore();

const searchParams = reactive<OperationRecordSearchParams>({
  method: '',
  path: '',
  status: '',
  startCreatedAt: '',
  endCreatedAt: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  OperationHistoryListApiResponse,
  OperationRecord
>({
  api: () => fetchOperationRecordList(getQueryParams()),
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

function getQueryParams(): OperationRecordListQuery {
  const params: OperationRecordListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.method) params.method = searchParams.method;
  if (searchParams.path) params.path = searchParams.path;
  if (searchParams.status) params.status = searchParams.status;
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

const { checkedRowKeys, onDeleted, onBatchDeleted } = useTableOperate<OperationRecord>(data, 'ID', getData);

const viewVisible = ref(false);
const viewData = ref<OperationRecord | null>(null);

function openView(row: OperationRecord) {
  viewData.value = row;
  viewVisible.value = true;
}

async function handleDelete(row: OperationRecord) {
  const { error } = await deleteOperationRecord(row.ID);
  if (!error) await onDeleted();
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  if (ids.length === 0) return;
  const { error } = await deleteOperationRecordByIds(ids);
  if (!error) await onBatchDeleted();
}

/** 操作人显示：userName(nickName) */
function operatorLabel(row: OperationRecord): string {
  if (!row.user) return '-';
  const { userName, nickName } = row.user;
  return nickName ? `${userName}(${nickName})` : userName;
}

/** 设备ID / 请求体 / 响应体的空值占位 */
function displayField(val: string): string {
  if (!val || val === '') return $t('page.opsMonitor.operationHistory.placeholder.none');
  return val;
}

function createAllColumns(): NaiveUI.TableColumn<OperationRecord>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.opsMonitor.operationHistory.columns.index'),
      width: 64,
      align: 'center',
      render: (_row, index) => index + 1
    },
    {
      key: 'operator',
      title: $t('page.opsMonitor.operationHistory.columns.operator'),
      width: 140,
      render: row => operatorLabel(row)
    },
    {
      key: 'CreatedAt',
      title: $t('page.opsMonitor.operationHistory.columns.createdAt'),
      width: 180,
      sorter: 'default',
      render: row => formatDateTime(row.CreatedAt)
    },
    {
      key: 'status',
      title: $t('page.opsMonitor.operationHistory.columns.statusCode'),
      width: 90,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: statusTagType(row.status), size: 'small', bordered: false },
          { default: () => String(row.status) }
        )
    },
    {
      key: 'ip',
      title: $t('page.opsMonitor.operationHistory.columns.ip'),
      width: 130,
      ellipsis: { tooltip: true }
    },
    {
      key: 'method',
      title: $t('page.opsMonitor.operationHistory.columns.method'),
      width: 100,
      align: 'center',
      render: row => h(NTag, { type: 'default', size: 'small', bordered: false }, { default: () => row.method })
    },
    {
      key: 'path',
      title: $t('page.opsMonitor.operationHistory.columns.path'),
      minWidth: 200,
      ellipsis: { tooltip: true }
    },
    {
      key: 'request_id',
      title: $t('page.opsMonitor.operationHistory.columns.requestId'),
      width: 220,
      ellipsis: { tooltip: true },
      render: row => (row.request_id ? row.request_id : '-')
    },
    {
      key: 'trace_id',
      title: $t('page.opsMonitor.operationHistory.columns.traceId'),
      width: 220,
      ellipsis: { tooltip: true },
      render: row => (row.trace_id ? row.trace_id : '-')
    },
    {
      key: 'device_id',
      title: $t('page.opsMonitor.operationHistory.columns.deviceId'),
      width: 100,
      align: 'center',
      render: row => displayField(row.device_id)
    },
    {
      key: 'operation',
      title: $t('page.opsMonitor.operationHistory.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 180,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.opsMonitor.operationHistory.columns.view'),
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
    <OperationHistorySearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.opsMonitor.operationHistory.title')"
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
                  <icon-ic-round-delete class="text-16px" />
                </template>
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
          <NButton size="small" :loading="loading" @click="getData">
            <template #icon>
              <icon-mdi-refresh class="text-16px" />
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

    <OperationHistoryViewDrawer :visible="viewVisible" :data="viewData" @close="viewVisible = false" />
  </div>
</template>
