<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { NAlert, NButton, NDataTable, NDrawer, NDrawerContent, NInput, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import { useNaivePaginatedTable } from '@/hooks/common/table';
import { fetchGetUserList, type User, type UserListQuery } from '@/views/system/user/api';
import { fetchGetUsersByAuthority, fetchSetRoleUsers, type Authority } from '../api';

const props = defineProps<{
  visible: boolean;
  role: Authority | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const { loading: saving, startLoading: startSaving, endLoading: endSaving } = useLoading();

const searchModel = reactive({
  username: '',
  nickname: ''
});

const checkedRowKeys = ref<string[]>([]);

type UserListResponseType = Awaited<ReturnType<typeof fetchGetUserList>>;

const { columns, data, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<UserListResponseType, User>({
  immediate: false,
  api: () => fetchGetUserList(getQueryParams()),
  transform: res => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? 1,
    pageSize: res.data?.pageSize ?? 10
  }),
  columns: () => [
    { type: 'selection', align: 'center', width: 48 },
    { key: 'ID', title: 'ID', align: 'center', width: 80 },
    { key: 'userName', title: $t('page.system.user.userName'), minWidth: 140 },
    { key: 'nickName', title: $t('page.system.user.nickName'), minWidth: 140 }
  ]
});

function getQueryParams(): UserListQuery {
  return {
    username: searchModel.username || undefined,
    nickname: searchModel.nickname || undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

/** 加载用户列表与已关联用户 ID */
async function loadAssignUserData(authorityId: number) {
  checkedRowKeys.value = [];
  searchModel.username = '';
  searchModel.nickname = '';
  const [assignedRes] = await Promise.all([fetchGetUsersByAuthority(authorityId), getDataByPage(1)]);
  if (!assignedRes.error) {
    checkedRowKeys.value = (assignedRes.data ?? []).map(String);
  }
}

watch(
  () => props.visible,
  async visible => {
    if (!visible || !props.role) return;
    await loadAssignUserData(props.role.authorityId);
  },
  { immediate: true }
);

function handleSearch() {
  void getDataByPage(1);
}

function handleReset() {
  searchModel.username = '';
  searchModel.nickname = '';
  void getDataByPage(1);
}

async function handleSave() {
  if (!props.role) return;
  startSaving();
  const { error } = await fetchSetRoleUsers(props.role.authorityId, checkedRowKeys.value.map(Number));
  if (!error) {
    window.$message?.success($t('page.system.authority.assignSuccess'));
    emit('submitted');
    emit('close');
  }
  endSaving();
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="720" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="$t('page.system.authority.assignUserTitle')">
      <div class="flex-col-stretch h-full gap-12px">
        <NAlert type="warning" :show-icon="true" class="shrink-0">
          {{ $t('page.system.authority.assignUserNotice') }}
        </NAlert>

        <div class="flex items-center gap-12px shrink-0">
          <span class="shrink-0">{{ $t('page.system.user.userName') }}</span>
          <NInput
            v-model:value="searchModel.username"
            :placeholder="$t('page.system.user.userNamePlaceholder')"
            clearable
            class="w-160px"
            @keyup.enter="handleSearch"
          />
          <span class="shrink-0">{{ $t('page.system.user.nickName') }}</span>
          <NInput
            v-model:value="searchModel.nickname"
            :placeholder="$t('page.system.user.nickNamePlaceholder')"
            clearable
            class="w-160px"
            @keyup.enter="handleSearch"
          />
          <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
          <NButton @click="handleReset">{{ $t('common.reset') }}</NButton>
        </div>

        <NDataTable
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="data"
          :loading="loading"
          :row-key="row => String(row.ID)"
          :pagination="mobilePagination"
          size="small"
          flex-height
          remote
          class="flex-1 min-h-0"
        />
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
