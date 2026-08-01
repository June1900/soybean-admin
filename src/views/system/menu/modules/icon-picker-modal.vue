<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NEmpty, NInput, NModal, NPagination, NScrollbar, NTooltip } from 'naive-ui';
import riIcons from '@iconify-json/ri/icons.json';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'IconPickerModal'
});

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [icon: string];
}>();

/** 全部 ri 图标名称列表（带 ri: 前缀） */
const allIcons: string[] = Object.keys(riIcons.icons).map(name => `ri:${name}`);

const keyword = ref('');
/** 已应用的搜索关键字（点击搜索按钮后才更新） */
const appliedKw = ref('');
const page = ref(1);
const pageSize = ref(72);
const pageSizes = [72, 120, 180, 240];

/** 过滤后的全部图标（不分页） */
const filteredIcons = computed(() => {
  const kw = appliedKw.value.trim().toLowerCase();
  if (!kw) return allIcons;
  return allIcons.filter(icon => icon.toLowerCase().includes(kw));
});

const filteredTotal = computed(() => filteredIcons.value.length);

/** 当前页的图标列表 */
const pagedIcons = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredIcons.value.slice(start, start + pageSize.value);
});

function handleSearch() {
  appliedKw.value = keyword.value;
  page.value = 1;
}

function handleSelect(icon: string) {
  emit('select', icon);
  emit('close');
}

function handleReset() {
  keyword.value = '';
  appliedKw.value = '';
  page.value = 1;
}

function handleClose() {
  keyword.value = '';
  appliedKw.value = '';
  page.value = 1;
  emit('close');
}
</script>

<template>
  <NModal
    :show="props.visible"
    preset="card"
    :title="$t('page.system.menu.iconPlaceholder')"
    :bordered="false"
    style="width: 720px; max-width: 95vw"
    @update:show="val => !val && handleClose()"
  >
    <div class="flex flex-col gap-12px">
      <div class="flex gap-8px">
        <NInput
          v-model:value="keyword"
          clearable
          size="small"
          :placeholder="$t('page.system.menu.searchTitle')"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <SvgIcon icon="material-symbols:search" class="text-16px" />
          </template>
        </NInput>
        <NButton type="primary" size="small" @click="handleSearch">
          {{ $t('page.system.menu.search') }}
        </NButton>
        <NButton size="small" @click="handleReset">
          {{ $t('page.system.menu.reset') }}
        </NButton>
      </div>

      <div class="text-12px op-60">
        {{ $t('page.system.menu.iconCountTip', { shown: pagedIcons.length, total: filteredTotal }) }}
      </div>

      <NScrollbar class="h-420px rounded-6px border border-[var(--n-border-color)] p-12px">
        <div v-if="pagedIcons.length" class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-8px">
          <NTooltip v-for="icon in pagedIcons" :key="icon" trigger="hover" placement="top">
            <template #trigger>
              <button
                type="button"
                class="flex h-40px w-full items-center justify-center rounded-4px border border-transparent transition-colors hover:border-[var(--n-primary-color)] hover:bg-[var(--n-color-hover)]"
                @click="handleSelect(icon)"
              >
                <SvgIcon :icon="icon" class="text-20px" />
              </button>
            </template>
            {{ icon }}
          </NTooltip>
        </div>
        <NEmpty v-else size="small" class="py-40px" />
      </NScrollbar>

      <div v-if="filteredTotal" class="flex justify-end">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="filteredTotal"
          :page-sizes="pageSizes"
          show-size-picker
        />
      </div>
    </div>
  </NModal>
</template>
