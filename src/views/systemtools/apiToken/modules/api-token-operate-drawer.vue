<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { $t } from '@/locales';
import { fetchUserOptions, fetchCreateApiToken } from '../api';
import type { ApiTokenUserOption, ApiTokenForm } from '../types';

defineOptions({ name: 'ApiTokenOperateDrawer' });

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [token: string];
}>();

const model = reactive<ApiTokenForm>({
  userId: 0,
  authorityId: 0,
  days: 30,
  remark: ''
});

const userOptions = ref<ApiTokenUserOption[]>([]);
const authorityOptions = ref<ApiTokenUserOption['authorities']>([]);
const loading = ref(false);

async function loadUsers() {
  userOptions.value = await fetchUserOptions();
}

watch(
  () => props.visible,
  val => {
    if (val) {
      model.userId = 0;
      model.authorityId = 0;
      model.days = 30;
      model.remark = '';
      authorityOptions.value = [];
      loadUsers();
    }
  }
);

function handleUserChange(val: number | null) {
  model.authorityId = 0;
  const user = userOptions.value.find(u => u.ID === val);
  authorityOptions.value = user?.authorities ?? [];
  if (authorityOptions.value.length > 0) {
    model.authorityId = authorityOptions.value[0].authorityId;
  }
}

async function handleSubmit() {
  if (!model.userId || !model.authorityId) {
    window.$message?.warning($t('page.systemTools.apiToken.pleaseSelectUserAndAuthority'));
    return;
  }
  loading.value = true;
  const { data, error } = await fetchCreateApiToken({ ...model });
  loading.value = false;
  if (error) return;
  if (data?.token) {
    emit('submitted', data.token);
    closeDrawer();
  }
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="400" @mask-click="closeDrawer" @close="closeDrawer">
    <NDrawerContent :title="$t('page.systemTools.apiToken.drawer.title')" :native-scrollbar="false">
      <NForm label-placement="top">
        <NFormItem :label="$t('page.systemTools.apiToken.drawer.user')" required>
          <NSelect
            v-model:value="model.userId"
            :placeholder="$t('page.systemTools.apiToken.drawer.selectUser')"
            filterable
            :options="userOptions.map(u => ({ label: `${u.nickName} (${u.userName})`, value: u.ID }))"
            @update:value="handleUserChange"
          />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.apiToken.drawer.authority')" required>
          <NSelect
            v-model:value="model.authorityId"
            :placeholder="$t('page.systemTools.apiToken.drawer.selectAuthority')"
            :disabled="!model.userId"
            :options="
              (authorityOptions ?? []).map(a => ({
                label: `${a.authorityName} (${a.authorityId})`,
                value: a.authorityId
              }))
            "
          />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.apiToken.drawer.days')">
          <NSelect
            v-model:value="model.days"
            :options="[
              { label: $t('page.systemTools.apiToken.drawer.day1'), value: 1 },
              { label: $t('page.systemTools.apiToken.drawer.day7'), value: 7 },
              { label: $t('page.systemTools.apiToken.drawer.day30'), value: 30 },
              { label: $t('page.systemTools.apiToken.drawer.day90'), value: 90 },
              { label: $t('page.systemTools.apiToken.drawer.permanent'), value: -1 }
            ]"
          />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.apiToken.drawer.remark')">
          <NInput v-model:value="model.remark" type="textarea" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('page.systemTools.apiToken.drawer.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('page.systemTools.apiToken.drawer.submit') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
