<script setup lang="ts">
import { computed, h, onMounted, ref, onBeforeUnmount } from 'vue';
import {
  NButton,
  NDataTable,
  NEmpty,
  NGrid,
  NGridItem,
  NInput,
  NSpace,
  NTag,
  NTooltip,
  NTree,
  useThemeVars,
  type TreeOption
} from 'naive-ui';
import { $t } from '@/locales';
import { fetchDeleteMenu, fetchGetMenuList, type Menu } from './api';
import { translateTitle, resolveMenuType, layoutOptions } from './shared';
import MenuOperateDrawer from './modules/menu-operate-drawer.vue';
import MenuTreeNode from './modules/menu-tree-node.vue';

import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'SystemMenu'
});

const themeVars = useThemeVars();

/* ---------- data ---------- */
const data = ref<Menu[]>([]);
const loading = ref(false);

async function getData() {
  loading.value = true;
  const res = await fetchGetMenuList();
  loading.value = false;
  if (!res.error && res.data) {
    data.value = buildTreeFromFlat(res.data);
  } else if (res.error) {
    window.$message?.error($t('page.system.menu.refreshFailed'));
  }
}

/** 构建树结构：兼容扁平（children=null）与嵌套（children 含子节点）两种返回格式 */
function buildTreeFromFlat(list: Menu[]): Menu[] {
  // 检测是否已经是嵌套树结构（任意节点有非空 children 数组）
  const isNested = list.some(item => Array.isArray(item.children) && item.children.length > 0);

  // 清理空 children 数组为 null
  const cleanup = (nodes: Menu[]) => {
    for (const n of nodes) {
      if (Array.isArray(n.children) && n.children.length === 0) {
        n.children = null;
      } else if (n.children) {
        cleanup(n.children);
      }
    }
  };

  if (isNested) {
    // 已是嵌套树，直接深拷贝并清理
    const result = list.map(item => ({ ...item }));
    cleanup(result);
    return result;
  }

  // 扁平结构，根据 parentId 重建父子关系
  const map = new Map<number, Menu>();
  const roots: Menu[] = [];
  for (const item of list) {
    map.set(item.ID, { ...item, children: [] });
  }
  for (const item of list) {
    const node = map.get(item.ID)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  cleanup(roots);
  return roots;
}

/* ---------- helpers ---------- */
function findMenu(list: Menu[] = [], id: number): Menu | null {
  for (const item of list) {
    if (item.ID === id) return item;
    if (item.children?.length) {
      const found = findMenu(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** 将布局方式 value（如 layout.base）翻译为简短文案，未匹配时回退到原始值 */
function layoutLabel(value?: string): string {
  const fallback = value || 'layout.base';
  return layoutOptions().find(o => o.value === fallback)?.label ?? fallback;
}

/** 参数行 row-key（优先用 ID，回退到 key 字段） */
function paramRowKey(row: { ID?: number; key: string }) {
  return String(row.ID ?? row.key);
}

/** 按钮行 row-key */
function btnRowKey(row: { ID: number }) {
  return String(row.ID);
}

function filterTree(list: Menu[], kw: string): Menu[] {
  const res: Menu[] = [];
  for (const item of list) {
    const children = item.children?.length ? filterTree(item.children, kw) : [];
    const title = item.meta?.title ?? item.name ?? '';
    const name = item.name ?? '';
    const path = item.path ?? '';
    const text = `${title} ${name} ${path}`.toLowerCase();
    const match = !kw || text.includes(kw);
    if (match || children.length) {
      res.push({ ...item, children: children.length ? children : null });
    }
  }
  return res;
}

/* ---------- search / selection ---------- */
const searchKw = ref('');

const displayData = computed(() =>
  searchKw.value.trim() ? filterTree(data.value, searchKw.value.trim().toLowerCase()) : data.value
);

const expandedKeys = ref<string[]>([]);
const selectedId = ref<number | null>(null);

/** 收集树中所有含子节点的 key（用于展开全部） */
function collectAllKeys(list: Menu[] = []): string[] {
  const keys: string[] = [];
  const walk = (items: Menu[]) => {
    for (const item of items) {
      if (item.children?.length) {
        keys.push(String(item.ID));
        walk(item.children);
      }
    }
  };
  walk(list);
  return keys;
}

function expandAll() {
  expandedKeys.value = collectAllKeys(displayData.value);
}

function collapseAll() {
  expandedKeys.value = [];
}

/** 当前树是否已全部展开（无子节点的空树也视为已展开） */
const isAllExpanded = computed(() => {
  const all = collectAllKeys(displayData.value);
  if (all.length === 0) return true;
  return all.every(k => expandedKeys.value.includes(k));
});

/** 展开/折叠全部切换 */
function toggleExpandAll() {
  if (isAllExpanded.value) {
    collapseAll();
  } else {
    expandAll();
  }
}

/* 左右拖拽，宽度百分比 20%-50%，默认 25% */
const splitContainerRef = ref<HTMLElement | null>(null);
const leftPercent = ref(25);
const isDragging = ref(false);
const MIN_PERCENT = 20;
const MAX_PERCENT = 50;

function onSplitterMouseDown(e: MouseEvent) {
  e.preventDefault();
  isDragging.value = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', onSplitterMouseMove);
  window.addEventListener('mouseup', onSplitterMouseUp);
}

function onSplitterMouseMove(e: MouseEvent) {
  if (!isDragging.value || !splitContainerRef.value) return;
  const rect = splitContainerRef.value.getBoundingClientRect();
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  leftPercent.value = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent));
}

function onSplitterMouseUp() {
  isDragging.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  window.removeEventListener('mousemove', onSplitterMouseMove);
  window.removeEventListener('mouseup', onSplitterMouseUp);
}

onBeforeUnmount(onSplitterMouseUp);

const selectedKeys = computed<string[]>(() => (selectedId.value === null ? [] : [String(selectedId.value)]));

const activeMenu = computed<Menu | null>(() => (selectedId.value ? findMenu(data.value, selectedId.value) : null));

function buildTreeOptions(list: Menu[]): TreeOption[] {
  return list.map(item => {
    const hasChildren = !!item.children?.length;
    const node: TreeOption = {
      key: String(item.ID),
      label: translateTitle(item.meta?.title) || item.name
    };
    if (hasChildren) {
      node.children = buildTreeOptions(item.children!);
    }
    return node;
  });
}

/** 菜单 ID → Menu 对象，供 renderLabel 查找 */
const menuById = computed(() => {
  const map = new Map<number, Menu>();
  const walk = (list: Menu[]) => {
    for (const m of list) {
      map.set(m.ID, m);
      if (m.children?.length) walk(m.children);
    }
  };
  walk(data.value);
  return map;
});

function renderLabel(info: { option: TreeOption }) {
  const key = Number(info.option.key);
  const item = menuById.value.get(key);
  if (!item) return info.option.label as string;

  return h(MenuTreeNode, {
    item,
    searchActive: !!searchKw.value.trim(),
    onAdd: (parentId: number) => {
      handleAdd(parentId);
    },
    onDelete: (id: number, hasChildren: boolean) => {
      if (!hasChildren) confirmDeleteMenu(id);
    }
  });
}

const treeOptions = computed<TreeOption[]>(() => buildTreeOptions(displayData.value));

const drawerVisible = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editingData = ref<Menu | null>(null);
const defaultParentId = ref<number>(0);

function handleAdd(parentId?: number) {
  operateType.value = 'add';
  editingData.value = null;
  defaultParentId.value = parentId ?? 0;
  drawerVisible.value = true;
}

/** 顶部"新增根菜单"按钮（无 parentId） */
function handleAddRoot() {
  handleAdd();
}

function handleEdit(id: number) {
  const target = findMenu(data.value, id);
  if (!target) return;
  operateType.value = 'edit';
  editingData.value = target;
  defaultParentId.value = target.parentId;
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMenu(id);
  if (!error) {
    if (selectedId.value === id) selectedId.value = null;
    await getData();
  }
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

const btnColumns: NaiveUI.TableColumn<{ ID: number; name: string; desc: string }>[] = [
  {
    key: 'idx',
    title: '#',
    width: 48,
    align: 'center',
    render: (_row, index) => String(index + 1)
  },
  {
    key: 'desc',
    title: $t('page.system.menu.btnDesc'),
    minWidth: 160,
    ellipsis: { tooltip: true },
    render: row => row.desc || '-'
  },
  {
    key: 'name',
    title: $t('page.system.menu.fieldBtnPerm'),
    minWidth: 200,
    ellipsis: { tooltip: true },
    render: row => row.name || '-'
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

onMounted(async () => {
  await getData();
  // 默认选中第一个根节点（树保持折叠状态）
  if (data.value.length && selectedId.value === null) {
    selectedId.value = data.value[0].ID;
  }
});

function handleRefresh() {
  selectedId.value = null;
  expandedKeys.value = [];
  getData();
}

async function handleSubmitted() {
  const parentId = defaultParentId.value;
  await getData();
  // 展开父节点（根节点 parentId=0 时无需展开）
  if (parentId && !expandedKeys.value.includes(String(parentId))) {
    expandedKeys.value = [...expandedKeys.value, String(parentId)];
  }
}

function handleSelectChange(keys: (string | number)[]) {
  const id = keys[0];
  selectedId.value = id === undefined ? null : Number(id);
}

function confirmDeleteMenu(id: number) {
  window.$dialog?.warning({
    content: $t('page.system.menu.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => handleDelete(id)
  });
}

const activeMenuTypeLabel = computed(() => {
  if (!activeMenu.value) return '';
  const type = resolveMenuType(activeMenu.value);
  return type === 'directory' ? $t('page.system.menu.typeDirectory') : $t('page.system.menu.typeMenu');
});

/** 当前选中菜单是否存在子节点（存在时禁止删除） */
const activeMenuHasChildren = computed(() => !!(activeMenu.value?.children && activeMenu.value.children.length > 0));

const activeMenuTitle = computed(() => {
  if (!activeMenu.value) return '';
  return translateTitle(activeMenu.value.meta?.title) || activeMenu.value.name;
});

function handleAddChild() {
  if (selectedId.value !== null) handleAdd(selectedId.value);
}

function handleEditClick() {
  if (selectedId.value !== null) handleEdit(selectedId.value);
}

function handleDeleteClick() {
  if (selectedId.value !== null) confirmDeleteMenu(selectedId.value);
}
</script>

<template>
  <div class="flex min-h-500px flex-col gap-16px overflow-hidden lt-sm:overflow-auto p-16px">
    <div
      class="flex min-h-0 flex-1 flex-col gap-12px overflow-hidden rounded-8px p-16px shadow-sm"
      :style="{
        backgroundColor: themeVars.cardColor,
        '--theme-primary': themeVars.primaryColor,
        '--theme-border': themeVars.borderColor,
        '--theme-text-2': themeVars.textColor2,
        '--theme-text-3': themeVars.textColor3,
        '--theme-border-color': themeVars.borderColor
      }"
    >
      <div ref="splitContainerRef" class="flex min-h-0 flex-1">
        <!-- 左侧：菜单列表 -->
        <div class="flex shrink-0 flex-col gap-12px overflow-hidden pr-12px" :style="{ width: `${leftPercent}%` }">
          <div class="flex items-center justify-between">
            <h3 class="m-0 text-16px font-500">{{ $t('page.system.menu.panelMenuList') }}</h3>
            <NSpace :size="6" align="center" :wrap="false">
              <NButton size="small" type="primary" quaternary @click="handleAddRoot">
                <template #icon><SvgIcon icon="material-symbols:add" /></template>
              </NButton>
              <NTooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <NButton size="small" quaternary @click="toggleExpandAll">
                    <template #icon>
                      <SvgIcon
                        :icon="isAllExpanded ? 'material-symbols:unfold-less' : 'material-symbols:unfold-more'"
                      />
                    </template>
                  </NButton>
                </template>
                {{ isAllExpanded ? $t('page.system.menu.collapseAll') : $t('page.system.menu.expandAll') }}
              </NTooltip>
              <NButton size="small" quaternary @click="handleRefresh">
                <template #icon><SvgIcon icon="material-symbols:refresh" /></template>
              </NButton>
            </NSpace>
          </div>

          <NInput v-model:value="searchKw" clearable size="small" :placeholder="$t('page.system.menu.searchTitle')">
            <template #prefix>
              <SvgIcon icon="material-symbols:search" class="text-16px" />
            </template>
          </NInput>

          <div class="min-h-0 flex-1 overflow-auto">
            <NTree
              v-model:expanded-keys="expandedKeys"
              :selected-keys="selectedKeys"
              block-line
              :data="treeOptions"
              :loading="loading"
              :render-label="renderLabel"
              @update:selected-keys="handleSelectChange"
            />
          </div>
        </div>

        <!-- 拖拽分割条 -->
        <div class="drag-handle shrink-0" :class="{ 'is-dragging': isDragging }" @mousedown="onSplitterMouseDown"></div>

        <!-- 右侧：详情 -->
        <div class="flex min-w-0 flex-1 flex-col gap-16px overflow-hidden pl-12px">
          <!-- 顶部操作 -->
          <div class="flex items-center justify-between">
            <h3 class="m-0 text-16px font-500">{{ $t('page.system.menu.panelMenuDetail') }}</h3>
            <NSpace :size="8" align="center" :wrap="false">
              <NButton
                v-if="activeMenu && resolveMenuType(activeMenu) === 'directory'"
                type="primary"
                size="small"
                ghost
                @click="handleAddChild"
              >
                <template #icon><SvgIcon icon="material-symbols:add" /></template>
                {{ $t('page.system.menu.panelAddChild') }}
              </NButton>
              <NButton type="info" size="small" ghost :disabled="!selectedId" @click="handleEditClick">
                <template #icon><SvgIcon icon="material-symbols:edit" /></template>
                {{ $t('page.system.menu.panelEdit') }}
              </NButton>
              <NTooltip trigger="hover" placement="bottom" :disabled="!activeMenuHasChildren">
                <template #trigger>
                  <NButton
                    type="error"
                    size="small"
                    ghost
                    :disabled="!selectedId || activeMenuHasChildren"
                    @click="handleDeleteClick"
                  >
                    <template #icon><SvgIcon icon="material-symbols:delete" /></template>
                    {{ $t('page.system.menu.panelDelete') }}
                  </NButton>
                </template>
                {{ $t('page.system.menu.deleteDisabledHasChildren') }}
              </NTooltip>
            </NSpace>
          </div>

          <!-- 未选中提示 -->
          <div
            v-if="!activeMenu"
            class="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-8px border border-dashed border-[var(--theme-border-color)] text-[var(--theme-text-3)]"
          >
            <SvgIcon icon="material-symbols:info-outline" class="mb-8px text-36px opacity-50" />
            <span>{{ $t('page.system.menu.noSelectHint') }}</span>
          </div>

          <template v-else>
            <!-- 详情网格 -->
            <div class="rounded-8px border border-[var(--theme-border-color)] p-16px">
              <NGrid :cols="3" :x-gap="24" :y-gap="16" responsive="screen" item-responsive>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-[var(--theme-text-2)]">{{ $t('page.system.menu.fieldMenuType') }}</span>
                    <NTag
                      size="small"
                      :type="resolveMenuType(activeMenu) === 'directory' ? 'info' : 'success'"
                      :bordered="false"
                      round
                    >
                      {{ activeMenuTypeLabel }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-[var(--theme-text-2)]">
                      {{ $t('page.system.menu.fieldMenuStatus') }}
                    </span>
                    <NTag size="small" type="success" :bordered="false" round>
                      {{ $t('page.system.menu.statusNormal') }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-[var(--theme-text-2)]">{{ $t('page.system.menu.fieldSort') }}</span>
                    <span class="text-14px">{{ activeMenu.sort }}</span>
                  </div>
                </NGridItem>

                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-[var(--theme-text-2)] shrink-0">
                      {{ $t('page.system.menu.fieldMenuName') }}
                    </span>
                    <span class="truncate text-14px" :title="activeMenuTitle">{{ activeMenuTitle }}</span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-[var(--theme-text-2)] shrink-0">
                      {{ $t('page.system.menu.fieldRoutePath') }}
                    </span>
                    <span class="truncate text-14px" :title="activeMenu.path">{{ activeMenu.path }}</span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-[var(--theme-text-2)]">
                      {{ $t('page.system.menu.fieldDisplayStatus') }}
                    </span>
                    <NTag size="small" :type="activeMenu.hidden ? 'warning' : 'success'" :bordered="false" round>
                      {{ activeMenu.hidden ? $t('page.system.menu.hidden') : $t('page.system.menu.show') }}
                    </NTag>
                  </div>
                </NGridItem>

                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-[var(--theme-text-2)]">
                      {{ $t('page.system.menu.fieldIsExternal') }}
                    </span>
                    <NTag size="small" type="warning" :bordered="false" round>
                      {{ $t('page.system.menu.externalNo') }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-[var(--theme-text-2)] shrink-0">
                      {{ $t('page.system.menu.fieldBtnPerm') }}
                    </span>
                    <span class="truncate text-14px" :title="activeMenu.name">{{ activeMenu.name }}</span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-[var(--theme-text-2)] shrink-0">
                      {{ $t('page.system.menu.fieldLayout') }}
                    </span>
                    <span class="truncate text-14px" :title="layoutLabel(activeMenu.layout)">
                      {{ layoutLabel(activeMenu.layout) }}
                    </span>
                  </div>
                </NGridItem>
              </NGrid>
            </div>

            <!-- 菜单参数 + 按钮权限：可滚动区域 -->
            <div class="flex min-h-0 flex-1 flex-col gap-12px overflow-auto">
              <!-- 菜单参数 -->
              <div class="rounded-8px border border-[var(--theme-border-color)] p-16px">
                <h4 class="m-0 mb-12px text-14px font-500">{{ $t('page.system.menu.sectionParams') }}</h4>
                <NDataTable
                  :columns="paramColumns"
                  :data="activeMenu?.parameters ?? []"
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
              <div class="rounded-8px border border-[var(--theme-border-color)] p-16px">
                <h4 class="m-0 mb-12px text-14px font-500">{{ $t('page.system.menu.panelBtnPermission') }}</h4>
                <NDataTable
                  :columns="btnColumns"
                  :data="activeMenu?.menuBtn ?? []"
                  size="small"
                  :bordered="false"
                  single-line
                  :scroll-x="btnScrollX"
                  :row-key="btnRowKey"
                >
                  <template #empty>
                    <NEmpty :description="$t('page.system.menu.btnEmpty')" size="small" />
                  </template>
                </NDataTable>
              </div>
            </div>
          </template>
        </div>
      </div>

      <MenuOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        :default-parent-id="defaultParentId"
        @close="closeDrawer"
        @submitted="handleSubmitted"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.n-tree .n-tree-node-content-wrapper) {
  padding: 0 8px;
  min-height: 40px;
}
:deep(.n-tree .n-tree-node-content-wrapper::before) {
  height: 40px;
}
:deep(.n-tree .n-tree-node) {
  padding: 0;
  align-items: center;
}
:deep(.n-tree .n-tree-node-switcher) {
  height: 40px;
  display: flex;
  align-items: center;
}
:deep(.menu-row-actions) {
  opacity: 0;
}
:deep(.n-tree-node-content-wrapper:hover .menu-row-actions),
:deep(.n-tree-node--selected .menu-row-actions) {
  opacity: 1;
}

/* 左右面板之间的拖拽分隔条 */
.drag-handle {
  width: 16px;
  flex-shrink: 0;
  align-self: stretch;
  position: relative;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &::after {
    content: '';
    width: 2px;
    height: 40px;
    border-radius: 2px;
    background-color: var(--theme-border, rgb(224, 224, 230));
    transition:
      background-color 0.2s ease,
      height 0.2s ease;
  }

  &:hover::after,
  &.is-dragging::after {
    background-color: var(--theme-primary);
    height: 64px;
  }
}
</style>
