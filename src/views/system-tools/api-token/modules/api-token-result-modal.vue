<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'ApiTokenResultModal' });

const show = defineModel<boolean>('show', { required: true });
const token = defineModel<string>('token', { default: '' });

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
  <NModal
    v-model:show="show"
    :title="$t('page.systemTools.apiToken.tokenDialog.title')"
    preset="card"
    :close-on-esc="false"
    :mask-closable="false"
    style="width: 620px"
  >
    <NAlert type="warning" :show-icon="true" :title="$t('page.systemTools.apiToken.tokenDialog.warning')" />
    <NInput type="textarea" :rows="6" :value="token" readonly class="mt-12px" />
    <template #footer>
      <NSpace justify="end">
        <NButton @click="copyText(token)">{{ $t('page.systemTools.apiToken.tokenDialog.copy') }}</NButton>
        <NButton type="primary" @click="show = false">
          {{ $t('page.systemTools.apiToken.tokenDialog.close') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
