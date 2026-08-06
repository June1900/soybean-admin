<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchDeleteApi,
  fetchFreshCasbin,
  fetchGetApiList,
  type Api,
  type ApiListQuery,
  type ApiSearchParams
} from './api';
import ApiOperateDrawer from './modules/api-operate-drawer.vue';
import ApiRoleAssignDrawer from './modules/api-role-assign-drawer.vue';
import ApiSearch from './modules/api-search.vue';

import TableActionButtons from '@/components/common/table-action-buttons';
import { methodTagType } from './shared';

defineOptions({
  name: 'SystemApi'
});

const appStore = useAppStore();

type ApiListResponse = Awaited<ReturnType<typeof fetchGetApiList>>;

const searchParams = reactive<ApiSearchParams>({
  path: '',
  description: '',
  apiGroup: '',
  method: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  ApiListResponse,
  Api
>({
  api: () => fetchGetApiList(getQueryParams()),
  transform: res => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? 1,
    pageSize: res.data?.pageSize ?? 10
  }),
  columns: () => createAllColumns(),
  immediate: false
});

function getQueryParams(): ApiListQuery {
  return {
    path: searchParams.path || undefined,
    description: searchParams.description || undefined,
    apiGroup: searchParams.apiGroup || undefined,
    method: searchParams.method || undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

/* 增删改操作 */
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
} = useTableOperate<Api>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteApi(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  for (const id of checkedRowKeys.value.map(key => Number(key))) {
    await fetchDeleteApi(id);
  }
  await onBatchDeleted();
}

/* 顶部按钮 */
async function handleRefreshCache() {
  const { error } = await fetchFreshCasbin();
  if (!error) {
    window.$message?.success($t('page.system.api.refreshSuccess'));
  }
}

/* 分配角色 */
const roleDrawerVisible = ref(false);
const currentApi = ref<Api | null>(null);

function openRoleAssign(row: Api) {
  currentApi.value = row;
  roleDrawerVisible.value = true;
}

function createAllColumns(): NaiveUI.TableColumn<Api>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'ID',
      title: $t('page.system.api.index'),
      width: 70,
      align: 'center',
      render: row => row.ID
    },
    { key: 'path', title: $t('page.system.api.path'), minWidth: 200 },
    { key: 'apiGroup', title: $t('page.system.api.apiGroup'), minWidth: 140 },
    { key: 'description', title: $t('page.system.api.description'), minWidth: 180 },
    {
      key: 'method',
      title: $t('page.system.api.method'),
      width: 120,
      align: 'center',
      render: row =>
        h(NTag, { type: methodTagType(row.method), size: 'small', bordered: false }, { default: () => row.method })
    },
    {
      key: 'operation',
      title: $t('page.system.api.operation'),
      align: 'center',
      fixed: 'right',
      width: 280,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              kind: 'edit',
              icon: 'ri:edit-line',
              type: 'primary',
              onClick: () => handleEdit(row.ID)
            },
            {
              label: $t('page.system.api.assignRole'),
              icon: 'ri:user-add-line',
              type: 'info',
              onClick: () => openRoleAssign(row)
            },
            {
              kind: 'delete',
              icon: 'ri:delete-bin-line',
              type: 'error',
              popconfirm: {
                content: $t('page.system.api.confirmDelete'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
    }
  ];
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ApiSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.api.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="center" wrap justify="end" class="lt-sm:w-200px">
          <NButton size="small" ghost type="primary" @click="handleAdd">
            <template #icon>
              <icon-ri-add-line class="text-icon" />
            </template>
            {{ $t('common.add') }}
          </NButton>
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <icon-ri-delete-bin-line class="text-icon" />
                </template>
                {{ $t('page.system.api.batchDelete') }}
              </NButton>
            </template>
            {{ $t('page.system.api.confirmBatchDelete') }}
          </NPopconfirm>
          <NButton size="small" @click="handleRefreshCache">
            <template #icon>
              <icon-ri-refresh-line class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            {{ $t('page.system.api.refresh') }}
          </NButton>
          <TableColumnSetting v-model:columns="columnChecks" />
        </NSpace>
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

      <ApiOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />

      <ApiRoleAssignDrawer v-model:show="roleDrawerVisible" :api="currentApi" />
    </NCard>
  </div>
</template>
