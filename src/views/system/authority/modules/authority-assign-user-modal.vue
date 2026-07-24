<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { NButton, NDataTable, NInput, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';
import type { User } from '@/views/system/user/api';
import { fetchGetUserList } from '@/views/system/user/api';
import { fetchSetAuthorityUsers, type Authority } from '../api';

const props = defineProps<{
  visible: boolean;
  role: Authority | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const { loading, startLoading, endLoading } = useLoading();
const users = ref<User[]>([]);
const checkedRowKeys = ref<string[]>([]);
const keyword = ref('');

const filteredUsers = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return users.value;
  return users.value.filter(u => `${u.userName}${u.nickName}`.toLowerCase().includes(k));
});

const columns = [
  {
    type: 'selection',
    align: 'center',
    width: 48
  },
  { key: 'userName', title: $t('page.system.user.userName'), minWidth: 140 },
  { key: 'nickName', title: $t('page.system.user.nickName'), minWidth: 140 },
  {
    key: 'enable',
    title: $t('common.status'),
    width: 90,
    align: 'center',
    render: (row: User) =>
      h(NTag, { type: row.enable === 1 ? 'success' : 'error', size: 'small', bordered: false }, {
        default: () => (row.enable === 1 ? $t('common.enable') : $t('common.disable'))
      })
  }
] as NaiveUI.TableColumn<User>[];

watch(
  () => props.visible,
  async visible => {
    if (!visible || !props.role) return;

    const { data } = await fetchGetUserList({ page: 1, pageSize: 200 });
    users.value = data?.list ?? [];
    const rid = Number(props.role.authorityId);
    checkedRowKeys.value = users.value.filter(u => u.authorityIds?.includes(rid)).map(u => String(u.ID));
  },
  { immediate: true }
);

async function handleSave() {
  if (!props.role) return;
  startLoading();

  const { error } = await fetchSetAuthorityUsers(props.role.authorityId, checkedRowKeys.value.map(Number));

  if (!error) {
    window.$message?.success($t('page.system.authority.assignSuccess'));
    emit('submitted');
    emit('close');
  }

  endLoading();
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    :title="$t('page.system.authority.assignUserTitle')"
    style="width: 720px; max-width: 92vw"
    @update:show="val => !val && emit('close')"
  >
    <div class="flex-col-stretch gap-12px">
      <NInput
        v-model:value="keyword"
        :placeholder="$t('page.system.authority.userSearchPlaceholder')"
        clearable
        class="w-280px"
      />
      <NDataTable
        :columns="columns"
        :data="filteredUsers"
        size="small"
        max-height="420px"
        :row-key="row => String((row as User).ID)"
        :scroll-x="420"
        v-model:checked-row-keys="checkedRowKeys"
      />
    </div>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSave">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
