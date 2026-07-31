<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteMenu, fetchGetMenuList, type Menu } from './api';
import MenuOperateDrawer from './modules/menu-operate-drawer.vue';

import TableActionButtons from '@/components/common/table-action-buttons';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'SystemMenu'
});

const appStore = useAppStore();

/* ---------- table (tree) ---------- */
type MenuTreeResponse = Awaited<ReturnType<typeof fetchGetMenuList>>;

const { columns, columnChecks, data, getData, loading } = useNaiveTable<MenuTreeResponse, Menu>({
  api: () => fetchGetMenuList(),
  transform: res => res.data ?? [],
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
const { drawerVisible, closeDrawer, operateType, handleAdd, editingData, handleEdit, onDeleted } =
  useTableOperate<Menu>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMenu(id);
  if (!error) {
    await onDeleted();
  }
}

/* ---------- columns ---------- */
const defaultParentId = ref<number>(0);

function createAllColumns(): NaiveUI.TableColumn<Menu>[] {
  return [
    {
      key: 'id',
      title: $t('page.system.menu.id'),
      width: 100,
      align: 'center',
      render: row => row.ID
    },
    {
      key: 'icon',
      title: $t('page.system.menu.icon'),
      width: 100,
      align: 'center',
      render: row => {
        const icon = row.meta?.icon;
        if (!icon) return '-';
        const iconName = `material-symbols:${icon.startsWith('icon-') ? '' : icon}`;
        return h(
          NTooltip,
          { showArrow: false },
          {
            trigger: () =>
              h('span', { class: 'inline-flex items-center gap-4px', style: 'max-width: 100%; overflow: hidden;' }, [
                h(SvgIcon, { icon: iconName }),
                h('span', { style: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' }, () => icon)
              ]),
            default: () => icon
          }
        );
      }
    },
    {
      key: 'title',
      title: $t('page.system.menu.titleField'),
      minWidth: 160,
      render: row => {
        const text = row.meta?.title ?? '-';
        return h(
          NTooltip,
          { showArrow: false },
          {
            trigger: () =>
              h(
                'span',
                { style: 'display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' },
                text
              ),
            default: () => text
          }
        );
      }
    },
    {
      key: 'name',
      title: $t('page.system.menu.name'),
      minWidth: 130,
      render: row =>
        h(
          NTooltip,
          { showArrow: false },
          {
            trigger: () =>
              h(
                'span',
                { style: 'display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' },
                row.name
              ),
            default: () => row.name
          }
        )
    },
    {
      key: 'path',
      title: $t('page.system.menu.path'),
      minWidth: 130,
      render: row =>
        h(
          NTooltip,
          { showArrow: false },
          {
            trigger: () =>
              h(
                'span',
                { style: 'display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' },
                row.path
              ),
            default: () => row.path
          }
        )
    },
    {
      key: 'visibility',
      title: $t('page.system.menu.visibility'),
      width: 90,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.hidden ? 'warning' : 'success', bordered: false },
          { default: () => (row.hidden ? $t('page.system.menu.hidden') : $t('page.system.menu.show')) }
        )
    },
    {
      key: 'component',
      title: $t('page.system.menu.component'),
      minWidth: 200,
      render: row =>
        h(
          NTooltip,
          { showArrow: false },
          {
            trigger: () =>
              h(
                'span',
                { style: 'display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' },
                row.component
              ),
            default: () => row.component
          }
        )
    },
    {
      key: 'operation',
      title: $t('page.system.menu.operation'),
      align: 'center',
      fixed: 'right',
      width: 400,
      render: row =>
        h(TableActionButtons, {
          wrap: false,
          actions: [
            {
              label: $t('page.system.menu.addChild'),
              icon: 'material-symbols:add',
              type: 'primary',
              onClick: () => {
                defaultParentId.value = row.ID;
                handleAdd();
              }
            },
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'info',
              onClick: () => handleEdit(row.ID)
            },
            {
              label: $t('page.system.menu.assignRole'),
              icon: 'material-symbols:group-add',
              type: 'warning',
              onClick: () => {}
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
    <NCard :title="$t('page.system.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData" />
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        :row-key="row => String(row.ID)"
        is-tree-table
        children-key="children"
        :cascade="false"
        class="sm:h-full"
      />

      <MenuOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        :default-parent-id="defaultParentId"
        @close="closeDrawer"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
