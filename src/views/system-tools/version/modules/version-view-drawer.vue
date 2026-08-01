<script setup lang="ts">
import { NDescriptions, NDescriptionsItem } from 'naive-ui';
import { $t } from '@/locales';
import type { SysVersion } from '../api';

defineOptions({ name: 'VersionViewDrawer' });

defineProps<{
  visible: boolean;
  data: SysVersion | null;
}>();

const emit = defineEmits<{ close: [] }>();

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="520" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.systemTools.version.detail.title')" :native-scrollbar="false">
      <NDescriptions v-if="data" label-placement="top" :column="1" bordered>
        <NDescriptionsItem :label="$t('page.systemTools.version.detail.versionName')">
          {{ data.versionName }}
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.version.detail.versionCode')">
          {{ data.versionCode }}
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.systemTools.version.detail.description')">
          <span class="break-all">{{ data.description || '-' }}</span>
        </NDescriptionsItem>
      </NDescriptions>
      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="closeDrawer">{{ $t('page.systemTools.version.detail.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
