<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { NButton, NCheckbox, NCheckboxGroup, NEmpty, NModal, NSpin, NSpace } from 'naive-ui';
import { $t } from '@/locales';
import type { Menu, MenuBtn } from '@/views/system/menu/api';
import { fetchGetAuthorityBtn, fetchSetAuthorityBtn } from '../api';

const props = defineProps<{
  show: boolean;
  // 当前菜单（携带 menuBtn）
  menu: Menu | null;
  // 角色 ID
  authorityId: number;
}>();

const emit = defineEmits<{
  'update:show': [boolean];
  saved: [];
}>();

const { loading: loadingBtnOptions, startLoading: startLoadingOptions, endLoading: endLoadingOptions } = useLoading();
const { loading: saving, startLoading: startSaving, endLoading: endSaving } = useLoading();

const btnOptions = ref<MenuBtn[]>([]);
const checkedBtnKeys = ref<number[]>([]);

async function loadBtnData() {
  if (!props.menu) return;
  btnOptions.value = props.menu.menuBtn ?? [];
  checkedBtnKeys.value = [];
  startLoadingOptions();
  try {
    const { data, error } = await fetchGetAuthorityBtn(Number(props.menu.ID), props.authorityId);
    if (!error) {
      checkedBtnKeys.value = data?.selected ?? [];
    }
  } finally {
    endLoadingOptions();
  }
}

watch(
  () => props.show,
  async show => {
    if (!show || !props.menu) {
      btnOptions.value = [];
      checkedBtnKeys.value = [];
      return;
    }
    await loadBtnData();
  },
  { immediate: true }
);

function handleClose() {
  emit('update:show', false);
}

async function handleConfirm() {
  if (!props.menu) return;
  startSaving();
  try {
    const { error } = await fetchSetAuthorityBtn(Number(props.menu.ID), checkedBtnKeys.value, props.authorityId);
    if (!error) {
      window.$message?.success($t('page.system.authority.assignBtnSuccess'));
      emit('update:show', false);
      emit('saved');
    }
  } finally {
    endSaving();
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="$t('page.system.authority.assignBtnTitle')"
    style="width: 640px"
    @update:show="val => emit('update:show', val)"
  >
    <NSpin :show="loadingBtnOptions">
      <div v-if="btnOptions.length" class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="flex items-center px-4 py-2.5 bg-gray-50 text-sm font-medium text-gray-600">
          <div class="w-12 shrink-0"></div>
          <div class="flex-1">{{ $t('page.system.authority.btnName') }}</div>
          <div class="flex-1">{{ $t('page.system.authority.btnDesc') }}</div>
        </div>
        <NCheckboxGroup v-model:value="checkedBtnKeys" class="flex flex-col max-h-80 overflow-auto">
          <div
            v-for="btn in btnOptions"
            :key="btn.ID"
            class="flex items-center px-4 py-2.5 border-t border-gray-100 text-sm transition-colors hover:bg-gray-50"
          >
            <div class="w-12 shrink-0">
              <NCheckbox :value="btn.ID" />
            </div>
            <div class="flex-1">{{ btn.name }}</div>
            <div class="flex-1 text-gray-400">{{ btn.desc }}</div>
          </div>
        </NCheckboxGroup>
      </div>
      <NEmpty v-else :description="$t('common.noData')" />
    </NSpin>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="saving" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
