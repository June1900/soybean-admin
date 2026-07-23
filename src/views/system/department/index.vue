<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchDeleteDepartment,
  fetchGetDepartmentList,
  type Department,
  type DepartmentListQuery,
  type DepartmentSearchParams
} from './api';
import DepartmentOperateDrawer from './modules/department-operate-drawer.vue';
import DepartmentSearch from './modules/department-search.vue';

defineOptions({
  name: 'SystemDepartment'
});

const appStore = useAppStore();

/* ---------- search model ---------- */
const searchModel = reactive<DepartmentSearchParams>({
  name: ''
});

/* ---------- table ---------- */
type DepartmentListResponse = Awaited<ReturnType<typeof fetchGetDepartmentList>>;

const parentOptions = ref<{ label: string; value: number }[]>([]);

function flatten(list: Department[] = [], acc: Department[] = []): Department[] {
  for (const item of list) {
    acc.push(item);
    if (item.children?.length) flatten(item.children, acc);
  }
  return acc;
}

function getQueryParams(): DepartmentListQuery {
  return {
    name: searchModel.name || undefined,
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
}

const { data, columns, columnChecks, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  DepartmentListResponse,
  Department
>({
  api: () => fetchGetDepartmentList(getQueryParams()),
  transform: res => ({
    data: res.data?.list ?? [],
    total: res.data?.total ?? 0,
    pageNum: res.data?.page ?? 1,
    pageSize: res.data?.pageSize ?? 10
  }),
  columns: () => createAllColumns(),
  immediate: false
});

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const parentName = (id: number) => parentOptions.value.find(o => o.value === id)?.label ?? '-';

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
} = useTableOperate<Department>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteDepartment(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const results = await Promise.all(ids.map(id => fetchDeleteDepartment(id)));
  if (!results.some(r => r.error)) {
    await onBatchDeleted();
  }
}

async function loadParentOptions(excludeId?: number) {
  const { data: res } = await fetchGetDepartmentList({ page: 1, pageSize: 9999 });
  const all = flatten(res?.list ?? []).filter(d => d.ID !== excludeId);
  parentOptions.value = [
    { label: $t('page.system.department.parentId'), value: 0 },
    ...all.map(d => ({ label: d.name, value: d.ID }))
  ];
}

onMounted(() => {
  loadParentOptions();
  getData();
});

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Department>[] {
  return [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.department.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'name', title: $t('page.system.department.name'), minWidth: 160 },
    {
      key: 'parentId',
      title: $t('page.system.department.parentId'),
      minWidth: 160,
      render: row => parentName(row.parentId)
    },
    { key: 'leader', title: $t('page.system.department.leader'), minWidth: 120, render: row => row.leader || '-' },
    {
      key: 'sort',
      title: $t('page.system.department.sort'),
      width: 80,
      align: 'center',
      render: row => row.sort ?? '-'
    },
    {
      key: 'status',
      title: $t('page.system.department.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.status === 1 ? 'success' : 'default', bordered: false },
          {
            default: () =>
              row.status === 1 ? $t('page.system.department.enabled') : $t('page.system.department.disabled')
          }
        )
    },
    {
      key: 'operation',
      title: $t('page.system.department.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row =>
        h(
          NTooltip,
          {},
          {
            trigger: () =>
              h(
                NSpace,
                { justify: 'center', size: 'small' },
                {
                  default: () => [
                    h(
                      NButton,
                      { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEdit(row.ID) },
                      {
                        default: () => $t('page.system.department.editDept')
                      }
                    ),
                    h(
                      NPopconfirm,
                      { onPositiveClick: () => handleDelete(row.ID) },
                      {
                        trigger: () =>
                          h(
                            NButton,
                            { size: 'small', tertiary: true, type: 'error' },
                            {
                              default: () => $t('page.system.department.deleteDept')
                            }
                          ),
                        default: () => $t('page.system.department.confirmDelete')
                      }
                    )
                  ]
                }
              ),
            default: () => $t('page.system.department.operation')
          }
        )
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DepartmentSearch v-model:model="searchModel" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.system.department.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
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

      <DepartmentOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        :parent-options="parentOptions"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>
