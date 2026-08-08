<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'FullScreen'
});

interface Props {
  full?: boolean;
}

defineProps<Props>();
</script>

<template>
  <ButtonIcon :key="String(full)" :tooltip-content="full ? $t('icon.fullscreenExit') : $t('icon.fullscreen')">
    <icon-ri-fullscreen-exit-line v-if="full" />
    <icon-ri-fullscreen-line v-else />
  </ButtonIcon>
</template>