<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NSpace, NPopconfirm, NPopover } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchVersionList,
  deleteVersion,
  type SysVersion,
  type SysVersionListQuery,
  type VersionSearchParams
} from './api';
import VersionViewDrawer from './modules/version-view-drawer.vue';
import VersionOperateDrawer from './modules/version-operate-drawer.vue';
import VersionSearch from './modules/version-search.vue';

type VersionListApiResponse = Awaited<ReturnType<typeof fetchVersionList>>;

defineOptions({
  name: 'SystemToolsVersion'
});

const appStore = useAppStore();

const searchParams = reactive<VersionSearchParams>({
  versionName: '',
  versionCode: ''
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  VersionListApiResponse,
  SysVersion
>({
  api: () => fetchVersionList(getQueryParams()),
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

function getQueryParams(): SysVersionListQuery {
  const params: SysVersionListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.versionName) params.versionName = searchParams.versionName;
  if (searchParams.versionCode) params.versionCode = searchParams.versionCode;
  return params;
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const { onDeleted } = useTableOperate<SysVersion>(data, 'ID', getData);

const viewVisible = ref(false);
const viewData = ref<SysVersion | null>(null);
const createVisible = ref(false);

function openView(row: SysVersion) {
  viewData.value = row;
  viewVisible.value = true;
}

function handleDownload(row: SysVersion) {
  window.$message?.info(`${$t('page.systemTools.version.download')}：${row.versionCode}`);
}

async function handleDelete(row: SysVersion) {
  const { error } = await deleteVersion(row.ID);
  if (!error) await onDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<SysVersion>[] {
  return [
    {
      key: 'index',
      title: $t('page.systemTools.version.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.systemTools.version.columns.id'), minWidth: 70 },
    { key: 'CreatedAt', title: $t('page.systemTools.version.columns.createdAt'), minWidth: 170 },
    { key: 'versionName', title: $t('page.systemTools.version.columns.versionName'), minWidth: 160 },
    { key: 'versionCode', title: $t('page.systemTools.version.columns.versionCode'), minWidth: 120 },
    {
      key: 'description',
      title: $t('page.systemTools.version.columns.description'),
      minWidth: 220,
      ellipsis: { tooltip: true }
    },
    {
      key: 'operation',
      title: $t('page.systemTools.version.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 200,
      render: row =>
        h(
          NPopover,
          { trigger: 'click', placement: 'bottom-end' },
          {
            trigger: () =>
              h(
                NButton,
                { size: 'small', tertiary: true, type: 'primary' },
                { default: () => $t('page.systemTools.version.columns.operations') }
              ),
            default: () =>
              h(
                NSpace,
                { justify: 'center', size: 'small' },
                {
                  default: () => [
                    h(
                      NButton,
                      { size: 'small', tertiary: true, onClick: () => openView(row) },
                      { default: () => $t('page.systemTools.version.columns.view') }
                    ),
                    h(
                      NButton,
                      { size: 'small', tertiary: true, type: 'info', onClick: () => handleDownload(row) },
                      { default: () => $t('page.systemTools.version.columns.download') }
                    ),
                    h(
                      NPopconfirm,
                      { onPositiveClick: () => handleDelete(row) },
                      {
                        trigger: () =>
                          h(
                            NButton,
                            { size: 'small', tertiary: true, type: 'error' },
                            { default: () => $t('page.systemTools.version.columns.delete') }
                          ),
                        default: () => $t('common.confirmDelete')
                      }
                    )
                  ]
                }
              )
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
    <VersionSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.systemTools.version.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <div class="flex-center gap-8px">
          <NButton size="small" :loading="loading" @click="getData">
            <template #icon>
              <icon-mdi-refresh class="text-16px" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
          <TableColumnSetting v-model:columns="columnChecks" />
          <NButton type="primary" size="small" @click="createVisible = true">
            {{ $t('page.systemTools.version.add') }}
          </NButton>
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

    <VersionViewDrawer :visible="viewVisible" :data="viewData" @close="viewVisible = false" />
    <VersionOperateDrawer :visible="createVisible" @close="createVisible = false" @submitted="getData" />
  </div>
</template>
