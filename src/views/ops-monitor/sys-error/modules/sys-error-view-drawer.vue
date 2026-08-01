<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NScrollbar, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';
import type { SysError, SysErrorLevel, SysErrorStatus } from '../api';
import { formatDateTime } from '@/utils/date';
import { useClipboard } from '@vueuse/core';

defineOptions({ name: 'SysErrorViewDrawer' });

const props = defineProps<{
  visible: boolean;
  data: SysError | null;
}>();

const emit = defineEmits<{ close: [] }>();

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

const levelLabel = computed(() => (props.data ? $t(`page.opsMonitor.sysError.level.${props.data.level}`) : ''));
const statusLabel = computed(() => (props.data ? $t(`page.opsMonitor.sysError.status.${props.data.status}`) : ''));

const { copy, isSupported } = useClipboard();

async function checkClipboardPermission(): Promise<boolean> {
  try {
    if (!navigator.permissions?.query) return true;
    const status = await navigator.permissions.query({ name: 'clipboard-write' } as unknown as PermissionDescriptor);
    return status.state !== 'denied';
  } catch {
    return true;
  }
}

async function copyText(text: string) {
  if (!text) return;
  if (!isSupported.value) {
    window.$message?.error($t('common.error'));
    return;
  }
  if (!(await checkClipboardPermission())) {
    window.$message?.error($t('common.error'));
    return;
  }
  try {
    await copy(text);
    window.$message?.success($t('page.opsMonitor.sysError.detail.copied'));
  } catch {
    window.$message?.error($t('common.error'));
  }
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="680" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.opsMonitor.sysError.detail.title')" :native-scrollbar="false">
      <div v-if="data" class="flex flex-col gap-16px">
        <NDescriptions label-placement="top" :column="2" bordered>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.level')">
            <NTag :type="levelTagType[data.level]" size="small" :bordered="false" round>{{ levelLabel }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.status')">
            <NTag :type="statusTagType[data.status]" size="small" :bordered="false" round>{{ statusLabel }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="ID">#{{ data.ID }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.form')">{{ data.form }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.createdAt')">
            {{ formatDateTime(data.CreatedAt) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.updatedAt')">
            {{ formatDateTime(data.UpdatedAt) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.requestId')" :span="2">
            <span class="break-all font-mono text-12px text-gray-500">{{ data.request_id || '-' }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.traceId')" :span="2">
            <span class="break-all font-mono text-12px text-gray-500">{{ data.trace_id || '-' }}</span>
          </NDescriptionsItem>
        </NDescriptions>

        <div class="mt-16px flex flex-col gap-16px">
          <div>
            <div class="mb-8px flex items-center justify-between">
              <span class="text-14px font-medium text-gray-700">{{ $t('page.opsMonitor.sysError.detail.info') }}</span>
              <NButton size="tiny" tertiary @click="copyText(data.info)">
                {{ $t('page.opsMonitor.sysError.detail.copy') }}
              </NButton>
            </div>
            <NScrollbar style="max-height: 280px">
              <pre class="code-block code-block--danger">{{ data.info }}</pre>
            </NScrollbar>
          </div>

          <div>
            <div class="mb-8px flex items-center justify-between">
              <span class="text-14px font-medium text-gray-700">
                {{ $t('page.opsMonitor.sysError.detail.solution') }}
              </span>
              <NButton size="tiny" tertiary @click="copyText(data.solution || '')">
                {{ $t('page.opsMonitor.sysError.detail.copy') }}
              </NButton>
            </div>
            <NScrollbar style="max-height: 200px">
              <pre class="code-block">{{ data.solution || '-' }}</pre>
            </NScrollbar>
          </div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="closeDrawer">{{ $t('page.opsMonitor.sysError.detail.close') }}</NButton>
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

.code-block--danger {
  color: #ef4444;
}
</style>
