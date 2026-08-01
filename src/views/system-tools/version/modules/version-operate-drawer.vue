<script setup lang="ts">
import { reactive } from 'vue';
import { $t } from '@/locales';
import { createVersion, type SysVersionForm } from '../api';

defineOptions({ name: 'VersionOperateDrawer' });

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const model = reactive<SysVersionForm>({
  versionName: '',
  versionCode: '',
  description: ''
});

async function handleSubmit() {
  if (!model.versionName.trim() || !model.versionCode.trim()) {
    window.$message?.warning($t('page.systemTools.version.drawer.versionName'));
    return;
  }
  const { error } = await createVersion({
    versionName: model.versionName.trim(),
    versionCode: model.versionCode.trim(),
    description: model.description.trim()
  });
  if (error) return;
  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="460" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.systemTools.version.drawer.title')" :native-scrollbar="false">
      <NForm label-placement="top">
        <NFormItem :label="$t('page.systemTools.version.drawer.versionName')" required>
          <NInput v-model:value="model.versionName" :placeholder="$t('page.systemTools.version.drawer.versionName')" />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.version.drawer.versionCode')" required>
          <NInput v-model:value="model.versionCode" :placeholder="$t('page.systemTools.version.drawer.versionCode')" />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.version.drawer.description')">
          <NInput v-model:value="model.description" type="textarea" :rows="4" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('page.systemTools.version.drawer.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('page.systemTools.version.drawer.submit') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
