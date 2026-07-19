<script setup lang="ts">
import { computed, h, reactive } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetUserList,
  type User,
  type UserListQuery,
  type UserSearchParams
} from './api';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

defineOptions({
  name: 'SystemUser'
});

const appStore = useAppStore();

/* ---------- search model ---------- */
const searchModel = reactive<UserSearchParams>({
  userName: '',
  nickName: '',
  userPhone: '',
  userEmail: '',
  userStatus: null
});

type UserListResponseType = Awaited<ReturnType<typeof fetchGetUserList>>;

/* ---------- table ---------- */
const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  UserListResponseType,
  User
>({
  api: () => fetchGetUserList(getQueryParams()),
  transform: res => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? 1,
    pageSize: res.data?.pageSize ?? 10
  }),
  columns: () => [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.user.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    { key: 'userName', title: $t('page.system.user.userName'), align: 'center', minWidth: 100 },
    { key: 'nickName', title: $t('page.system.user.nickName'), align: 'center', minWidth: 100 },
    { key: 'phone', title: $t('page.system.user.phone'), align: 'center', width: 130 },
    { key: 'email', title: $t('page.system.user.email'), align: 'center', minWidth: 180 },
    {
      key: 'enable',
      title: $t('page.system.user.status'),
      align: 'center',
      width: 90,
      render: row =>
        h(
          NTag,
          { type: row.enable === 1 ? 'success' : 'warning', size: 'small', bordered: false },
          {
            default: () =>
              row.enable === 1 ? $t('page.system.user.enable') : $t('page.system.user.disable')
          }
        )
    },
    {
      key: 'operate',
      title: $t('page.system.user.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row => (
        h('div', { class: 'flex-center gap-8px' }, [
          h(
            NButton,
            { type: 'primary', ghost: true, size: 'small', onClick: () => handleEdit(row.ID) },
            { default: () => $t('page.system.user.editUser') }
          ),
          h(
            NPopconfirm,
            { onPositiveClick: () => handleDelete(row.ID) },
            {
              default: () => $t('page.system.user.confirmDelete'),
              trigger: () =>
                h(
                  NButton,
                  { type: 'error', ghost: true, size: 'small' },
                  { default: () => $t('page.system.user.deleteUser') }
                )
            }
          )
        ])
      )
    }
  ]
});

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

function getQueryParams(): UserListQuery {
  return {
    username: searchModel.userName || undefined,
    nickname: searchModel.nickName || undefined,
    phone: searchModel.userPhone || undefined,
    email: searchModel.userEmail || undefined,
    enable: searchModel.userStatus ? Number(searchModel.userStatus) : undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

/* ---------- operate (add / edit / delete) ---------- */
const {
  drawerVisible,
  closeDrawer,
  operateType,
  handleAdd,
  editingData,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate<User>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteUser(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id)) as number[];
  const { error } = await fetchBatchDeleteUser(ids);
  if (!error) {
    await onBatchDeleted();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchModel" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => String(row.ID)"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <UserOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
