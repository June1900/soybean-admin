<script setup lang="ts">
import { computed, h, reactive } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import {
  fetchCustomerList,
  deleteCustomer,
  type Customer,
  type CustomerListQuery,
  type CustomerSearchParams
} from './api';
import CustomerOperateDrawer from './modules/customer-operate-drawer.vue';
import CustomerSearch from './modules/customer-search.vue';

type CustomerListApiResponse = Awaited<ReturnType<typeof fetchCustomerList>>;

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'ExampleCustomer'
});

const appStore = useAppStore();

/* ---------- search ---------- */
const searchParams = reactive<CustomerSearchParams>({
  customerName: '',
  customerPhoneData: ''
});

/* ---------- table ---------- */
const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  CustomerListApiResponse,
  Customer
>({
  api: () => fetchCustomerList(getQueryParams()),
  transform: res => {
    const body = res.data || { list: [], total: 0, page: 1, pageSize: 10 };
    return {
      data: body.list ?? [],
      total: body.total ?? 0,
      pageNum: body.page ?? 1,
      pageSize: body.pageSize ?? 10
    };
  },
  columns: () => createAllColumns()
});

const scrollX = computed(() =>
  columns.value.reduce(
    (acc, col) =>
      acc +
      ((col as { width?: number; minWidth?: number }).width ??
        (col as { width?: number; minWidth?: number }).minWidth ??
        120),
    0
  )
);

function getQueryParams(): CustomerListQuery {
  const params: CustomerListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.customerName) params.customerName = searchParams.customerName;
  if (searchParams.customerPhoneData) params.customerPhoneData = searchParams.customerPhoneData;
  return params;
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
} = useTableOperate<Customer>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await deleteCustomer(id);
  if (!error) await onDeleted();
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id)) as number[];
  for (const id of ids) {
    const { error } = await deleteCustomer(id);
    if (error) return;
  }
  await onBatchDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<Customer>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.example.customer.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.example.customer.columns.id'), minWidth: 80 },
    { key: 'customerName', title: $t('page.example.customer.columns.customerName'), minWidth: 140 },
    { key: 'customerPhoneData', title: $t('page.example.customer.columns.customerPhoneData'), minWidth: 140 },
    { key: 'CreatedAt', title: $t('page.example.customer.columns.createdAt'), minWidth: 180 },
    {
      key: 'operation',
      title: $t('page.example.customer.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 160,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'info',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.example.customer.deleteConfirm'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CustomerSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.example.customer.title')"
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
        :bordered="false"
        class="sm:h-full"
      />

      <CustomerOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>
