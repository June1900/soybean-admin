<script setup lang="ts">
import { h, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NDataTable, NInput, NModal, NSpace, useThemeVars } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import { fetchGetUserList, type User, type UserListQuery } from '../../user/api';

defineOptions({
  name: 'LeaderSelectModal'
});

const props = defineProps<{
  visible: boolean;
  selectedId?: number | null;
}>();

const emit = defineEmits<{ close: []; selected: [user: User] }>();

const { loading, startLoading, endLoading } = useLoading();

const themeVars = useThemeVars();

const keyword = ref('');
const users = ref<User[]>([]);
const checkedRowKeys = ref<number[]>(props.selectedId ? [props.selectedId] : []);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  prefix: ({ itemCount }: { itemCount?: number }) => `共 ${itemCount ?? 0} 条`,
  onChange: (page: number) => {
    pagination.page = page;
    loadUsers();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadUsers();
  }
});

function selectRow(id: number) {
  checkedRowKeys.value = [id];
}

const columns: DataTableColumns<User> = [
  {
    key: 'radio',
    title: '',
    width: 48,
    align: 'center',
    render: (row: User) => {
      const checked = checkedRowKeys.value.includes(row.ID);
      return h(
        'div',
        {
          class: 'flex cursor-pointer items-center justify-center',
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            selectRow(row.ID);
          }
        },
        [
          h(SvgIcon, {
            icon: checked ? 'material-symbols:check-circle' : 'material-symbols:radio-button-unchecked',
            style: {
              fontSize: '18px',
              color: checked ? themeVars.value.primaryColor : 'var(--text-color-3, #c2c8d1)'
            }
          })
        ]
      );
    }
  },
  {
    key: 'ID',
    title: 'ID',
    width: 70,
    align: 'center'
  },
  {
    key: 'nickName',
    title: $t('page.system.user.nickName'),
    minWidth: 120
  },
  {
    key: 'userName',
    title: $t('page.system.user.userName'),
    minWidth: 120
  },
  {
    key: 'phone',
    title: $t('page.system.user.phone'),
    minWidth: 140
  },
  {
    key: 'email',
    title: $t('page.system.user.email'),
    minWidth: 180,
    ellipsis: { tooltip: true }
  }
];

function rowProps(row: User) {
  const selected = checkedRowKeys.value.includes(row.ID);
  return {
    style: selected ? `cursor: pointer;` : 'cursor: pointer;',
    onClick: () => selectRow(row.ID)
  };
}

async function loadUsers() {
  startLoading();
  try {
    const params: UserListQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (keyword.value.trim()) {
      params.nickname = keyword.value.trim();
    }
    const res = await fetchGetUserList(params);
    users.value = res.data?.list ?? [];
    pagination.itemCount = res.data?.total ?? 0;
  } finally {
    endLoading();
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
function onKeywordInput() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.page = 1;
    loadUsers();
  }, 300);
}

function handleConfirm() {
  const user = users.value.find(u => u.ID === checkedRowKeys.value[0]);
  if (user) {
    emit('selected', user);
  }
  emit('close');
}

function handleClose() {
  emit('close');
}

function handleReset() {
  keyword.value = '';
  checkedRowKeys.value = [];
  pagination.page = 1;
  loadUsers();
}

watch(
  () => props.visible,
  val => {
    if (val) {
      keyword.value = '';
      pagination.page = 1;
      checkedRowKeys.value = props.selectedId ? [props.selectedId] : [];
      loadUsers();
    }
  }
);
</script>

<template>
  <NModal
    :show="props.visible"
    :title="$t('page.system.department.selectLeader')"
    preset="card"
    :bordered="false"
    style="width: 920px; max-width: 95vw"
    @update:show="val => !val && handleClose()"
  >
    <div class="flex flex-col gap-12px">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-8px">
          <NInput
            v-model:value="keyword"
            size="small"
            clearable
            :placeholder="$t('page.system.department.leaderSearchPlaceholder')"
            :style="{ width: '260px' }"
            @input="onKeywordInput"
            @keyup.enter="onKeywordInput"
          >
            <template #prefix>
              <span class="i-material-symbols-search text-16px text-[var(--text-color-placeholder)]"></span>
            </template>
          </NInput>
          <NButton size="small" type="primary" @click="onKeywordInput">
            <template #icon>
              <SvgIcon icon="material-symbols:search" />
            </template>
            {{ $t('common.search') }}
          </NButton>
          <NButton size="small" @click="handleReset">
            <template #icon>
              <SvgIcon icon="material-symbols:restart-alt" />
            </template>
            {{ $t('common.reset') }}
          </NButton>
        </div>
      </div>

      <NDataTable
        remote
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: User) => String(row.ID)"
        :row-props="rowProps"
        size="small"
        :max-height="480"
        :checked-row-keys="checkedRowKeys"
      />
    </div>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :disabled="checkedRowKeys.length !== 1" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
