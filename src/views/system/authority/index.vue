<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchCopyAuthority, fetchDeleteAuthority, fetchGetAuthorityList, type Authority } from './api';
import AuthorityOperateDrawer from './modules/authority-operate-drawer.vue';
import AuthorityPermissionModal from './modules/authority-permission-modal.vue';
import AuthorityAssignUserModal from './modules/authority-assign-user-modal.vue';

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemAuthority'
});

const appStore = useAppStore();

/* ---------- table ---------- */
type AuthorityListResponse = Awaited<ReturnType<typeof fetchGetAuthorityList>>;

const { columns, columnChecks, data, getData, loading, scrollX } = useNaiveTable<
  AuthorityListResponse,
  Authority
>({
  api: () => fetchGetAuthorityList(),
  transform: res => res.data ?? [],
  columns: () => createAllColumns(),
  immediate: false
});

const dataScopeOptions = computed(() => [
  { label: $t('page.system.authority.allData'), value: 1 },
  { label: $t('page.system.authority.deptAndBelow'), value: 2 },
  { label: $t('page.system.authority.deptOnly'), value: 3 },
  { label: $t('page.system.authority.selfOnly'), value: 4 },
  { label: $t('page.system.authority.customDept'), value: 5 }
]);

const dataScopeTagType = (value: number) => (value === 1 ? 'success' : value === 5 ? 'warning' : 'default');

/* ---------- operate (add / edit / copy / delete) ---------- */
const {
  drawerVisible,
  closeDrawer,
  operateType,
  handleAdd,
  editingData,
  handleEdit,
  onDeleted
} = useTableOperate<Authority>(data, 'authorityId', getData);

/** 新增子角色时预置的父级角色 ID（顶级为 0） */
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
        const opt = dataScopeOptions.value.find(o => o.value === row.dataScope);
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
      width: 680,
      render: row =>
        h(
          TableActionButtons,
          {
            wrap: true,
            actions: [
              {
                label: $t('page.system.authority.setPermission'),
                icon: 'material-symbols:lock-person',
                type: 'default',
                onClick: () => openPermission(row)
              },
              {
                label: $t('page.system.authority.assignUser'),
                icon: 'material-symbols:group-add',
                type: 'default',
                onClick: () => openAssignUser(row)
              },
              {
                label: $t('page.system.authority.addChildRole'),
                icon: 'material-symbols:account-tree',
                type: 'default',
                onClick: () => handleAddChild(row)
              },
              {
                label: $t('page.system.authority.copyRole'),
                icon: 'material-symbols:content-copy',
                type: 'info',
                onClick: () => handleCopy(row)
              },
              {
                kind: 'edit',
                icon: 'material-symbols:edit',
                type: 'primary',
                onClick: () => handleEdit(row.authorityId)
              },
              {
                kind: 'delete',
                icon: 'material-symbols:delete',
                type: 'error',
                popconfirm: {
                  content: $t('page.system.authority.confirmDelete'),
                  onPositiveClick: () => handleDelete(row.authorityId)
                }
              }
            ]
          }
        )
    }
  ];
}

/* ---------- actions ---------- */
function handleCopy(row: Authority) {
  window.$dialog?.info({
    title: $t('page.system.authority.copyRole'),
    content: $t('page.system.authority.confirmCopy'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchCopyAuthority({
        authorityId: row.authorityId,
        authorityName: row.authorityName,
        parentId: row.parentId,
        dataScope: row.dataScope,
        oldAuthorityId: row.authorityId
      });
      if (!error) {
        window.$message?.success($t('page.system.authority.copySuccess'));
        await getData();
      }
    }
  });
}

async function handleDelete(authorityId: string) {
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

      <AuthorityPermissionModal
        :visible="permissionModalVisible"
        :role="currentRole"
        @close="permissionModalVisible = false"
        @submitted="getData"
      />

      <AuthorityAssignUserModal
        :visible="assignUserModalVisible"
        :role="currentRole"
        @close="assignUserModalVisible = false"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
