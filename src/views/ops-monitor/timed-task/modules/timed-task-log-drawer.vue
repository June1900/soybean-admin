<script setup lang="ts">
import { computed, h, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import {
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NPagination,
  NTag
} from 'naive-ui';
import { $t } from '@/locales';
import { fetchGetTimedTaskLogList, type TimedTaskLog, type TimedTaskLogSearchParams } from '../api';
import TimedTaskLogSearch from './timed-task-log-search.vue';

defineOptions({
  name: 'OpsMonitorTimedTaskLogDrawer'
});

const props = defineProps<{
  /** 抽屉是否可见（由父级用 v-model:show 控制） */
  show: boolean;
  /** 当前定时任务 ID */
  taskId: number;
  /** 当前定时任务名称（仅用于标题展示） */
  taskName: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const logData = ref<TimedTaskLog[]>([]);
const logLoading = ref(false);
const logSearchParams = reactive<TimedTaskLogSearchParams>({
  taskId: null,
  triggerType: '',
  status: '',
  startCreatedAt: '',
  endCreatedAt: ''
});
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

async function loadLogs() {
  logLoading.value = true;
  const { data: resp, error } = await fetchGetTimedTaskLogList({
    page: logPagination.page,
    pageSize: logPagination.pageSize,
    taskId: props.taskId,
    triggerType: logSearchParams.triggerType || undefined,
    status: logSearchParams.status || undefined,
    startCreatedAt: logSearchParams.startCreatedAt || undefined,
    endCreatedAt: logSearchParams.endCreatedAt || undefined
  });
  logLoading.value = false;
  if (!error && resp) {
    logData.value = resp.list ?? [];
    logPagination.itemCount = resp.total ?? 0;
  }
}

function handleLogSearch() {
  logPagination.page = 1;
  loadLogs();
}

function triggerTypeLabel(v: string) {
  return v === 'auto'
    ? $t('page.opsMonitor.timedTask.log.search.auto')
    : $t('page.opsMonitor.timedTask.log.search.manual');
}

function statusLabel(v: string) {
  return v === 'success'
    ? $t('page.opsMonitor.timedTask.log.search.success')
    : $t('page.opsMonitor.timedTask.log.search.failed');
}

function formatTime(v?: string) {
  return v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-';
}

const detailVisible = ref(false);
const detailData = ref<TimedTaskLog | null>(null);

function openDetail(row: TimedTaskLog) {
  detailData.value = row;
  detailVisible.value = true;
}

const logColumns: NaiveUI.TableColumn<TimedTaskLog>[] = [
  {
    key: 'triggerType',
    title: $t('page.opsMonitor.timedTask.log.columns.triggerType'),
    width: 90,
    align: 'center',
    render: (row: TimedTaskLog) =>
      h(
        NTag,
        { type: row.triggerType === 'auto' ? 'info' : 'warning', size: 'small', bordered: false },
        { default: () => triggerTypeLabel(row.triggerType) }
      )
  },
  {
    key: 'status',
    title: $t('page.opsMonitor.timedTask.log.columns.status'),
    width: 90,
    align: 'center',
    render: (row: TimedTaskLog) =>
      h(
        NTag,
        { type: row.status === 'success' ? 'success' : 'error', size: 'small', bordered: false },
        { default: () => statusLabel(row.status) }
      )
  },
  {
    key: 'startedAt',
    title: $t('page.opsMonitor.timedTask.log.columns.startedAt'),
    width: 180,
    render: (row: TimedTaskLog) => formatTime(row.startedAt)
  },
  {
    key: 'finishedAt',
    title: $t('page.opsMonitor.timedTask.log.columns.finishedAt'),
    width: 180,
    render: (row: TimedTaskLog) => formatTime(row.finishedAt)
  },
  {
    key: 'durationMs',
    title: $t('page.opsMonitor.timedTask.log.columns.duration'),
    width: 110,
    align: 'center',
    render: (row: TimedTaskLog) => (row.durationMs ?? 0).toLocaleString()
  },
  {
    key: 'CreatedAt',
    title: $t('page.opsMonitor.timedTask.log.columns.createdAt'),
    width: 180,
    render: (row: TimedTaskLog) => formatTime(row.CreatedAt)
  },
  {
    key: 'operation',
    title: $t('common.action'),
    align: 'center',
    fixed: 'right',
    width: 100,
    render: (row: TimedTaskLog) =>
      h(
        NButton,
        { size: 'small', type: 'primary', ghost: true, onClick: () => openDetail(row) },
        { default: () => $t('page.opsMonitor.timedTask.log.columns.view') }
      )
  }
];

const logScrollX = computed(() =>
  logColumns.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const logMaxHeight = computed(() => Math.max(360, (typeof window !== 'undefined' ? window.innerHeight : 800) - 280));

watch(
  () => [props.show, props.taskId] as const,
  ([val]) => {
    if (val) {
      Object.assign(logSearchParams, { triggerType: '', status: '', startCreatedAt: '', endCreatedAt: '' });
      logPagination.page = 1;
      loadLogs();
    } else {
      // 关闭时一并收起详情抽屉，避免下次打开残留
      detailVisible.value = false;
      detailData.value = null;
    }
  }
);

function handleUpdateShow(value: boolean) {
  emit('update:show', value);
}
</script>

<template>
  <NDrawer :show="show" :width="900" placement="right" @update:show="handleUpdateShow">
    <NDrawerContent :title="`${$t('page.opsMonitor.timedTask.log.title')}：${taskName}`" :native-scrollbar="false">
      <TimedTaskLogSearch v-model:model="logSearchParams" @search="handleLogSearch" @reset="handleLogSearch" />

      <NDataTable
        :columns="logColumns"
        :data="logData"
        :loading="logLoading"
        :row-key="row => String(row.ID ?? row.startedAt)"
        :scroll-x="logScrollX"
        :max-height="logMaxHeight"
        :bordered="false"
        class="mt-12px"
      />

      <div class="flex justify-end mt-16px">
        <NPagination v-bind="logPagination" />
      </div>

      <!-- 单条日志详情 -->
      <NDrawer v-model:show="detailVisible" :width="560" placement="right">
        <NDrawerContent :title="$t('page.opsMonitor.timedTask.log.detail.title')" :native-scrollbar="false">
          <template v-if="detailData">
            <NDescriptions :column="1" bordered size="small" label-placement="left">
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.triggerType')">
                <NTag :type="detailData.triggerType === 'auto' ? 'info' : 'warning'" size="small" :bordered="false">
                  {{ triggerTypeLabel(detailData.triggerType) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.status')">
                <NTag :type="detailData.status === 'success' ? 'success' : 'error'" size="small" :bordered="false">
                  {{ statusLabel(detailData.status) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.startedAt')">
                {{ formatTime(detailData.startedAt) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.finishedAt')">
                {{ formatTime(detailData.finishedAt) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.duration')">
                {{ detailData.durationMs ?? '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.createdAt')">
                {{ formatTime(detailData.CreatedAt) }}
              </NDescriptionsItem>
            </NDescriptions>

            <div v-if="detailData.errorMsg" class="mt-16px">
              <div class="mb-8px font-medium text-red-500">
                {{ $t('page.opsMonitor.timedTask.log.detail.error') }}
              </div>
              <pre class="whitespace-pre-wrap break-words rounded bg-gray-100 p-12px text-13px">{{
                detailData.errorMsg
              }}</pre>
            </div>
            <div v-if="detailData.output" class="mt-16px">
              <div class="mb-8px font-medium">{{ $t('page.opsMonitor.timedTask.log.detail.output') }}</div>
              <pre class="whitespace-pre-wrap break-words rounded bg-gray-100 p-12px text-13px">{{
                detailData.output
              }}</pre>
            </div>
          </template>
        </NDrawerContent>
      </NDrawer>
    </NDrawerContent>
  </NDrawer>
</template>
