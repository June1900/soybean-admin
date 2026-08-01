<script setup lang="ts">
import { computed, h } from 'vue';
import { NDataTable, NDescriptions, NDescriptionsItem, NEmpty, NSpin, NTag, useThemeVars } from 'naive-ui';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import type { Menu } from '../api';
import { translateTitle, resolveMenuType, layoutOptions, yesOrNoOptions } from '../shared';

defineOptions({
  name: 'MenuDetailPanel'
});

const props = defineProps<{
  menu: Menu | null;
  loading: boolean;
}>();

const themeVars = useThemeVars();

/** 菜单类型文案 */
const menuTypeLabel = computed(() => {
  if (!props.menu) return '';
  const type = resolveMenuType(props.menu);
  return type === 'directory' ? $t('page.system.menu.typeDirectory') : $t('page.system.menu.typeMenu');
});

/** 展示名称（翻译 meta.title i18n key） */
const titleText = computed(() => {
  if (!props.menu) return '';
  return translateTitle(props.menu.meta?.title) || props.menu.name;
});

/** 布局方式简短文案 */
const layoutLabel = computed(() => {
  if (!props.menu) return '';
  const fallback = props.menu.layout || 'layout.base';
  return layoutOptions().find(o => o.value === fallback)?.label ?? fallback;
});

/** 路由切换动画文案（空值跟随全局） */
const transitionLabel = computed(() => {
  const val = props.menu?.meta?.transitionType;
  if (!val) return $t('page.system.menu.followGlobal');
  return val;
});

/** 是否是/否文案 */
function yesNoText(val: boolean | undefined): string {
  return yesOrNoOptions().find(o => o.value === (val ? 1 : 0))?.label ?? '';
}

/* ---------- 参数表 ---------- */
function paramRowKey(row: { ID?: number; key: string }) {
  return String(row.ID ?? row.key);
}

const paramColumns: NaiveUI.TableColumn<{ ID?: number; type: string; key: string; value: string }>[] = [
  {
    key: 'idx',
    title: '#',
    width: 48,
    align: 'center',
    render: (_row, index) => String(index + 1)
  },
  {
    key: 'type',
    title: $t('page.system.menu.paramType'),
    width: 96,
    align: 'center',
    render: row =>
      h(
        NTag,
        { size: 'small', type: row.type === 'params' ? 'success' : 'info', bordered: false, round: true },
        { default: () => row.type || '-' }
      )
  },
  {
    key: 'key',
    title: $t('page.system.menu.paramKey'),
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: row => row.key || '-'
  },
  {
    key: 'value',
    title: $t('page.system.menu.paramValue'),
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: row => row.value || '-'
  }
];

const paramScrollX = computed(() =>
  paramColumns.reduce(
    (acc, c) =>
      acc +
      ((c as { width?: number; minWidth?: number }).width ??
        (c as { width?: number; minWidth?: number }).minWidth ??
        120),
    0
  )
);

/* ---------- 按钮表 ---------- */
function btnRowKey(row: { ID: number }) {
  return String(row.ID);
}

const btnColumns: NaiveUI.TableColumn<{ ID: number; name: string; desc: string }>[] = [
  {
    key: 'idx',
    title: '#',
    width: 48,
    align: 'center',
    render: (_row, index) => String(index + 1)
  },
  {
    key: 'name',
    title: $t('page.system.menu.btnName'),
    minWidth: 200,
    ellipsis: { tooltip: true },
    render: row => row.name || '-'
  },
  {
    key: 'desc',
    title: $t('page.system.menu.btnDesc'),
    minWidth: 160,
    ellipsis: { tooltip: true },
    render: row => row.desc || '-'
  }
];

const btnScrollX = computed(() =>
  btnColumns.reduce(
    (acc, c) =>
      acc +
      ((c as { width?: number; minWidth?: number }).width ??
        (c as { width?: number; minWidth?: number }).minWidth ??
        120),
    0
  )
);
</script>

<template>
  <NSpin :show="loading" class="min-h-0 flex-1 overflow-hidden">
    <!-- 未选中提示 -->
    <div
      v-if="!menu"
      class="detail-empty flex h-full min-h-300px flex-col items-center justify-center overflow-hidden rounded-8px"
    >
      <div class="detail-empty__icon">
        <SvgIcon icon="ri:book-open-line" />
      </div>
      <p class="detail-empty__title">{{ $t('page.system.menu.noSelectHint') }}</p>
    </div>

    <!-- 三个卡片统一滚动 -->
    <div v-else class="flex flex-col gap-16px overflow-auto h-full">
      <!-- 详情网格 -->
      <div class="detail-card rounded-8px p-16px">
        <NDescriptions
          :column="2"
          label-placement="left"
          bordered
          :label-style="{
            width: '120px',
            backgroundColor: themeVars.tableHeaderColor,
            fontWeight: '500'
          }"
        >
          <NDescriptionsItem :label="$t('page.system.menu.fieldMenuType')">
            <NTag
              size="small"
              :type="resolveMenuType(menu) === 'directory' ? 'info' : 'success'"
              :bordered="false"
              round
            >
              {{ menuTypeLabel }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.fieldMenuStatus')">
            <NTag size="small" type="success" :bordered="false" round>
              {{ $t('page.system.menu.statusNormal') }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.titleField')">
            {{ titleText || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.path')">
            {{ menu.path || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.icon')">
            <div class="flex items-center gap-6px">
              <SvgIcon v-if="menu.meta?.icon" :icon="menu.meta.icon" class="shrink-0 text-16px" />
              <span>{{ menu.meta?.icon || '-' }}</span>
            </div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.sortLabel')">
            {{ menu.sort }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.visibility')">
            <NTag size="small" :type="menu.hidden ? 'warning' : 'success'" :bordered="false" round>
              {{ menu.hidden ? $t('page.system.menu.hidden') : $t('page.system.menu.show') }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.keepAlive')">
            <NTag size="small" :type="menu.meta?.keepAlive ? 'success' : 'default'" :bordered="false" round>
              {{ yesNoText(menu.meta?.keepAlive) }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.fieldIsExternal')">
            <NTag size="small" type="warning" :bordered="false" round>
              {{ $t('page.system.menu.externalNo') }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.fieldLayout')">
            {{ layoutLabel }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.system.menu.transitionType')">
            {{ transitionLabel }}
          </NDescriptionsItem>
        </NDescriptions>
      </div>

      <!-- 菜单参数 -->
      <div class="detail-card rounded-8px p-16px">
        <h4 class="m-0 mb-12px flex items-center gap-6px text-14px font-500">
          <SvgIcon icon="ri:settings-3-line" class="text-16px text-[var(--theme-primary)]" />
          {{ $t('page.system.menu.sectionParams') }}
        </h4>
        <NDataTable
          :columns="paramColumns"
          :data="menu?.parameters ?? []"
          size="small"
          :bordered="false"
          single-line
          :scroll-x="paramScrollX"
          :row-key="paramRowKey"
        >
          <template #empty>
            <NEmpty :description="$t('page.system.menu.paramEmptyTip')" size="small" />
          </template>
        </NDataTable>
      </div>

      <!-- 按钮权限 -->
      <div class="detail-card rounded-8px p-16px">
        <h4 class="m-0 mb-12px flex items-center gap-6px text-14px font-500">
          <SvgIcon icon="ri:key-line" class="text-16px text-[var(--theme-primary)]" />
          {{ $t('page.system.menu.sectionButtons') }}
        </h4>
        <NDataTable
          :columns="btnColumns"
          :data="menu?.menuBtn ?? []"
          size="small"
          :bordered="false"
          single-line
          :scroll-x="btnScrollX"
          :row-key="btnRowKey"
        >
          <template #empty>
            <NEmpty :description="$t('page.system.menu.btnEmptyTip')" size="small" />
          </template>
        </NDataTable>
      </div>
    </div>
  </NSpin>
</template>

<style scoped lang="scss">
/* NSpin 根容器撑满 */
:deep(.n-spin-container) {
  width: 100%;
}

/* NSpin 内容容器撑满，作为滚动容器 */
:deep(.n-spin-content) {
  width: 100%;
  height: 100%;
  min-height: 0;
}

/* 详情卡片统一样式 */
.detail-card {
  width: 100%;
  border: 1px solid var(--theme-border-color);
  background-color: var(--theme-card-color, transparent);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* 未选中时的空状态 */
.detail-empty {
  border: 1px dashed var(--theme-border-color);
  color: var(--theme-text-3);
  background: linear-gradient(180deg, color-mix(in srgb, var(--theme-primary) 4%, transparent) 0%, transparent 60%);

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin-bottom: 16px;
    border-radius: 50%;
    background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent);
    color: var(--theme-primary);
    font-size: 36px;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
