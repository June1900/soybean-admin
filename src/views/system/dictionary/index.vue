<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NButton, NEmpty, NPopconfirm, NSpace, NTag, NTooltip } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import {
  fetchDeleteDictionary,
  fetchDeleteDictionaryDetail,
  fetchGetDictionaryDetailList,
  fetchGetDictionaryList,
  type Dictionary,
  type DictionaryDetail,
  type DictionarySearchParams
} from './api';
import DictionaryOperateDrawer from './modules/dictionary-operate-drawer.vue';
import DictionaryDetailOperateDrawer from './modules/dictionary-detail-operate-drawer.vue';
import DictionarySearch from './modules/dictionary-search.vue';

defineOptions({
  name: 'SystemDictionary'
});

const appStore = useAppStore();

/* ---------- search model ---------- */
const searchParams = reactive<DictionarySearchParams>({
  name: '',
  type: ''
});

function getQueryParams() {
  return {
    name: searchParams.name || undefined,
    type: searchParams.type || undefined
  };
}

/* ---------- dictionary list (master) ---------- */
type DictListResponse = Awaited<ReturnType<typeof fetchGetDictionaryList>>;

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<
  DictListResponse,
  Dictionary
>({
  api: () => fetchGetDictionaryList(getQueryParams()),
  // The list api returns a plain array (no server pagination), so we paginate client-side.
  transform: res => ({
    data: res.data ?? [],
    total: res.data?.length ?? 0,
    pageNum: 1,
    pageSize: 10
  }),
  columns: () => createAllColumns()
});

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

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
} = useTableOperate<Dictionary>(data, 'ID', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteDictionary(id);
  if (!error) {
    if (selectedDictId.value === id) {
      selectedDictId.value = null;
      selectedDictName.value = '';
      detailData.value = [];
    }
    await onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(Number);
  for (const id of ids) {
    const { error } = await fetchDeleteDictionary(id);
    if (error) return;
  }
  await onBatchDeleted();
}

function createAllColumns(): NaiveUI.TableColumn<Dictionary>[] {
  return [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'index',
      title: $t('page.system.dictionary.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'name', title: $t('page.system.dictionary.name'), minWidth: 140 },
    { key: 'type', title: $t('page.system.dictionary.type'), minWidth: 140 },
    {
      key: 'status',
      title: $t('page.system.dictionary.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error' },
          { default: () => (row.status ? $t('page.system.dictionary.enabled') : $t('page.system.dictionary.disabled')) }
        )
    },
    { key: 'desc', title: $t('page.system.dictionary.desc'), minWidth: 160, render: row => row.desc || '-' },
    {
      key: 'operation',
      title: $t('page.system.dictionary.operation'),
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
                      { size: 'small', tertiary: true, type: 'primary', onClick: () => selectDict(row.ID) },
                      {
                        default: () => $t('page.system.dictionary.detail')
                      }
                    ),
                    h(
                      NButton,
                      { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEdit(row.ID) },
                      {
                        default: () => $t('page.system.dictionary.editDictionary')
                      }
                    ),
                    h(
                      NPopconfirm,
                      { onPositiveClick: () => handleDelete(row.ID) },
                      {
                        trigger: () =>
                          h(
                            NButton,
                            { size: 'small', tertiary: true, type: 'error' },
                            {
                              default: () => $t('page.system.dictionary.deleteDictionary')
                            }
                          ),
                        default: () => $t('page.system.dictionary.confirmDeleteDictionary')
                      }
                    )
                  ]
                }
              ),
            default: () => $t('page.system.dictionary.operation')
          }
        )
    }
  ];
}

/* ---------- dictionary detail list (slave) ---------- */
const selectedDictId = ref<number | null>(null);
const selectedDictName = ref('');
const detailData = ref<DictionaryDetail[]>([]);
const detailLoading = ref(false);

async function getDetailData() {
  if (!selectedDictId.value) {
    detailData.value = [];
    return;
  }
  detailLoading.value = true;
  const { data, error } = await fetchGetDictionaryDetailList({ sysDictionaryID: selectedDictId.value });
  if (!error) detailData.value = data ?? [];
  detailLoading.value = false;
}

function selectDict(id: number) {
  const dict = data.value.find(item => item.ID === id);
  selectedDictId.value = id;
  selectedDictName.value = dict?.name ?? '';
  getDetailData();
}

const detailColumnList = computed(() => createDetailColumns());
const detailScrollX = computed(() =>
  detailColumnList.value.reduce((acc, col) => acc + Number(col.minWidth ?? col.width ?? 120), 0)
);

const {
  drawerVisible: detailDrawerVisible,
  closeDrawer: closeDetailDrawer,
  operateType: detailOperateType,
  handleAdd: handleAddDetail,
  editingData: detailEditingData,
  handleEdit: handleEditDetail,
  onDeleted: onDetailDeleted
} = useTableOperate<DictionaryDetail>(detailData, 'ID', getDetailData);

async function handleDeleteDetail(id: number) {
  const { error } = await fetchDeleteDictionaryDetail(id);
  if (!error) await onDetailDeleted();
}

function handleAddDetailClick() {
  if (!selectedDictId.value) {
    window.$message?.warning($t('page.system.dictionary.selectDictHint'));
    return;
  }
  handleAddDetail();
}

function createDetailColumns(): NaiveUI.TableColumn<DictionaryDetail>[] {
  return [
    {
      key: 'index',
      title: $t('page.system.dictionary.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'label', title: $t('page.system.dictionary.label'), minWidth: 140 },
    { key: 'value', title: $t('page.system.dictionary.value'), minWidth: 140 },
    { key: 'extend', title: $t('page.system.dictionary.extend'), minWidth: 120, render: row => row.extend || '-' },
    {
      key: 'status',
      title: $t('page.system.dictionary.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { type: row.status ? 'success' : 'error' },
          { default: () => (row.status ? $t('page.system.dictionary.enabled') : $t('page.system.dictionary.disabled')) }
        )
    },
    { key: 'sort', title: $t('page.system.dictionary.sort'), width: 90, align: 'center' },
    {
      key: 'operation',
      title: $t('page.system.dictionary.operation'),
      align: 'center',
      fixed: 'right',
      width: 190,
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
                      { size: 'small', tertiary: true, type: 'primary', onClick: () => handleEditDetail(row.ID) },
                      {
                        default: () => $t('page.system.dictionary.editDetail')
                      }
                    ),
                    h(
                      NPopconfirm,
                      { onPositiveClick: () => handleDeleteDetail(row.ID) },
                      {
                        trigger: () =>
                          h(
                            NButton,
                            { size: 'small', tertiary: true, type: 'error' },
                            {
                              default: () => $t('page.system.dictionary.deleteDetail')
                            }
                          ),
                        default: () => $t('page.system.dictionary.confirmDeleteDetail')
                      }
                    )
                  ]
                }
              ),
            default: () => $t('page.system.dictionary.operation')
          }
        )
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DictionarySearch v-model:model="searchParams" @search="getDataByPage" @reset="getDataByPage" />

    <NCard
      :title="$t('page.system.dictionary.title')"
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
        :row-props="() => ({ style: 'cursor: pointer' })"
        class="sm:h-full"
        @row-click="(row: Dictionary) => selectDict(row.ID)"
      />
    </NCard>

    <NCard :bordered="false" size="small" class="flex-1 flex-col-stretch sm:p-16px">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-16px font-500">
            {{ $t('page.system.dictionary.detailTitle') }}
            <span v-if="selectedDictName" class="text-14px text-gray-400">（{{ selectedDictName }}）</span>
          </span>
          <NButton type="primary" size="small" :disabled="!selectedDictId" @click="handleAddDetailClick">
            {{ $t('page.system.dictionary.addDetail') }}
          </NButton>
        </div>
      </template>

      <NEmpty
        v-if="!selectedDictId"
        :description="$t('page.system.dictionary.selectDictHint')"
        class="flex-1 items-center justify-center"
      />
      <NDataTable
        v-else
        :columns="detailColumnList"
        :data="detailData"
        :loading="detailLoading"
        :row-key="row => String(row.ID)"
        flex-height
        :scroll-x="detailScrollX"
        :bordered="false"
      />
    </NCard>

    <DictionaryOperateDrawer
      :visible="drawerVisible"
      :operate-type="operateType"
      :editing-data="editingData"
      @close="closeDrawer"
      @submitted="getDataByPage"
    />

    <DictionaryDetailOperateDrawer
      :visible="detailDrawerVisible"
      :operate-type="detailOperateType"
      :editing-data="detailEditingData"
      :dict-id="selectedDictId"
      :details="detailData"
      @close="closeDetailDrawer"
      @submitted="getDetailData"
    />
  </div>
</template>

<style scoped></style>
