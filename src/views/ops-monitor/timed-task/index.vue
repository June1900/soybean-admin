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
  type TimedTask,
  type TimedTaskListQuery,
  type TimedTaskSearchParams
} from './api';
import TimedTaskOperateDrawer from './modules/timed-task-operate-drawer.vue';
import TimedTaskSearch from './modules/timed-task-search.vue';
import TimedTaskLogDrawer from './modules/timed-task-log-drawer.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'OpsMonitorTimedTask'
});

const appStore = useAppStore();

const searchParams = reactive<TimedTaskSearchParams>({
  name: '',
  executorType: '',
  enabled: ''
});

type TimedTaskListApiResponse = Awaited<ReturnType<typeof fetchGetTimedTaskList>>;

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  TimedTaskListApiResponse,
  TimedTask
>({
  api: () => fetchGetTimedTaskList(getQueryParams()),
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
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

function getQueryParams(): TimedTaskListQuery {
  const params: TimedTaskListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.name) params.name = searchParams.name;
  if (searchParams.executorType) params.executorType = searchParams.executorType;
  // NSelect 用 '1'/'0' 表示启用/停用，转成布尔传后端
  if (searchParams.enabled === '1') params.enabled = true;
  else if (searchParams.enabled === '0') params.enabled = false;
  return params;
}

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

async function handleToggle(row: TimedTask, enabled: boolean) {
  const { error } = await fetchToggleTimedTask(row.ID, enabled);
  if (!error) {
    window.$message?.success(
      enabled ? $t('page.opsMonitor.timedTask.enable') : $t('page.opsMonitor.timedTask.disable')
    );
  }
  await getData();
}

async function handleTrigger(row: TimedTask) {
  const { error } = await fetchTriggerTimedTask(row.ID);
  if (!error) {
    window.$message?.success($t('page.opsMonitor.timedTask.triggerSuccess'));
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteTimedTask(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const results = await Promise.all(ids.map(id => fetchDeleteTimedTask(id)));
  if (results.some(r => r.error)) return;
  await onBatchDeleted();
}

const logVisible = ref(false);
const logTaskId = ref(0);
const logTaskName = ref('');

function openLogs(row: TimedTask) {
  logTaskId.value = row.ID;
  logTaskName.value = row.name;
  logVisible.value = true;
}

function createAllColumns(): NaiveUI.TableColumn<TimedTask>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48,
      // 启用中的任务禁止删除，故禁用其复选框
      disabled: (row: TimedTask) => row.enabled
    },
    {
      key: 'index',
      title: $t('page.opsMonitor.timedTask.columns.id'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    {
      key: 'name',
      title: $t('page.opsMonitor.timedTask.columns.name'),
      minWidth: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: 'description',
      title: $t('page.opsMonitor.timedTask.columns.description'),
      minWidth: 160,
      ellipsis: { tooltip: true }
    },
    { key: 'spec', title: $t('page.opsMonitor.timedTask.columns.spec'), minWidth: 120 },
    {
      key: 'executorType',
      title: $t('page.opsMonitor.timedTask.columns.executorType'),
      width: 110,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.executorType === 'method' ? 'primary' : 'warning', size: 'small', bordered: false },
          {
            default: () =>
              row.executorType === 'method'
                ? $t('page.opsMonitor.timedTask.columns.methodExecutor')
                : $t('page.opsMonitor.timedTask.columns.httpExecutor')
          }
        )
    },
    {
      key: 'enabled',
      title: $t('page.opsMonitor.timedTask.columns.enabled'),
      width: 90,
      align: 'center',
      render: row =>
        h(NSwitch, {
          value: row.enabled,
          onUpdateValue: (v: boolean) => handleToggle(row, v)
        })
    },
    { key: 'nextRunAt', title: $t('page.opsMonitor.timedTask.columns.nextRunAt'), minWidth: 170 },
    {
      key: 'operation',
      title: $t('page.opsMonitor.timedTask.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 320,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.opsMonitor.timedTask.columns.trigger'),
              icon: 'material-symbols:play-arrow',
              type: 'default',
              onClick: () => handleTrigger(row)
            },
            {
              label: $t('page.opsMonitor.timedTask.columns.logs'),
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
              disabled: row.enabled,
              tooltip: row.enabled ? $t('page.opsMonitor.timedTask.columns.cannotDeleteEnabled') : undefined,
              popconfirm: {
                content: $t('page.opsMonitor.timedTask.deleteConfirm'),
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
      :title="$t('page.opsMonitor.timedTask.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-batch-delete="true"
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

    <TimedTaskLogDrawer v-model:show="logVisible" :task-id="logTaskId" :task-name="logTaskName" />
  </div>
</template>
