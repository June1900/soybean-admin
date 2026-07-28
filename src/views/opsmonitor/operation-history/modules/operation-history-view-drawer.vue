<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NScrollbar, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';
import { formatDateTime } from '@/utils/date';
import type { OperationRecord } from '../api';
import { statusTagType } from '../share';

defineOptions({ name: 'OperationHistoryViewDrawer' });

const props = defineProps<{
  visible: boolean;
  data: OperationRecord | null;
}>();

const emit = defineEmits<{ close: [] }>();

const operatorLabel = computed(() => {
  if (!props.data?.user) return '-';
  const { userName, nickName } = props.data.user;
  return nickName ? `${userName}(${nickName})` : userName;
});

function displayField(val: string): string {
  if (!val || val === '') return $t('page.opsMonitor.operationHistory.placeholder.none');
  return val;
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    window.$message?.success($t('page.opsMonitor.operationHistory.detail.copied'));
  } catch {
    window.$message?.error($t('common.error'));
  }
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="720" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.opsMonitor.operationHistory.detail.title')" :native-scrollbar="false">
      <div v-if="data" class="flex flex-col gap-16px">
        <NDescriptions label-placement="top" :column="2" bordered>
          <NDescriptionsItem label="ID">#{{ data.ID }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.ip')">
            {{ data.ip || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.userId')">
            {{ data.user_id }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.operator')">
            {{ operatorLabel }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.statusCode')">
            <NTag :type="statusTagType(data.status)" size="small" :bordered="false" round>
              {{ data.status }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.method')">
            <NTag type="default" size="small" :bordered="false">{{ data.method }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.path')">
            <span class="break-all font-mono text-12px">{{ data.path }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.latency')">
            {{ data.latency_ms }} ms
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.createdAt')">
            {{ formatDateTime(data.CreatedAt) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.deviceId')">
            {{ displayField(data.device_id) }}
          </NDescriptionsItem>
        </NDescriptions>

        <!-- ID 类字段 -->
        <div class="flex flex-col gap-12px">
          <NDescriptions label-placement="top" :column="1" bordered>
            <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.requestId')">
              <span class="break-all font-mono text-12px text-gray-500">{{ data.request_id || '-' }}</span>
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.opsMonitor.operationHistory.detail.traceId')">
              <span class="break-all font-mono text-12px text-gray-500">{{ data.trace_id || '-' }}</span>
            </NDescriptionsItem>
          </NDescriptions>
        </div>

        <!-- 请求体 / 响应体 / 错误信息 -->
        <div class="mt-8px flex flex-col gap-16px">
          <div v-if="data.agent">
            <div class="mb-4px text-13px font-medium text-gray-600">
              {{ $t('page.opsMonitor.operationHistory.detail.agent') }}
            </div>
            <div class="max-h-80px overflow-auto rounded-8px border border-gray-200 bg-gray-50 p-8px">
              <span class="break-all font-mono text-11px text-gray-500">{{ data.agent }}</span>
            </div>
          </div>

          <div v-if="data.error_message">
            <div class="mb-4px text-13px font-medium text-red-600">
              {{ $t('page.opsMonitor.operationHistory.detail.errorMessage') }}
            </div>
            <NScrollbar style="max-height: 120px">
              <pre class="code-block code-block--error">{{ data.error_message }}</pre>
            </NScrollbar>
          </div>

          <div>
            <div class="mb-8px flex items-center justify-between">
              <span class="text-14px font-medium text-gray-700">
                {{ $t('page.opsMonitor.operationHistory.detail.body') }}
              </span>
              <NButton size="tiny" tertiary @click="copyText(data.body)">
                {{ $t('page.opsMonitor.operationHistory.detail.copy') }}
              </NButton>
            </div>
            <NScrollbar style="max-height: 240px">
              <pre class="code-block">{{ displayField(data.body) }}</pre>
            </NScrollbar>
          </div>

          <div>
            <div class="mb-8px flex items-center justify-between">
              <span class="text-14px font-medium text-gray-700">
                {{ $t('page.opsMonitor.operationHistory.detail.resp') }}
              </span>
              <NButton size="tiny" tertiary @click="copyText(data.resp)">
                {{ $t('page.opsMonitor.operationHistory.detail.copy') }}
              </NButton>
            </div>
            <NScrollbar style="max-height: 240px">
              <pre class="code-block">{{ displayField(data.resp) }}</pre>
            </NScrollbar>
          </div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="closeDrawer">
            {{ $t('page.opsMonitor.operationHistory.detail.close') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.code-block {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
}

.code-block--error {
  border-color: #fecaca;
  background-color: #fef2f2;
  color: #dc2626;
}
</style>
