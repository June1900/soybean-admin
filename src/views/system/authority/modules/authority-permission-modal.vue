<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { NButton, NModal, NSpace, NTree, type TreeOption } from 'naive-ui';
import { $t } from '@/locales';
import type { Menu } from '@/views/system/menu/api';
import { fetchGetMenuAuthority, fetchUpdateMenuAuthority, type Authority } from '../api';

const props = defineProps<{
  visible: boolean;
  role: Authority | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const { loading, startLoading, endLoading } = useLoading();
const menuOptions = ref<TreeOption[]>([]);
const checkedKeys = ref<number[]>([]);

function toTreeOptions(menus: Menu[]): TreeOption[] {
  return (menus ?? []).map(m => ({
    key: m.ID,
    label: m.meta?.title || m.name,
    children: toTreeOptions(m.children ?? [])
  }));
}

function collectKeys(options: TreeOption[]): number[] {
  return options.reduce<number[]>((acc, opt) => {
    if (typeof opt.key === 'number') acc.push(opt.key);
    if (Array.isArray(opt.children)) acc.push(...collectKeys(opt.children as TreeOption[]));
    return acc;
  }, []);
}

watch(
  () => props.visible,
  async visible => {
    if (!visible || !props.role) return;

    const { data } = await fetchGetMenuAuthority(props.role.authorityId);
    menuOptions.value = toTreeOptions(data?.menus ?? []);
    checkedKeys.value = data?.checkedKeys ?? [];
  },
  { immediate: true }
);

async function handleSave() {
  if (!props.role) return;
  startLoading();

  const { error } = await fetchUpdateMenuAuthority(props.role.authorityId, checkedKeys.value);

  if (!error) {
    window.$message?.success($t('page.system.authority.permissionSuccess'));
    emit('submitted');
    emit('close');
  }

  endLoading();
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    :title="$t('page.system.authority.permissionTitle')"
    style="width: 640px; max-width: 92vw"
    @update:show="val => !val && emit('close')"
  >
    <div class="flex-col-stretch gap-12px">
      <NSpace justify="end">
        <NButton size="small" @click="checkedKeys = collectKeys(menuOptions)">
          {{ $t('page.system.authority.selectAll') }}
        </NButton>
        <NButton size="small" @click="checkedKeys = []">{{ $t('common.clear') }}</NButton>
      </NSpace>
      <NTree
        v-model:checked-keys="checkedKeys"
        block-line
        checkable
        cascade
        :data="menuOptions"
        :default-expand-all="true"
      />
    </div>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSave">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
