<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchLoginLogList,
  deleteLoginLog,
  type LoginLog,
  type LoginLogListQuery,
  type LoginLogSearchParams
} from './api';
import LoginLogSearch from './modules/login-log-search.vue';

type LoginLogListApiResponse = Awaited<ReturnType<typeof fetchLoginLogList>>;

defineOptions({
  name: 'SystemToolsLoginLog'
});

const appStore = useAppStore();

const searchParams = reactive<LoginLogSearchParams>({
  username: '',
  status: null
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
  if (searchParams.status) params.status = searchParams.status;
  return params;
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const { onDeleted } = useTableOperate<LoginLog>(data, 'ID', getData);

async function handleDelete(row: LoginLog) {
  const { error } = await deleteLoginLog(row.ID);
  if (!error) await onDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<LoginLog>[] {
  return [
    {
      key: 'index',
      title: $t('page.systemTools.loginLog.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.systemTools.loginLog.columns.id'), minWidth: 70 },
    { key: 'username', title: $t('page.systemTools.loginLog.columns.username'), minWidth: 120 },
    { key: 'ip', title: $t('page.systemTools.loginLog.columns.ip'), minWidth: 130 },
    {
      key: 'status',
      title: $t('page.systemTools.loginLog.columns.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error', size: 'small', bordered: false },
          {
            default: () =>
              row.status ? $t('page.systemTools.loginLog.search.success') : $t('page.systemTools.loginLog.search.fail')
          }
        )
    },
    {
      key: 'detail',
      title: $t('page.systemTools.loginLog.columns.detail'),
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => (row.status ? $t('page.systemTools.loginLog.search.success') : row.errorMessage)
    },
    { key: 'agent', title: $t('page.systemTools.loginLog.columns.agent'), minWidth: 180, ellipsis: { tooltip: true } },
    { key: 'CreatedAt', title: $t('page.systemTools.loginLog.columns.createdAt'), minWidth: 170 },
    {
      key: 'operation',
      title: $t('page.systemTools.loginLog.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 100,
      render: row =>
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDelete(row) },
          {
            trigger: () =>
              h(
                NButton,
                { size: 'small', tertiary: true, type: 'error' },
                { default: () => $t('page.systemTools.loginLog.columns.delete') }
              ),
            default: () => $t('common.confirmDelete')
          }
        )
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
      :title="$t('page.systemTools.loginLog.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <div class="flex-center gap-8px">
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
  </div>
</template>
