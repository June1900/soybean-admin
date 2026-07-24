<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NButton, NDivider, NSpace, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import {
  fetchGetApiTokenList,
  fetchDeleteApiToken,
  type ApiToken,
  type ApiTokenListQuery,
  type ApiTokenSearchParams
} from './api';
import ApiTokenOperateDrawer from './modules/api-token-operate-drawer.vue';
import ApiTokenSearch from './modules/api-token-search.vue';

type ApiTokenListApiResponse = Awaited<ReturnType<typeof fetchGetApiTokenList>>;

import TableActionButtons from '@/components/common/table-action-buttons';

defineOptions({
  name: 'SystemToolsApiToken'
});

const appStore = useAppStore();

/* ---------- search ---------- */
const searchParams = reactive<ApiTokenSearchParams>({
  userId: null,
  status: null
});

/* ---------- table ---------- */
const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  ApiTokenListApiResponse,
  ApiToken
>({
  api: () => fetchGetApiTokenList(getQueryParams()),
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

function getQueryParams(): ApiTokenListQuery {
  const params: ApiTokenListQuery = {
    page: mobilePagination.value.page,
    pageSize: mobilePagination.value.pageSize
  };
  if (searchParams.userId != null) params.userId = searchParams.userId;
  if (searchParams.status === 'valid') params.status = true;
  if (searchParams.status === 'invalid') params.status = false;
  return params;
}

/* ---------- operate (issue / revoke) ---------- */
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
} = useTableOperate<ApiToken>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteApiToken(id);
  if (!error) {
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id)) as number[];
  for (const id of ids) {
    const { error } = await fetchDeleteApiToken(id);
    if (error) return;
  }
  await onBatchDeleted();
}

/* ---------- token dialog + curl drawer ---------- */
const tokenDialogVisible = ref(false);
const tokenResult = ref('');

const curlDrawerVisible = ref(false);
const curlHeader = ref('');
const curlCookie = ref('');

function handleIssued(token: string) {
  tokenResult.value = token;
  tokenDialogVisible.value = true;
  getData();
}

function openCurl(row: ApiToken) {
  const origin = window.location.origin;
  const url = `${origin}/api/menu/getMenu`;
  const token = row.token ?? '';
  curlHeader.value = `curl -X POST "${url}" -H "x-token: ${token}" -H "Content-Type: application/json"`;
  curlCookie.value = `curl -X POST "${url}" -b "x-token=${token}" -H "Content-Type: application/json"`;
  curlDrawerVisible.value = true;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    window.$message?.success($t('page.systemTools.apiToken.copySuccess'));
  } catch {
    window.$message?.error('Copy failed');
  }
}

function createAllColumns(): NaiveUI.TableColumn<ApiToken>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('page.systemTools.apiToken.columns.id'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'ID', title: $t('page.systemTools.apiToken.columns.id'), minWidth: 80 },
    {
      key: 'user',
      title: $t('page.systemTools.apiToken.columns.user'),
      minWidth: 160,
      render: row => h('span', {}, row.user ? `${row.user.nickName} (${row.user.userName})` : '-')
    },
    { key: 'authorityId', title: $t('page.systemTools.apiToken.columns.authorityId'), minWidth: 100 },
    {
      key: 'status',
      title: $t('page.systemTools.apiToken.columns.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error', size: 'small', bordered: false },
          {
            default: () =>
              row.status
                ? $t('page.systemTools.apiToken.columns.valid')
                : $t('page.systemTools.apiToken.columns.invalid')
          }
        )
    },
    { key: 'expiresAt', title: $t('page.systemTools.apiToken.columns.expiresAt'), minWidth: 180 },
    {
      key: 'remark',
      title: $t('page.systemTools.apiToken.columns.remark'),
      minWidth: 150,
      ellipsis: { tooltip: true }
    },
    {
      key: 'operation',
      title: $t('page.systemTools.apiToken.columns.operations'),
      align: 'center',
      fixed: 'right',
      width: 220,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('page.systemTools.apiToken.columns.curl'),
              icon: 'material-symbols:terminal',
              type: 'info',
              onClick: () => openCurl(row)
            },
            ...(row.status
              ? [
                  {
                    label: $t('page.systemTools.apiToken.columns.invalidate'),
                    icon: 'material-symbols:block',
                    type: 'error' as const,
                    popconfirm: {
                      content: $t('page.systemTools.apiToken.invalidateConfirm'),
                      onPositiveClick: () => handleDelete(row.ID)
                    }
                  }
                ]
              : [])
          ]
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ApiTokenSearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.systemTools.apiToken.title')"
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

      <ApiTokenOperateDrawer :visible="drawerVisible" @close="closeDrawer" @submitted="handleIssued" />
    </NCard>

    <NModal
      v-model:show="tokenDialogVisible"
      :title="$t('page.systemTools.apiToken.tokenDialog.title')"
      preset="card"
      style="width: 520px"
    >
      <NAlert type="warning" :show-icon="true" :title="$t('page.systemTools.apiToken.tokenDialog.warning')" />
      <NInput type="textarea" :rows="6" :value="tokenResult" readonly class="mt-12px" />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="copyText(tokenResult)">{{ $t('page.systemTools.apiToken.tokenDialog.copy') }}</NButton>
          <NButton type="primary" @click="tokenDialogVisible = false">
            {{ $t('page.systemTools.apiToken.tokenDialog.close') }}
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <NDrawer v-model:show="curlDrawerVisible" :width="520" placement="right">
      <NDrawerContent :title="$t('page.systemTools.apiToken.curlDrawer.title')" :native-scrollbar="false">
        <p class="mb-8px font-500">{{ $t('page.systemTools.apiToken.curlDrawer.headerMode') }}</p>
        <NInput type="textarea" :rows="4" :value="curlHeader" readonly />
        <NButton size="small" class="mt-4px" @click="copyText(curlHeader)">
          {{ $t('page.systemTools.apiToken.curlDrawer.copy') }}
        </NButton>
        <NDivider />
        <p class="mb-8px font-500">{{ $t('page.systemTools.apiToken.curlDrawer.cookieMode') }}</p>
        <NInput type="textarea" :rows="4" :value="curlCookie" readonly />
        <NButton size="small" class="mt-4px" @click="copyText(curlCookie)">
          {{ $t('page.systemTools.apiToken.curlDrawer.copy') }}
        </NButton>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
