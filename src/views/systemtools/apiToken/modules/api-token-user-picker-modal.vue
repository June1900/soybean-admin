<script setup lang="ts">
import { h, reactive, ref, watch } from 'vue';
import { NButton, NRadio } from 'naive-ui';
import { useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchGetUserList, type User, type UserListQuery } from '@/views/system/user/api';

defineOptions({ name: 'ApiTokenUserPickerModal' });

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  'update:show': [val: boolean];
  select: [user: User];
}>();

type UserListApiResponse = Awaited<ReturnType<typeof fetchGetUserList>>;

const searchParams = reactive({
  username: '',
  nickname: ''
});

const checkedUserId = ref<number | null>(null);

const { columns, data, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable<UserListApiResponse, User>({
  api: () => fetchGetUserList(getQueryParams()),
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

function getQueryParams(): UserListQuery {
  const params: UserListQuery = {
    page: mobilePagination.value.page ?? 1,
    pageSize: mobilePagination.value.pageSize ?? 10
  };
  if (searchParams.username) params.username = searchParams.username;
  if (searchParams.nickname) params.nickname = searchParams.nickname;
  return params;
}

function handleConfirm() {
  if (checkedUserId.value == null) return;
  const user = data.value.find(u => u.ID === checkedUserId.value);
  if (user) {
    emit('select', user);
    emit('update:show', false);
  }
}

function handleSearch() {
  getDataByPage(1);
}

function handleReset() {
  searchParams.username = '';
  searchParams.nickname = '';
  getDataByPage(1);
}

watch(
  () => props.show,
  val => {
    if (val) {
      searchParams.username = '';
      searchParams.nickname = '';
      checkedUserId.value = null;
      getDataByPage(1);
    }
  }
);

function createAllColumns(): NaiveUI.TableColumn<User>[] {
  return [
    {
      key: 'radio',
      width: 50,
      align: 'center',
      render: row =>
        h(NRadio, {
          checked: checkedUserId.value === row.ID,
          onClick: () => {
            checkedUserId.value = row.ID;
          }
        })
    },
    {
      key: 'index',
      title: $t('page.systemTools.apiToken.columns.index'),
      width: 70,
      align: 'center',
      render: (_row, index) => index + 1
    },
    { key: 'userName', title: $t('page.systemTools.apiToken.userPicker.username'), minWidth: 120 },
    { key: 'nickName', title: $t('page.systemTools.apiToken.userPicker.nickname'), minWidth: 120 }
  ];
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="$t('page.systemTools.apiToken.userPicker.title')"
    style="width: 800px"
    @update:show="val => emit('update:show', val)"
  >
    <div class="flex items-center gap-12px mb-12px">
      <NInput
        v-model:value="searchParams.username"
        :placeholder="$t('page.systemTools.apiToken.userPicker.username')"
        clearable
        class="w-180px"
        @keydown.enter="handleSearch"
      />
      <NInput
        v-model:value="searchParams.nickname"
        :placeholder="$t('page.systemTools.apiToken.userPicker.nickname')"
        clearable
        class="w-180px"
        @keydown.enter="handleSearch"
      />
      <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
      <NButton @click="handleReset">{{ $t('common.reset') }}</NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="data"
      size="small"
      :loading="loading"
      :max-height="380"
      remote
      :row-key="row => String(row.ID)"
      :pagination="mobilePagination"
      :bordered="false"
    />

    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('update:show', false)">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :disabled="checkedUserId == null" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
