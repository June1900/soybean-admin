<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NSpace, NPopconfirm, NPopover, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchSysErrorList,
  deleteSysError,
  type SysError,
  type SysErrorLevel,
  type SysErrorListQuery,
  type SysErrorStatus,
  type SysErrorSearchParams
} from './api';
import SysErrorViewDrawer from './modules/sys-error-view-drawer.vue';
import SysErrorSearch from './modules/sys-error-search.vue';

type SysErrorListApiResponse = Awaited<ReturnType<typeof fetchSysErrorList>>;

defineOptions({
  name: 'SystemToolsSysError'
});

const appStore = useAppStore();

const searchParams = reactive<SysErrorSearchParams>({
  form: '',
  info: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  SysErrorListApiResponse,
  SysError
>({
  api: () => fetchSysErrorList(getQueryParams()),
  transform: res => {
    const body = res.data || { list: [], total: 0, page: 1, pageSize: 10 };
    return {
      data: body.list ?? [],
      total: body.total ?? 0,
      pageNum: body.page ?? 1,
      pageSize: body.pageSize ?? 10
    };
  },
  columns: () => createAllColumns(),
  immediate: false
});

function getQueryParams(): SysErrorListQuery {
  const params: SysErrorListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.form) params.form = searchParams.form;
  if (searchParams.info) params.info = searchParams.info;
  return params;
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

/* ---------- operate ---------- */
const { onDeleted } = useTableOperate<SysError>(data, 'ID', getData);

const viewVisible = ref(false);
const viewData = ref<SysError | null>(null);

function openView(row: SysError) {
  viewData.value = row;
  viewVisible.value = true;
}

async function handleDelete(row: SysError) {
  const { error } = await deleteSysError(row.ID);
  if (!error) await onDeleted();
}

const levelTagType: Record<SysErrorLevel, 'error' | 'warning'> = {
  fatal: 'error',
  error: 'warning'
};

const statusTagType: Record<SysErrorStatus, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  done: 'success',
  failed: 'error'
};

function createAllColumns(): NaiveUI.TableColumn<SysError>[] {
  return [
    {
      key: 'index',
      title: $t('page.systemTools.sysError.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.systemTools.sysError.columns.id'), minWidth: 70 },
    { key: 'CreatedAt', title: $t('page.systemTools.sysError.columns.createdAt'), minWidth: 170 },
    { key: 'form', title: $t('page.systemTools.sysError.columns.form'), minWidth: 140 },
    {
      key: 'level',
      title: $t('page.systemTools.sysError.columns.level'),
      width: 90,
      align: 'center',
      render: row =>
        h(NTag, { type: levelTagType[row.level], size: 'small', bordered: false }, { default: () => $t(`page.systemTools.sysError.level.${row.level}`) })
    },
    {
      key: 'status',
      title: $t('page.systemTools.sysError.columns.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(NTag, { type: statusTagType[row.status], size: 'small', bordered: false }, { default: () => $t(`page.systemTools.sysError.status.${row.status}`) })
    },
    { key: 'info', title: $t('page.systemTools.sysError.columns.info'), minWidth: 220, ellipsis: { tooltip: true } },
    { key: 'solution', title: $t('page.systemTools.sysError.columns.solution'), minWidth: 160, ellipsis: { tooltip: true } },
    {
      key: 'operation',
      title: $t('page.systemTools.sysError.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 140,
      render: row =>
        h(
          NPopover,
          { trigger: 'click', placement: 'bottom-end' },
          {
            trigger: () => h(NButton, { size: 'small', tertiary: true, type: 'primary' }, { default: () => $t('page.systemTools.sysError.columns.operations') }),
            default: () =>
              h(NSpace, { justify: 'center', size: 'small' }, {
                default: () => [
                  h(NButton, { size: 'small', tertiary: true, onClick: () => openView(row) }, { default: () => $t('page.systemTools.sysError.columns.view') }),
                  h(
                    NPopconfirm,
                    { onPositiveClick: () => handleDelete(row) },
                    {
                      trigger: () => h(NButton, { size: 'small', tertiary: true, type: 'error' }, { default: () => $t('page.systemTools.sysError.columns.delete') }),
                      default: () => $t('common.confirmDelete')
                    }
                  )
                ]
              })
          }
        )
    }
  ];
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SysErrorSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard :title="$t('page.systemTools.sysError.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <div class="flex-center gap-8px">
          <NButton size="small" :loading="loading" @click="getData">
            <template #icon>
              <icon-mdi-refresh class="text-16px" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
          <TableColumnSetting v-model:columns="columnChecks" />
        </div>
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="row => String(row.ID)"
        :flex-height="!appStore.isMobile"
        remote
        :scroll-x="scrollX"
        :pagination="mobilePagination"
        :bordered="false"
        class="sm:h-full"
      />
    </NCard>

    <SysErrorViewDrawer :visible="viewVisible" :data="viewData" @close="viewVisible = false" />
  </div>
</template>
