<script setup lang="ts">
import { computed, h, onMounted } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchCopyAuthority, fetchDeleteAuthority, fetchGetAuthorityList, type Authority } from './api';
import AuthorityOperateDrawer from './modules/authority-operate-drawer.vue';

defineOptions({
  name: 'SystemAuthority'
});

const appStore = useAppStore();

/* ---------- table ---------- */
type AuthorityListResponse = Awaited<ReturnType<typeof fetchGetAuthorityList>>;

const { columns, columnChecks, data, getData, loading, mobilePagination } = useNaivePaginatedTable<
  AuthorityListResponse,
  Authority
>({
  api: () => fetchGetAuthorityList(),
  transform: res => {
    const list = res.data ?? [];
    return {
      data: list,
      total: list.length,
      pageNum: 1,
      pageSize: list.length || 10
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
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate<Authority>(data, 'authorityId', getData);

function createAllColumns(): NaiveUI.TableColumn<Authority>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.system.authority.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
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
      width: 280,
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
                      { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEdit(row.authorityId) },
                      { default: () => $t('page.system.authority.editRole') }
                    ),
                    h(
                      NButton,
                      { size: 'small', tertiary: true, type: 'info', onClick: () => handleCopy(row) },
                      { default: () => $t('page.system.authority.copyRole') }
                    ),
                    h(
                      NPopconfirm,
                      { onPositiveClick: () => handleDelete(row.authorityId) },
                      {
                        trigger: () =>
                          h(
                            NButton,
                            { size: 'small', tertiary: true, type: 'error' },
                            {
                              default: () => $t('page.system.authority.deleteRole')
                            }
                          ),
                        default: () => $t('page.system.authority.confirmDelete')
                      }
                    )
                  ]
                }
              ),
            default: () => $t('page.system.authority.operation')
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

async function handleBatchDelete() {
  for (const id of checkedRowKeys.value) {
    // eslint-disable-next-line no-await-in-loop
    await fetchDeleteAuthority(id);
  }
  await onBatchDeleted();
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
        :row-key="row => String(row.authorityId)"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <AuthorityOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        @close="closeDrawer"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
