<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NButton, NSpace, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import SvgIcon from '@/components/custom/svg-icon.vue';
import {
  fetchGetApiTokenList,
  fetchDeleteApiToken,
  type ApiToken,
  type ApiTokenListQuery,
  type ApiTokenSearchParams
} from './api';
import ApiTokenOperateDrawer from './modules/api-token-operate-drawer.vue';
import ApiTokenSearch from './modules/api-token-search.vue';
import ApiTokenResultModal from './modules/api-token-result-modal.vue';
import ApiTokenCurlDrawer from './modules/api-token-curl-drawer.vue';

type ApiTokenListApiResponse = Awaited<ReturnType<typeof fetchGetApiTokenList>>;

defineOptions({
  name: 'SystemToolsApiToken'
});

const appStore = useAppStore();

const searchParams = reactive<ApiTokenSearchParams>({
  userId: null,
  status: null
});

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
  if (searchParams.userId) {
    const uid = Number(searchParams.userId);
    if (!Number.isNaN(uid)) params.userId = uid;
  }
  if (searchParams.status === 'valid') params.status = true;
  if (searchParams.status === 'invalid') params.status = false;
  return params;
}

const { drawerVisible, closeDrawer, handleAdd, checkedRowKeys, onDeleted } = useTableOperate<ApiToken>(
  data,
  'ID',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteApiToken(id);
  if (!error) {
    await onDeleted();
  }
}

/* ---------- Token 弹窗 + Curl 抽屉 ---------- */
const resultModalVisible = ref(false);
const tokenResult = ref('');

const curlDrawerVisible = ref(false);
const curlToken = ref('');

function handleIssued(token: string) {
  tokenResult.value = token;
  resultModalVisible.value = true;
  getData();
}

function openCurl(row: ApiToken) {
  curlToken.value = row.token ?? '';
  curlDrawerVisible.value = true;
}

/* 格式化过期时间：永久令牌显示「永久」，空值显示「-」 */
function formatExpiresAt(val?: string): string {
  if (!val) return '-';
  const d = dayjs(val);
  if (!d.isValid()) return val;
  if (d.year() >= 9999) return $t('page.systemTools.apiToken.drawer.permanent');
  return d.format('YYYY-MM-DD HH:mm:ss');
}

/* 作废确认弹窗 */
function handleInvalidate(row: ApiToken) {
  window.$dialog?.warning({
    title: $t('page.systemTools.apiToken.columns.invalidate'),
    content: $t('page.systemTools.apiToken.invalidateConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    positiveButtonProps: { type: 'default' },
    onPositiveClick: () => handleDelete(row.ID)
  });
}

/* ---------- 列定义 ---------- */
function createAllColumns(): NaiveUI.TableColumn<ApiToken>[] {
  return [
    {
      key: 'index',
      title: $t('page.systemTools.apiToken.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
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
    {
      key: 'expiresAt',
      title: $t('page.systemTools.apiToken.columns.expiresAt'),
      minWidth: 180,
      render: row => formatExpiresAt(row.expiresAt)
    },
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
      width: 200,
      render: row =>
        h(NSpace, { justify: 'center', size: 'small' }, () => [
          h(
            NButton,
            { size: 'small', ghost: true, type: 'info', onClick: () => openCurl(row) },
            {
              icon: () => h(SvgIcon, { icon: 'material-symbols:terminal' }),
              default: () => $t('page.systemTools.apiToken.columns.curl')
            }
          ),
          ...(row.status
            ? [
                h(
                  NButton,
                  { size: 'small', ghost: true, type: 'error', onClick: () => handleInvalidate(row) },
                  {
                    icon: () => h(SvgIcon, { icon: 'material-symbols:block' }),
                    default: () => $t('page.systemTools.apiToken.columns.invalidate')
                  }
                )
              ]
            : [])
        ])
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
          :loading="loading"
          :show-batch-delete="false"
          @refresh="getData"
        >
          <NButton size="small" ghost type="primary" @click="handleAdd">
            <template #icon>
              <icon-ic-round-plus class="text-icon" />
            </template>
            {{ $t('page.systemTools.apiToken.issue') }}
          </NButton>
        </TableHeaderOperation>
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

    <ApiTokenResultModal v-model:show="resultModalVisible" v-model:token="tokenResult" />
    <ApiTokenCurlDrawer v-model:show="curlDrawerVisible" :token="curlToken" />
  </div>
</template>
