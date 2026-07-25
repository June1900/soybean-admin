<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { $t } from '@/locales';
import { fetchCreateApiToken } from '../api';
import type { ApiTokenForm } from '../types';
import type { User } from '@/views/system/user/api';
import ApiTokenUserPickerModal from './api-token-user-picker-modal.vue';

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
  authorityId: null,
  days: 30,
  remark: ''
});

const selectedUser = ref<User | null>(null);
const userPickerVisible = ref(false);
const loading = ref(false);

const userDisplay = computed(() => {
  if (!selectedUser.value) return '';
  return `${selectedUser.value.nickName} (${selectedUser.value.userName})`;
});

const authorityOptions = computed(() => {
  const list = selectedUser.value?.authorities ?? [];
  return list.map(a => ({
    label: `${a.authorityName ?? ''} (${a.authorityId ?? ''})`,
    value: Number(a.authorityId)
  }));
});

watch(
  () => props.visible,
  val => {
    if (val) {
      model.userId = 0;
      model.authorityId = null;
      model.days = 30;
      model.remark = '';
      selectedUser.value = null;
    }
  }
);

function handleUserSelected(user: User) {
  selectedUser.value = user;
  model.userId = user.ID;
  model.authorityId = null;
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
          <NInputGroup>
            <NInput :value="userDisplay" :placeholder="$t('page.systemTools.apiToken.drawer.selectUser')" readonly />
            <NButton type="primary" @click="userPickerVisible = true">
              {{ $t('page.systemTools.apiToken.userPicker.select') }}
            </NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.apiToken.drawer.authority')" required>
          <NSelect
            v-model:value="model.authorityId"
            :placeholder="$t('page.systemTools.apiToken.drawer.selectAuthority')"
            :disabled="!model.userId"
            :options="authorityOptions"
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

  <ApiTokenUserPickerModal v-model:show="userPickerVisible" @select="handleUserSelected" />
</template>
