<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchLoginLogList,
  deleteLoginLog,
  deleteLoginLogByIds,
  type LoginLog,
  type LoginLogListQuery,
  type LoginLogSearchParams
} from './api';
import LoginLogSearch from './modules/login-log-search.vue';
import LoginLogViewDrawer from './modules/login-log-view-drawer.vue';

type LoginLogListApiResponse = Awaited<ReturnType<typeof fetchLoginLogList>>;

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemToolsLoginLog'
});

const appStore = useAppStore();

const searchParams = reactive<LoginLogSearchParams>({
  username: '',
  ip: '',
  status: null,
  startCreatedAt: '',
  endCreatedAt: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  LoginLogListApiResponse,
  LoginLog
>({
  api: () => fetchLoginLogList(getQueryParams()),
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

function getQueryParams(): LoginLogListQuery {
  const params: LoginLogListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.username) params.username = searchParams.username;
  if (searchParams.ip) params.ip = searchParams.ip;
  if (searchParams.status === 'success') params.status = true;
  else if (searchParams.status === 'fail') params.status = false;
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

const { checkedRowKeys, onDeleted, onBatchDeleted } = useTableOperate<LoginLog>(data, 'ID', getData);

const viewVisible = ref(false);
const viewData = ref<LoginLog | null>(null);

function openView(row: LoginLog) {
  viewData.value = row;
  viewVisible.value = true;
}

async function handleDelete(row: LoginLog) {
  const { error } = await deleteLoginLog(row.ID);
  if (!error) await onDeleted();
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const { error } = await deleteLoginLogByIds(ids);
  if (!error) await onBatchDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<LoginLog>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.opsMonitor.loginLog.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'username', title: $t('page.opsMonitor.loginLog.columns.username'), minWidth: 120 },
    { key: 'ip', title: $t('page.opsMonitor.loginLog.columns.ip'), minWidth: 130 },
    {
      key: 'status',
      title: $t('page.opsMonitor.loginLog.columns.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error', size: 'small', bordered: false },
          {
            default: () =>
              row.status ? $t('page.opsMonitor.loginLog.search.success') : $t('page.opsMonitor.loginLog.search.fail')
          }
        )
    },
    {
      key: 'detail',
      title: $t('page.opsMonitor.loginLog.columns.detail'),
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => row.errorMessage
    },
    { key: 'agent', title: $t('page.opsMonitor.loginLog.columns.agent'), minWidth: 180, ellipsis: { tooltip: true } },
    {
      key: 'CreatedAt',
      title: $t('page.opsMonitor.loginLog.columns.createdAt'),
      minWidth: 170,
      render: row => dayjs(row.CreatedAt).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      key: 'operation',
      title: $t('page.opsMonitor.loginLog.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 180,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.opsMonitor.loginLog.columns.view'),
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
    <LoginLogSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.opsMonitor.loginLog.title')"
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

    <LoginLogViewDrawer :visible="viewVisible" :data="viewData" @close="viewVisible = false" />
  </div>
</template>
