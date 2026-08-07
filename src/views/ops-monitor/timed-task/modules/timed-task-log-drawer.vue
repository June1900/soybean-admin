<script setup lang="ts">
import { computed, h, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import {
  NButton,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItemGi,
  NGrid,
  NPagination,
  NSelect,
  NSpace,
  NTag
} from 'naive-ui';
import { $t } from '@/locales';
import { fetchGetTimedTaskLogList, type TimedTaskLog, type TimedTaskLogSearchParams } from '../api';
import { formatDateTime } from '@/utils/date';

defineOptions({
  name: 'OpsMonitorTimedTaskLogDrawer'
});

const show = defineModel<boolean>('show', { required: true });

const props = defineProps<{
  // 当前定时任务 ID
  taskId: number;
  // 当前定时任务名称
  taskName: string;
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

const triggerOptions = computed(() => [
  { label: $t('page.opsMonitor.timedTask.log.search.manual'), value: 'manual' },
  { label: $t('page.opsMonitor.timedTask.log.search.auto'), value: 'auto' }
]);

const statusOptions = computed(() => [
  { label: $t('page.opsMonitor.timedTask.log.search.success'), value: 'success' },
  { label: $t('page.opsMonitor.timedTask.log.search.fail'), value: 'fail' },
  { label: $t('page.opsMonitor.timedTask.log.search.timeout'), value: 'timeout' }
]);

const timeRange = computed<[number, number] | null>({
  get() {
    const { startCreatedAt, endCreatedAt } = logSearchParams;
    if (startCreatedAt && endCreatedAt) {
      return [dayjs(startCreatedAt).valueOf(), dayjs(endCreatedAt).valueOf()] as [number, number];
    }
    return null;
  },
  set(val: [number, number] | null) {
    if (val && val.length === 2) {
      logSearchParams.startCreatedAt = formatDateTime(val[0]);
      logSearchParams.endCreatedAt = formatDateTime(val[1]);
    } else {
      logSearchParams.startCreatedAt = '';
      logSearchParams.endCreatedAt = '';
    }
  }
});

function resetLogSearch() {
  logSearchParams.triggerType = '';
  logSearchParams.status = '';
  logSearchParams.startCreatedAt = '';
  logSearchParams.endCreatedAt = '';
  handleLogSearch();
}

function triggerTypeLabel(v: string) {
  return v === 'auto'
    ? $t('page.opsMonitor.timedTask.log.search.auto')
    : $t('page.opsMonitor.timedTask.log.search.manual');
}

function statusLabel(v: string) {
  if (v === 'success') return $t('page.opsMonitor.timedTask.log.search.success');
  if (v === 'timeout') return $t('page.opsMonitor.timedTask.log.search.timeout');
  return $t('page.opsMonitor.timedTask.log.search.fail');
}

function statusTagType(v: string): 'success' | 'error' | 'warning' {
  if (v === 'success') return 'success';
  if (v === 'timeout') return 'warning';
  return 'error';
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
        { type: statusTagType(row.status), size: 'small', bordered: false },
        { default: () => statusLabel(row.status) }
      )
  },
  {
    key: 'startedAt',
    title: $t('page.opsMonitor.timedTask.log.columns.startedAt'),
    width: 180,
    render: (row: TimedTaskLog) => formatDateTime(row.startedAt)
  },
  {
    key: 'finishedAt',
    title: $t('page.opsMonitor.timedTask.log.columns.finishedAt'),
    width: 180,
    render: (row: TimedTaskLog) => formatDateTime(row.finishedAt)
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
    render: (row: TimedTaskLog) => formatDateTime(row.CreatedAt)
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

const logMaxHeight = computed(() => Math.max(360, window.innerHeight - 280));

watch(
  () => [show.value, props.taskId] as const,
  ([val]) => {
    if (val) {
      resetLogSearch();
    } else {
      // 关闭时收起详情抽屉，避免下次打开残留
      detailVisible.value = false;
      detailData.value = null;
    }
  }
);
</script>

<template>
  <NDrawer v-model:show="show" :width="940" placement="right">
    <NDrawerContent :title="`${$t('page.opsMonitor.timedTask.log.title')}：${taskName}`" :native-scrollbar="false">
      <NForm :model="logSearchParams" label-placement="left" :label-width="80">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi
            span="24 m:8"
            :label="$t('page.opsMonitor.timedTask.log.search.triggerType')"
            path="triggerType"
            class="pr-24px"
          >
            <NSelect v-model:value="logSearchParams.triggerType" clearable :options="triggerOptions" />
          </NFormItemGi>
          <NFormItemGi
            span="24 m:8"
            :label="$t('page.opsMonitor.timedTask.log.search.status')"
            path="status"
            class="pr-24px"
          >
            <NSelect v-model:value="logSearchParams.status" clearable :options="statusOptions" />
          </NFormItemGi>
          <NFormItemGi
            span="24 m:8"
            :label="$t('page.opsMonitor.timedTask.log.search.timeRange')"
            path="timeRange"
            class="pr-24px"
          >
            <NDatePicker v-model:value="timeRange" type="datetimerange" clearable class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24" class="pr-24px">
            <NSpace class="w-full" justify="end">
              <NButton @click="resetLogSearch">
                <template #icon>
                  <icon-ri-refresh-line class="text-16px" />
                </template>
                {{ $t('common.reset') }}
              </NButton>
              <NButton type="primary" ghost @click="handleLogSearch">
                <template #icon>
                  <icon-ri-search-line class="text-16px" />
                </template>
                {{ $t('common.search') }}
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>

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
                <NTag :type="statusTagType(detailData.status)" size="small" :bordered="false">
                  {{ statusLabel(detailData.status) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.startedAt')">
                {{ formatDateTime(detailData.startedAt) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.finishedAt')">
                {{ formatDateTime(detailData.finishedAt) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.duration')">
                {{ detailData.durationMs ?? '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.opsMonitor.timedTask.log.detail.createdAt')">
                {{ formatDateTime(detailData.CreatedAt) }}
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
