<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'ApiTokenCurlDrawer' });

const show = defineModel<boolean>('show', { required: true });

const props = defineProps<{
  token?: string;
}>();

const curlHeader = computed(() => {
  const url = `${window.location.origin}/api/menu/getMenu`;
  return `curl -X POST "${url}" -H "x-token: ${props.token ?? ''}" -H "Content-Type: application/json"`;
});

const curlCookie = computed(() => {
  const url = `${window.location.origin}/api/menu/getMenu`;
  return `curl -X POST "${url}" -b "x-token=${props.token ?? ''}" -H "Content-Type: application/json"`;
});

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    window.$message?.success($t('page.systemTools.apiToken.copySuccess'));
  } catch {
    window.$message?.error('Copy failed');
  }
}
</script>

<template>
  <NDrawer v-model:show="show" :width="520" placement="right">
    <NDrawerContent :title="$t('page.systemTools.apiToken.curlDrawer.title')" :native-scrollbar="false">
      <p class="mb-8px font-500">{{ $t('page.systemTools.apiToken.curlDrawer.headerMode') }}</p>
      <NInput type="textarea" :rows="4" :value="curlHeader" readonly />
      <NButton size="small" class="mt-4px" @click="copyText(curlHeader)">
        {{ $t('page.systemTools.apiToken.curlDrawer.copy') }}
      </NButton>
      <NDivider />
      <p class="mb-8px font-500">{{ $t('page.systemTools.apiToken.curlDrawer.cookieMode') }}</p>
      <NInput type="textarea" :rows="4" :value="curlCookie" readonly />
      <NButton size="small" class="mt-4px" @click="copyText(curlCookie)">
        {{ $t('page.systemTools.apiToken.curlDrawer.copy') }}
      </NButton>
    </NDrawerContent>
  </NDrawer>
</template>
