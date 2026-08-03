<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NTag, NTooltip } from 'naive-ui';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import type { Menu } from '../api';
import { resolveMenuType, translateTitle, isExternalLink } from '../shared';

defineOptions({
  name: 'MenuTreeNode'
});

const props = defineProps<{
  item: Menu;
  searchActive: boolean;
}>();

const emit = defineEmits<{
  add: [parentId: number];
  delete: [id: number, hasChildren: boolean];
}>();

const isDirectory = computed(() => resolveMenuType(props.item) === 'directory');
const hasChildren = computed(() => !!(props.item.children && props.item.children.length > 0));
const external = computed(() => isExternalLink(props.item));

const iconName = computed(() => {
  if (external.value) return 'ri:external-link-line';
  const icon = props.item.meta?.icon;
  if (icon) return icon;
  return isDirectory.value ? 'ri:folder-line' : 'ri:menu-line';
});

const title = computed(() => translateTitle(props.item.meta?.title) || props.item.name);
</script>

<template>
  <div class="flex h-40px w-full items-center justify-between gap-8px">
    <div class="flex min-w-0 flex-1 items-center gap-6px overflow-hidden">
      <SvgIcon :icon="iconName" class="shrink-0 text-16px" />
      <span class="truncate" :title="title">{{ title }}</span>
      <NTag v-if="external" size="tiny" type="warning" :bordered="false" round class="shrink-0">
        {{ $t('page.system.menu.typeLink') }}
      </NTag>
      <span v-if="searchActive" class="text-12px text-[var(--theme-text-3)]">({{ item.path }})</span>
    </div>
    <div class="menu-row-actions flex shrink-0 items-center gap-2px transition-opacity">
      <NTooltip v-if="isDirectory" trigger="hover" placement="top">
        <template #trigger>
          <NButton size="medium" type="primary" text @click.stop="emit('add', item.ID)">
            <template #icon>
              <SvgIcon icon="ri:add-line" class="text-14px" />
            </template>
          </NButton>
        </template>
        {{ $t('page.system.menu.addChild') }}
      </NTooltip>
      <NTooltip trigger="hover" placement="top">
        <template #trigger>
          <NButton
            size="medium"
            type="error"
            text
            :disabled="hasChildren"
            @click.stop="emit('delete', item.ID, hasChildren)"
          >
            <template #icon>
              <SvgIcon icon="ri:delete-bin-line" class="text-14px" />
            </template>
          </NButton>
        </template>
        {{ hasChildren ? $t('page.system.menu.deleteDisabledHasChildren') : $t('page.system.menu.panelDelete') }}
      </NTooltip>
    </div>
  </div>
</template>
