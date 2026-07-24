<script setup lang="ts">
import { computed, h, onMounted, reactive } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteMenu, fetchGetMenuList, type Menu, type MenuSearchParams } from './api';
import MenuOperateDrawer from './modules/menu-operate-drawer.vue';
import MenuSearch from './modules/menu-search.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemMenu'
});

const appStore = useAppStore();

/* ---------- table ---------- */
type MenuListResponse = Awaited<ReturnType<typeof fetchGetMenuList>>;

/** Flatten a menu tree into a flat list for the table. */
function flattenMenus(list: Menu[] = [], acc: Menu[] = []): Menu[] {
  for (const item of list) {
    acc.push(item);
    if (item.children?.length) {
      flattenMenus(item.children, acc);
    }
  }
  return acc;
}

const searchParams = reactive<MenuSearchParams>({
  title: '',
  name: '',
  component: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  MenuListResponse,
  Menu
>({
  api: () => fetchGetMenuList(),
  transform: res => {
    const flat = flattenMenus(res.data?.list ?? []);
    const keyword = (searchParams.title || searchParams.name || searchParams.component).toLowerCase();
    const filtered = keyword
      ? flat.filter(
          m =>
            m.meta?.title?.toLowerCase().includes(keyword) ||
            m.name?.toLowerCase().includes(keyword) ||
            m.component?.toLowerCase().includes(keyword)
        )
      : flat;
    return {
      data: filtered,
      total: filtered.length,
      pageNum: 1,
      pageSize: filtered.length || 10
    };
  },
  columns: () => createAllColumns(),
  immediate: false
});

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

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
} = useTableOperate<Menu>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMenu(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  for (const id of checkedRowKeys.value.map(id => Number(id))) {
    // eslint-disable-next-line no-await-in-loop
    await fetchDeleteMenu(id);
  }
  await onBatchDeleted();
}

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Menu>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.system.menu.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'title', title: $t('page.system.menu.titleField'), minWidth: 160, render: row => row.meta?.title ?? '-' },
    { key: 'name', title: $t('page.system.menu.name'), minWidth: 140 },
    { key: 'path', title: $t('page.system.menu.path'), minWidth: 160 },
    { key: 'component', title: $t('page.system.menu.component'), minWidth: 180 },
    { key: 'sort', title: $t('page.system.menu.sort'), width: 80, align: 'center', render: row => row.sort ?? '-' },
    {
      key: 'icon',
      title: $t('page.system.menu.icon'),
      width: 120,
      render: row =>
        row.meta?.icon ? h(NTag, { size: 'small', bordered: false }, { default: () => row.meta.icon }) : '-'
    },
    {
      key: 'keepAlive',
      title: $t('page.system.menu.keepAlive'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.meta?.keepAlive ? 'success' : 'default', bordered: false },
          { default: () => (row.meta?.keepAlive ? $t('common.yesOrNo.yes') : $t('common.yesOrNo.no')) }
        )
    },
    {
      key: 'visibility',
      title: $t('page.system.menu.visibility'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.hidden ? 'warning' : 'success', bordered: false },
          { default: () => (row.hidden ? $t('page.system.menu.hidden') : $t('page.system.menu.show')) }
        )
    },
    {
      key: 'operation',
      title: $t('page.system.menu.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'primary',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.system.menu.confirmDelete'),
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
    <MenuSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.system.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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

      <MenuOperateDrawer
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
