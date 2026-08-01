<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';
import { formatDateTime } from '@/utils/date';
import type { LoginLog } from '../api';

defineOptions({ name: 'LoginLogViewDrawer' });

const props = defineProps<{
  visible: boolean;
  data: LoginLog | null;
}>();

const emit = defineEmits<{ close: [] }>();

const statusTagType = computed<'success' | 'error'>(() => (props.data?.status ? 'success' : 'error'));

const statusText = computed(() =>
  props.data?.status ? $t('page.opsMonitor.loginLog.search.success') : $t('page.opsMonitor.loginLog.search.fail')
);

function displayField(val: string): string {
  if (!val || val === '') return $t('page.opsMonitor.loginLog.placeholder.none');
  return val;
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="640" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.opsMonitor.loginLog.detail.title')" :native-scrollbar="false">
      <div v-if="data" class="flex flex-col gap-16px">
        <NDescriptions label-placement="top" :column="2" bordered>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.id')">#{{ data.ID }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.ip')">
            {{ data.ip || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.status')">
            <NTag :type="statusTagType" size="small" :bordered="false" round>
              {{ statusText }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.createdAt')">
            {{ formatDateTime(data.CreatedAt) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.username')">
            {{ data.username || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.opsMonitor.loginLog.detail.userId')">
            {{ data.userId || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="data.errorMessage"
            :span="2"
            :label="$t('page.opsMonitor.loginLog.detail.errorMessage')"
          >
            {{ data.errorMessage }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="data.agent" :span="2" :label="$t('page.opsMonitor.loginLog.detail.agent')">
            <template #default>
              <div class="max-h-80px overflow-auto rounded-8px border border-gray-200 bg-gray-50 p-8px">
                <span class="break-all font-mono text-11px text-gray-500">{{ displayField(data.agent) }}</span>
              </div>
            </template>
          </NDescriptionsItem>
        </NDescriptions>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="closeDrawer">
            {{ $t('page.opsMonitor.loginLog.detail.close') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
