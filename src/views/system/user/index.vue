<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag, NTreeSelect, type TreeOption } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetUserList,
  fetchSetUserDepartments,
  fetchSetUserPositions,
  type User,
  type UserListQuery,
  type UserSearchParams
} from './api';
import { fetchGetDepartmentList, type Department } from '@/views/system/department/api';
import { fetchGetPositionList, type Position } from '@/views/system/position/api';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';
import UserResetPwdModal from './modules/reset-pwd-modal.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemUser'
});

const appStore = useAppStore();

const searchModel = reactive<UserSearchParams>({
  userName: '',
  nickName: '',
  userPhone: '',
  userEmail: '',
  userStatus: null
});

/** 部门树形选择框选项（递归生成，含 children） */
const departmentTreeOptions = ref<TreeOption[]>([]);
/** 岗位选项（扁平列表，无 children） */
const positionOptions = ref<TreeOption[]>([]);

function toDepartmentTreeOptions(depts: Department[]): TreeOption[] {
  return depts.map(d => ({
    key: d.ID,
    label: d.name,
    children: d.children?.length ? toDepartmentTreeOptions(d.children) : undefined
  }));
}

/** 从列表响应中提取数组，兼容「data 直接为数组」与「{list} 包裹」两种后端返回结构 */
function extractList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object' && Array.isArray((res as Record<string, unknown>).list)) {
    return (res as Record<string, unknown>).list as T[];
  }
  return [];
}

async function loadTreeOptions() {
  // 部门与岗位均为全量拉取，供表格内树形选择框使用（对齐「部门管理 / 岗位管理」的取数方式）
  const [deptRes, posRes] = await Promise.all([
    fetchGetDepartmentList(),
    fetchGetPositionList({ page: 1, pageSize: 1000 })
  ]);
  if (!deptRes.error) {
    departmentTreeOptions.value = toDepartmentTreeOptions(extractList<Department>(deptRes.data));
  }
  if (!posRes.error) {
    positionOptions.value = extractList<Position>(posRes.data).map(p => ({ key: p.ID, label: p.name }));
  }
}

type UserListResponseType = Awaited<ReturnType<typeof fetchGetUserList>>;

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
            default: () => (row.enable === 1 ? $t('page.system.user.enable') : $t('page.system.user.disable'))
          }
        )
    },
    {
      key: 'departments',
      title: $t('page.system.user.department'),
      align: 'center',
      minWidth: 220,
      render: row => {
        const value = (row.departments ?? []).map(d => d.ID).filter((id): id is number => id != null);
        return h(NTreeSelect, {
          options: departmentTreeOptions.value,
          value,
          multiple: true,
          checkable: true,
          cascade: false,
          maxTagCount: 1,
          size: 'small',
          placeholder: $t('page.system.user.department'),
          onUpdateValue: (ids: number[]) => handleDeptChange(row, ids)
        });
      }
    },
    {
      key: 'positions',
      title: $t('page.system.user.position'),
      align: 'center',
      minWidth: 220,
      render: row => {
        const value = (row.positions ?? []).map(p => p.ID).filter((id): id is number => id != null);
        return h(NTreeSelect, {
          options: positionOptions.value,
          value,
          multiple: true,
          checkable: true,
          maxTagCount: 1,
          size: 'small',
          placeholder: $t('page.system.user.position'),
          onUpdateValue: (ids: number[]) => handlePosChange(row, ids)
        });
      }
    },
    {
      key: 'operate',
      title: $t('page.system.user.operation'),
      align: 'center',
      fixed: 'right',
      width: 300,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'primary',
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              onClick: () => handleEdit(row.ID)
            },
            {
              label: $t('page.system.user.resetPwd'),
              icon: 'material-symbols:lock-reset',
              type: 'warning',
              onClick: () => openResetPwd(row)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.system.user.confirmDelete'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
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

async function handleDeptChange(row: User, ids: number[] | null) {
  const list = ids ?? [];
  const previous = (row.departments ?? []).map(d => d.ID).filter((id): id is number => id != null);
  row.departments = list.map(id => ({ ID: id }));
  const { error } = await fetchSetUserDepartments({ ID: row.ID, deptIds: list, primaryDeptId: list[0] ?? 0 });
  if (error) {
    row.departments = previous.map(id => ({ ID: id }));
    return;
  }
  window.$message?.success($t('common.updateSuccess'));
}

async function handlePosChange(row: User, ids: number[] | null) {
  const list = ids ?? [];
  const previous = (row.positions ?? []).map(p => p.ID).filter((id): id is number => id != null);
  row.positions = list.map(id => ({ ID: id }));
  const { error } = await fetchSetUserPositions({ ID: row.ID, positionIds: list });
  if (error) {
    row.positions = previous.map(id => ({ ID: id }));
    return;
  }
  window.$message?.success($t('common.updateSuccess'));
}

onMounted(loadTreeOptions);

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id)) as number[];
  const { error } = await fetchBatchDeleteUser(ids);
  if (!error) {
    await onBatchDeleted();
  }
}

const resetPwdVisible = ref(false);
const resetPwdUser = ref<User | null>(null);

function openResetPwd(row: User) {
  resetPwdUser.value = row;
  resetPwdVisible.value = true;
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

      <!-- 重置密码弹窗 -->
      <UserResetPwdModal
        :visible="resetPwdVisible"
        :user="resetPwdUser"
        @close="resetPwdVisible = false"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped>
/* 部门/岗位树形选择框：选中标签强制单行，避免撑高表格行；隐藏标签上的关闭(x)按钮 */
:deep(.n-tree-select) .n-base-selection-tags {
  flex-wrap: nowrap;
}
</style>
