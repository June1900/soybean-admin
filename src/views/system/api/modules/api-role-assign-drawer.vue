<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { NAlert, NButton, NDrawer, NDrawerContent, NSpace, NTree, type TreeOption } from 'naive-ui';
import { $t } from '@/locales';
import { fetchGetAuthorityList, type Authority } from '@/views/system/authority/api';
import { fetchGetApiRoles, fetchSetApiRoles } from '../api';
import type { Api } from '../api';

defineOptions({
  name: 'ApiRoleAssignDrawer'
});

const props = defineProps<{
  api: Api | null;
}>();

const emit = defineEmits<{ 'update:show': [value: boolean]; saved: [] }>();

const show = defineModel<boolean>('show', { required: true });

const { loading, startLoading, endLoading } = useLoading();
const { loading: saving, startLoading: startSaving, endLoading: endSaving } = useLoading();

const roleTree = ref<Authority[]>([]);
const checkedKeys = ref<number[]>([]);

const title = computed(() => {
  const desc = props.api?.description;
  return `${$t('page.system.api.assignRole')}${desc ? ` - ${desc}` : ''}`;
});

const treeOptions = computed<TreeOption[]>(() => toRoleTreeOptions(roleTree.value));

function toRoleTreeOptions(roles: Authority[]): TreeOption[] {
  return (roles ?? []).map(role => ({
    key: role.authorityId,
    label: role.authorityName,
    children: role.children?.length ? toRoleTreeOptions(role.children) : undefined
  }));
}

async function loadData() {
  if (!props.api) return;
  startLoading();
  try {
    const [{ data: roles }, { data: selectedIds }] = await Promise.all([
      fetchGetAuthorityList(),
      fetchGetApiRoles(props.api.path, props.api.method)
    ]);
    roleTree.value = roles ?? [];
    checkedKeys.value = (selectedIds ?? []).map(Number);
  } finally {
    endLoading();
  }
}

async function handleSave() {
  if (!props.api) return;
  startSaving();
  try {
    const { error } = await fetchSetApiRoles(props.api.path, props.api.method, checkedKeys.value);
    if (!error) {
      window.$message?.success($t('page.system.api.assignRoleSuccess'));
      show.value = false;
      emit('saved');
    }
  } finally {
    endSaving();
  }
}

function handleClose() {
  show.value = false;
}

watch(
  () => show.value,
  visible => {
    if (visible) {
      loadData();
    } else {
      roleTree.value = [];
      checkedKeys.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <NDrawer :show="show" display-directive="show" :width="620" @update:show="val => (show = val)">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NAlert type="warning" class="mb-16px">
        {{ $t('page.system.api.assignRoleNotice') }}
      </NAlert>

      <div class="max-h-400px overflow-auto">
        <NTree
          v-if="treeOptions.length"
          v-model:checked-keys="checkedKeys"
          block-line
          checkable
          :data="treeOptions"
          :default-expand-all="true"
        />
        <div v-else class="py-32px text-center text-gray-400">
          {{ $t('page.system.api.roleTreeEmpty') }}
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton :disabled="loading || saving" @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="saving || loading" @click="handleSave">
            {{ $t('common.save') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
