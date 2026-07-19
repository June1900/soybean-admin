<script setup lang="ts">
import { computed } from 'vue';
import { NDescriptions, NDescriptionsItem, NTag } from 'naive-ui';
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
  pending: 'warning',
  processing: 'info',
  done: 'success',
  failed: 'error'
};

const levelLabel = computed(() => (props.data ? $t(`page.systemTools.sysError.level.${props.data.level}`) : ''));
const statusLabel = computed(() => (props.data ? $t(`page.systemTools.sysError.status.${props.data.status}`) : ''));

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="520" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.systemTools.sysError.detail.title')" :native-scrollbar="false">
      <NDescriptions v-if="data" label-placement="top" :column="1" bordered>
        <NDescriptionsItem label="ID">#{{ data.ID }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.sysError.detail.form')">{{ data.form }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.sysError.detail.level')">
          <NTag :type="levelTagType[data.level]" size="small" :bordered="false">{{ levelLabel }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.sysError.detail.status')">
          <NTag :type="statusTagType[data.status]" size="small" :bordered="false">{{ statusLabel }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.sysError.detail.info')">
          <span class="break-all text-red-500">{{ data.info }}</span>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.sysError.detail.solution')">
          <span class="break-all">{{ data.solution || '-' }}</span>
        </NDescriptionsItem>
      </NDescriptions>
      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="closeDrawer">{{ $t('page.systemTools.sysError.detail.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
