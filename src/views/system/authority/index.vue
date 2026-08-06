<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteAuthority, fetchGetAuthorityList, type Authority } from './api';
import { dataScopeOptions, dataScopeTagType } from './shared';
import AuthorityOperateDrawer from './modules/authority-operate-drawer.vue';
import AuthorityPermissionDrawer from './modules/authority-permission-drawer.vue';
import AuthorityAssignUserDrawer from './modules/authority-assign-user-drawer.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemAuthority'
});

const appStore = useAppStore();

type AuthorityListResponse = Awaited<ReturnType<typeof fetchGetAuthorityList>>;

const { columns, columnChecks, data, getData, loading, scrollX } = useNaiveTable<AuthorityListResponse, Authority>({
  api: () => fetchGetAuthorityList(),
  transform: res => res.data ?? [],
  columns: () => createAllColumns(),
  immediate: false
});

const dataScopeOpts = computed(() => dataScopeOptions());

const { drawerVisible, closeDrawer, operateType, handleAdd, editingData, handleEdit, onDeleted } =
  useTableOperate<Authority>(data, 'authorityId', getData);

/** 新增子角色时预置的父级 ID（顶级为 0） */
const defaultParentId = ref<number | null>(null);
const permissionModalVisible = ref(false);
const assignUserModalVisible = ref(false);
const currentRole = ref<Authority | null>(null);

function handleAddTop() {
  defaultParentId.value = 0;
  handleAdd();
}

function handleAddChild(row: Authority) {
  defaultParentId.value = Number(row.authorityId) || 0;
  handleAdd();
}

function openPermission(row: Authority) {
  currentRole.value = row;
  permissionModalVisible.value = true;
}

function openAssignUser(row: Authority) {
  currentRole.value = row;
  assignUserModalVisible.value = true;
}

function createAllColumns(): NaiveUI.TableColumn<Authority>[] {
  return [
    { key: 'authorityId', title: $t('page.system.authority.authorityId'), minWidth: 140 },
    { key: 'authorityName', title: $t('page.system.authority.authorityName'), minWidth: 160 },
    {
      key: 'dataScope',
      title: $t('page.system.authority.dataScope'),
      width: 140,
      align: 'center',
      render: row => {
        const opt = dataScopeOpts.value.find(o => o.value === row.dataScope);
        return h(
          NTag,
          { type: dataScopeTagType(row.dataScope), size: 'small', bordered: false },
          { default: () => opt?.label ?? String(row.dataScope) }
        );
      }
    },
    {
      key: 'operation',
      title: $t('page.system.authority.operation'),
      align: 'center',
      fixed: 'right',
      width: 600,
      render: row =>
        h(TableActionButtons, {
          wrap: true,
          actions: [
            {
              label: $t('page.system.authority.setPermission'),
              icon: 'ri:admin-line',
              type: 'default',
              onClick: () => openPermission(row)
            },
            {
              label: $t('page.system.authority.assignUser'),
              icon: 'ri:group-line',
              type: 'default',
              onClick: () => openAssignUser(row)
            },
            {
              label: $t('page.system.authority.addChildRole'),
              icon: 'ri:node-tree',
              type: 'default',
              onClick: () => handleAddChild(row)
            },
            {
              kind: 'edit',
              icon: 'ri:edit-line',
              type: 'primary',
              onClick: () => handleEdit(row.authorityId)
            },
            {
              kind: 'delete',
              icon: 'ri:delete-bin-line',
              type: 'error',
              popconfirm: {
                content: $t('page.system.authority.confirmDelete'),
                onPositiveClick: () => handleDelete(row.authorityId)
              }
            }
          ]
        })
    }
  ];
}

async function handleDelete(authorityId: number) {
  const { error } = await fetchDeleteAuthority(authorityId);
  if (!error) {
    await onDeleted();
  }
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard
      :title="$t('page.system.authority.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          @add="handleAddTop"
          @refresh="getData"
        />
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        :row-key="row => String(row.authorityId)"
        class="sm:h-full"
      />

      <AuthorityOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        :default-parent-id="defaultParentId"
        @close="closeDrawer"
        @submitted="getData"
      />

      <AuthorityPermissionDrawer
        :visible="permissionModalVisible"
        :role="currentRole"
        @close="permissionModalVisible = false"
      />

      <AuthorityAssignUserDrawer
        :visible="assignUserModalVisible"
        :role="currentRole"
        @close="assignUserModalVisible = false"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>