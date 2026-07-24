<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NSwitch, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import {
  fetchGetTimedTaskList,
  fetchDeleteTimedTask,
  fetchToggleTimedTask,
  fetchTriggerTimedTask,
  fetchGetTimedTaskLogList,
  type TimedTask,
  type TimedTaskLog,
  type TimedTaskSearchParams
} from './api';
import TimedTaskOperateDrawer from './modules/timed-task-operate-drawer.vue';
import TimedTaskSearch from './modules/timed-task-search.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemToolsTimedTask'
});

const appStore = useAppStore();

/* ---------- search ---------- */
const searchParams = reactive<TimedTaskSearchParams>({
  name: '',
  executorType: ''
});

/* ---------- table ---------- */
type TimedTaskListApiResponse = Awaited<ReturnType<typeof fetchGetTimedTaskList>>;

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  TimedTaskListApiResponse,
  TimedTask
>({
  api: () => fetchGetTimedTaskList(getQueryParams() as any),
  transform: res => {
    const body = res.data || { list: [], total: 0, page: 1, pageSize: 10 };
    return {
      data: body.list ?? [],
      total: body.total ?? 0,
      pageNum: body.page ?? 1,
      pageSize: body.pageSize ?? 10
    };
  },
  columns: () => createAllColumns()
});

const scrollX = computed(() =>
  columns.value.reduce(
    (acc, col) =>
      acc +
      ((col as { width?: number; minWidth?: number }).width ??
        (col as { width?: number; minWidth?: number }).minWidth ??
        120),
    0
  )
);

function getQueryParams() {
  const params: Record<string, unknown> = {
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
  if (searchParams.name) params.name = searchParams.name;
  if (searchParams.executorType) params.executorType = searchParams.executorType;
  return params;
}

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
} = useTableOperate<TimedTask>(data, 'ID', getData);

/* ---------- row actions ---------- */
async function handleToggle(row: TimedTask, enabled: boolean) {
  const { error } = await fetchToggleTimedTask(row.ID, enabled);
  if (!error) {
    window.$message?.success(
      enabled ? $t('page.systemTools.timedTask.enable') : $t('page.systemTools.timedTask.disable')
    );
  }
  await getData();
}

async function handleTrigger(row: TimedTask) {
  const { error } = await fetchTriggerTimedTask(row.ID);
  if (!error) {
    window.$message?.success($t('page.systemTools.timedTask.triggerSuccess'));
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteTimedTask(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id)) as number[];
  for (const id of ids) {
    const { error } = await fetchDeleteTimedTask(id);
    if (error) return;
  }
  await onBatchDeleted();
}

/* ---------- log drawer (separate pagination) ---------- */
const logVisible = ref(false);
const logData = ref<TimedTaskLog[]>([]);
const logLoading = ref(false);
const logTaskName = ref('');
const logPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30],
  onUpdatePage(page: number) {
    logPagination.page = page;
    loadLogs();
  },
  onUpdatePageSize(size: number) {
    logPagination.pageSize = size;
    logPagination.page = 1;
    loadLogs();
  }
});

const logTaskId = ref(0);

async function loadLogs() {
  logLoading.value = true;
  const { data: resp, error } = await fetchGetTimedTaskLogList({
    page: logPagination.page,
    pageSize: logPagination.pageSize,
    taskId: logTaskId.value
  });
  logLoading.value = false;
  if (!error && resp) {
    logData.value = resp.list ?? [];
    logPagination.itemCount = resp.total ?? 0;
  }
}

function openLogs(row: TimedTask) {
  logTaskId.value = row.ID;
  logTaskName.value = row.name;
  logPagination.page = 1;
  logVisible.value = true;
  loadLogs();
}

const logColumns: NaiveUI.TableColumn<TimedTaskLog>[] = [
  {
    type: 'expand',
    renderExpand: (row: TimedTaskLog) => {
      if (row.errorMsg)
        return h(
          'p',
          { class: 'text-red-500 break-all p-4' },
          `${$t('page.systemTools.timedTask.log.error')}：${row.errorMsg}`
        );
      if (row.output)
        return h('p', { class: 'break-all mt-1 p-4' }, `${$t('page.systemTools.timedTask.log.output')}：${row.output}`);
      return h('p', { class: 'text-gray-400 p-4' }, $t('page.systemTools.timedTask.log.noDetail'));
    }
  },
  {
    key: 'triggerType',
    title: $t('page.systemTools.timedTask.log.trigger'),
    width: 90,
    render: (row: TimedTaskLog) =>
      h(
        NTag,
        { type: row.triggerType === 'auto' ? 'info' : 'warning', size: 'small', bordered: false },
        {
          default: () =>
            row.triggerType === 'auto'
              ? $t('page.systemTools.timedTask.log.auto')
              : $t('page.systemTools.timedTask.log.manual')
        }
      )
  },
  {
    key: 'status',
    title: $t('page.systemTools.timedTask.log.status'),
    width: 90,
    render: (row: TimedTaskLog) =>
      h(
        NTag,
        { type: row.status === 'success' ? 'success' : 'error', size: 'small', bordered: false },
        {
          default: () =>
            row.status === 'success'
              ? $t('page.systemTools.timedTask.log.success')
              : $t('page.systemTools.timedTask.log.failed')
        }
      )
  },
  { key: 'startedAt', title: $t('page.systemTools.timedTask.log.startedAt'), width: 180 },
  { key: 'durationMs', title: $t('page.systemTools.timedTask.log.duration'), width: 110 }
];

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<TimedTask>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.systemTools.timedTask.columns.id'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.systemTools.timedTask.columns.id'), minWidth: 80 },
    {
      key: 'name',
      title: $t('page.systemTools.timedTask.columns.name'),
      minWidth: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: 'description',
      title: $t('page.systemTools.timedTask.columns.description'),
      minWidth: 160,
      ellipsis: { tooltip: true }
    },
    { key: 'spec', title: $t('page.systemTools.timedTask.columns.spec'), minWidth: 120 },
    {
      key: 'executorType',
      title: $t('page.systemTools.timedTask.columns.executorType'),
      width: 110,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.executorType === 'method' ? 'primary' : 'warning', size: 'small', bordered: false },
          {
            default: () =>
              row.executorType === 'method'
                ? $t('page.systemTools.timedTask.columns.methodExecutor')
                : $t('page.systemTools.timedTask.columns.httpExecutor')
          }
        )
    },
    {
      key: 'enabled',
      title: $t('page.systemTools.timedTask.columns.enabled'),
      width: 90,
      align: 'center',
      render: row =>
        h(NSwitch, {
          value: row.enabled,
          onUpdateValue: (v: boolean) => handleToggle(row, v)
        })
    },
    { key: 'nextRunAt', title: $t('page.systemTools.timedTask.columns.nextRunAt'), minWidth: 170 },
    {
      key: 'operation',
      title: $t('page.systemTools.timedTask.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 300,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.systemTools.timedTask.columns.trigger'),
              icon: 'material-symbols:play-arrow',
              type: 'default',
              onClick: () => handleTrigger(row)
            },
            {
              label: $t('page.systemTools.timedTask.columns.logs'),
              icon: 'material-symbols:article',
              type: 'default',
              onClick: () => openLogs(row)
            },
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'info',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.systemTools.timedTask.deleteConfirm'),
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
    <TimedTaskSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.systemTools.timedTask.title')"
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
        :bordered="false"
        class="sm:h-full"
      />

      <TimedTaskOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>

    <NDrawer v-model:show="logVisible" :width="640" placement="right">
      <NDrawerContent
        :title="`${$t('page.systemTools.timedTask.log.title')}：${logTaskName}`"
        :native-scrollbar="false"
      >
        <NDataTable
          :columns="logColumns"
          :data="logData"
          :loading="logLoading"
          :row-key="row => String(row.ID ?? row.startedAt)"
          flex-height
          :bordered="false"
        />
        <div class="flex justify-end mt-16px">
          <NPagination v-bind="logPagination" />
        </div>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
