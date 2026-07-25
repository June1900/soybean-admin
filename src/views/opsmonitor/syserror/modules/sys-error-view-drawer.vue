<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NScrollbar, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';
import type { SysError, SysErrorLevel, SysErrorStatus } from '../api';

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

function formatDate(val: string): string {
  if (!val) return '-';
  const d = dayjs(val);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : val;
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
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
            {{ formatDate(data.CreatedAt) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.sysError.detail.updatedAt')">
            {{ formatDate(data.UpdatedAt) }}
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
              <pre
                class="whitespace-pre-wrap break-words rounded-8px border border-gray-200 bg-gray-50 p-12px font-mono text-13px text-red-500"
              >{{ data.info }}</pre>
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
              <pre
                class="whitespace-pre-wrap break-words rounded-8px border border-gray-200 bg-gray-50 p-12px font-mono text-13px text-gray-700"
              >{{ data.solution || '-' }}</pre>
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
