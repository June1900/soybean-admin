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
import MenuOperateDrawer from './modules/menu-operate-drawer.vue';

import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'SystemMenu'
});

const themeVars = useThemeVars();

/* ---------- helpers ---------- */
/** 将 meta.title 中存储的 i18n key（如 route.home）转换为实际文案 */
function translateTitle(title: string | undefined): string {
  if (!title) return '';
  return $t(title as any);
}

/* ---------- data ---------- */
const data = ref<Menu[]>([]);
const loading = ref(false);

async function getData() {
  loading.value = true;
  const res = await fetchGetMenuList();
  loading.value = false;
  if (!res.error && res.data) {
    data.value = buildTreeFromFlat(res.data);
  }
}

/** 后端返回扁平数组（children 为 null），需根据 parentId 构建树结构 */
function buildTreeFromFlat(list: Menu[]): Menu[] {
  const map = new Map<number, Menu>();
  const roots: Menu[] = [];
  // 先收集所有节点
  for (const item of list) {
    map.set(item.ID, { ...item, children: [] });
  }
  // 根据 parentId 组装父子关系
  for (const item of list) {
    const node = map.get(item.ID)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  // 清理空 children 为 null，与原数据结构一致
  const cleanup = (nodes: Menu[]) => {
    for (const n of nodes) {
      if (n.children && n.children.length === 0) {
        n.children = null;
      } else if (n.children) {
        cleanup(n.children);
      }
    }
  };
  cleanup(roots);
  return roots;
}

/* ---------- helpers ---------- */
function flatten(list: Menu[] = [], acc: Menu[] = []): Menu[] {
  for (const item of list) {
    acc.push(item);
    if (item.children?.length) flatten(item.children, acc);
  }
  return acc;
}

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

/* ---------- splitter: 左右拖拽，宽度百分比 20%-50%，默认 25% ---------- */
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

/* ---------- tree options ---------- */
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

/** 菜单类型：存在子节点视为「目录」，否则为「菜单」 */
function resolveMenuType(menu: Menu): 'directory' | 'menu' {
  return menu.children && menu.children.length > 0 ? 'directory' : 'menu';
}

/** 渲染树节点：图标 + 标题 + 路径 + 右侧「+」「删除」按钮 */
function renderLabel(info: { option: TreeOption }) {
  const key = Number(info.option.key);
  const item = menuById.value.get(key);
  if (!item) return info.option.label as string;

  const icon = item.meta?.icon;
  const iconName = icon
    ? `material-symbols:${icon.startsWith('icon-') ? '' : icon}`
    : item.children?.length
      ? 'material-symbols:folder'
      : 'material-symbols:circle';

  const searchActive = !!searchKw.value.trim();
  const isDirectory = resolveMenuType(item) === 'directory';
  const hasChildren = !!(item.children && item.children.length > 0);

  const actions: ReturnType<typeof h>[] = [];

  // 仅目录类型显示新增按钮
  if (isDirectory) {
    actions.push(
      h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          trigger: () =>
            h(
              NButton,
              {
                size: 'tiny',
                type: 'primary',
                text: true,
                onClick: (e: MouseEvent) => {
                  e.stopPropagation();
                  defaultParentId.value = item.ID;
                  handleAdd();
                }
              },
              {
                icon: () => h(SvgIcon, { icon: 'material-symbols:add', class: 'text-14px' })
              }
            ),
          default: () => $t('page.system.menu.addChild')
        }
      )
    );
  }

  // 存在子节点不允许删除
  actions.push(
    h(
      NTooltip,
      { trigger: 'hover', placement: 'top' },
      {
        trigger: () =>
          h(
            NButton,
            {
              size: 'tiny',
              type: 'error',
              text: true,
              disabled: hasChildren,
              onClick: (e: MouseEvent) => {
                e.stopPropagation();
                if (!hasChildren) confirmDeleteMenu(item.ID);
              }
            },
            {
              icon: () => h(SvgIcon, { icon: 'material-symbols:delete', class: 'text-14px' })
            }
          ),
        default: () =>
          hasChildren ? $t('page.system.menu.deleteDisabledHasChildren') : $t('page.system.menu.panelDelete')
      }
    )
  );

  return h('div', { class: 'flex w-full h-40px items-center justify-between gap-8px' }, [
    h('div', { class: 'flex min-w-0 flex-1 items-center gap-6px overflow-hidden' }, [
      h(SvgIcon, { icon: iconName, class: 'shrink-0 text-16px' }),
      h(
        'span',
        {
          class: 'truncate',
          title: translateTitle(item.meta?.title) || item.name
        },
        translateTitle(item.meta?.title) || item.name
      ),
      searchActive ? h('span', { class: 'text-12px text-gray-400' }, `(${item.path})`) : null
    ]),
    h('div', { class: 'menu-row-actions flex shrink-0 items-center gap-2px transition-opacity' }, actions)
  ]);
}

const treeOptions = computed<TreeOption[]>(() => buildTreeOptions(displayData.value));

/* ---------- operate (add / edit / delete) ---------- */
const drawerVisible = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editingData = ref<Menu | null>(null);
const defaultParentId = ref<number>(0);

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  drawerVisible.value = true;
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

/* ---------- btn permission table columns ---------- */
const btnColumns: NaiveUI.TableColumn<{ ID: number; name: string; desc: string }>[] = [
  {
    key: 'idx',
    title: '#',
    width: 60,
    align: 'center',
    render: (_row, index) => String(index + 1)
  },
  {
    key: 'desc',
    title: $t('page.system.menu.fieldMenuName'),
    minWidth: 160,
    render: row => row.desc || '-'
  },
  {
    key: 'name',
    title: $t('page.system.menu.fieldBtnPerm'),
    minWidth: 200,
    render: row => row.name
  },
  {
    key: 'status',
    title: $t('page.system.menu.fieldMenuStatus'),
    width: 100,
    align: 'center',
    render: () =>
      h(
        NTag,
        { size: 'small', type: 'success', bordered: false },
        { default: () => $t('page.system.menu.statusNormal') }
      )
  },
  {
    key: 'createdAt',
    title: $t('page.system.menu.fieldCreateTime'),
    minWidth: 160,
    render: () => '-'
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

/* ---------- lifecycle ---------- */
onMounted(async () => {
  await getData();
  // 默认选中第一个根节点
  if (data.value.length && selectedId.value === null) {
    selectedId.value = data.value[0].ID;
    expandedKeys.value = [String(data.value[0].ID)];
  }
});

/* ---------- actions ---------- */
function handleRefresh() {
  selectedId.value = null;
  getData();
}

/** 提交后刷新：展开父节点，使新增子菜单可见 */
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
</script>

<template>
  <div class="flex min-h-500px flex-col gap-16px overflow-hidden lt-sm:overflow-auto p-16px">
    <div class="flex min-h-0 flex-1 flex-col gap-12px overflow-hidden rounded-8px bg-white p-16px shadow-sm">
      <div
        ref="splitContainerRef"
        class="flex min-h-0 flex-1"
        :style="{ '--theme-primary': themeVars.primaryColor, '--theme-border': themeVars.borderColor }"
      >
        <!-- 左侧：菜单列表 -->
        <div class="flex shrink-0 flex-col gap-12px overflow-hidden pr-12px" :style="{ width: `${leftPercent}%` }">
          <div class="flex items-center justify-between">
            <h3 class="m-0 text-16px font-500">{{ $t('page.system.menu.panelMenuList') }}</h3>
            <NSpace :size="6" align="center" :wrap="false">
              <NButton size="small" type="primary" quaternary @click="handleAdd">
                <template #icon><SvgIcon icon="material-symbols:add" /></template>
              </NButton>
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
                @click="selectedId !== null && ((defaultParentId = selectedId), handleAdd())"
              >
                <template #icon><SvgIcon icon="material-symbols:add" /></template>
                {{ $t('page.system.menu.panelAddChild') }}
              </NButton>
              <NButton
                type="info"
                size="small"
                ghost
                :disabled="!selectedId"
                @click="selectedId !== null && handleEdit(selectedId)"
              >
                <template #icon><SvgIcon icon="material-symbols:edit" /></template>
                {{ $t('page.system.menu.panelEdit') }}
              </NButton>
              <NButton
                type="error"
                size="small"
                ghost
                :disabled="!selectedId"
                @click="selectedId !== null && confirmDeleteMenu(selectedId)"
              >
                <template #icon><SvgIcon icon="material-symbols:delete" /></template>
                {{ $t('page.system.menu.panelDelete') }}
              </NButton>
            </NSpace>
          </div>

          <!-- 未选中提示 -->
          <div
            v-if="!activeMenu"
            class="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-8px border border-dashed border-gray-200 text-gray-400"
          >
            <SvgIcon icon="material-symbols:info-outline" class="mb-8px text-36px opacity-50" />
            <span>{{ $t('page.system.menu.noSelectHint') }}</span>
          </div>

          <template v-else>
            <!-- 详情网格 -->
            <div class="rounded-8px border border-gray-100 p-16px">
              <NGrid :cols="3" :x-gap="24" :y-gap="16" responsive="screen" item-responsive>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-gray-500">{{ $t('page.system.menu.fieldMenuType') }}</span>
                    <NTag
                      size="small"
                      :type="resolveMenuType(activeMenu) === 'directory' ? 'info' : 'success'"
                      :bordered="false"
                      round
                    >
                      {{
                        (activeMenu.menuType ??
                          (resolveMenuType(activeMenu) === 'directory' ? 'directory' : 'menu')) === 'directory'
                          ? $t('page.system.menu.typeDirectory')
                          : $t('page.system.menu.typeMenu')
                      }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-gray-500">{{ $t('page.system.menu.fieldMenuStatus') }}</span>
                    <NTag size="small" type="success" :bordered="false" round>
                      {{ $t('page.system.menu.statusNormal') }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-gray-500">{{ $t('page.system.menu.fieldSort') }}</span>
                    <span class="text-14px">{{ activeMenu.sort }}</span>
                  </div>
                </NGridItem>

                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-gray-500 shrink-0">{{ $t('page.system.menu.fieldMenuName') }}</span>
                    <span class="truncate text-14px" :title="translateTitle(activeMenu.meta?.title) || activeMenu.name">
                      {{ translateTitle(activeMenu.meta?.title) || activeMenu.name }}
                    </span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-gray-500 shrink-0">{{ $t('page.system.menu.fieldRoutePath') }}</span>
                    <span class="truncate text-14px" :title="activeMenu.path">{{ activeMenu.path }}</span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-gray-500">{{ $t('page.system.menu.fieldDisplayStatus') }}</span>
                    <NTag size="small" :type="activeMenu.hidden ? 'warning' : 'success'" :bordered="false" round>
                      {{ activeMenu.hidden ? $t('page.system.menu.hidden') : $t('page.system.menu.show') }}
                    </NTag>
                  </div>
                </NGridItem>

                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between">
                    <span class="text-13px text-gray-500">{{ $t('page.system.menu.fieldIsExternal') }}</span>
                    <NTag size="small" type="warning" :bordered="false" round>
                      {{ $t('page.system.menu.externalNo') }}
                    </NTag>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-gray-500 shrink-0">{{ $t('page.system.menu.fieldBtnPerm') }}</span>
                    <span class="truncate text-14px" :title="activeMenu.name">{{ activeMenu.name }}</span>
                  </div>
                </NGridItem>
                <NGridItem span="3 s:3 m:1 l:1 xl:1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="text-13px text-gray-500 shrink-0">{{ $t('page.system.menu.fieldLayout') }}</span>
                    <span class="truncate text-14px" :title="activeMenu.layout || 'layout.base'">
                      {{ activeMenu.layout || 'layout.base' }}
                    </span>
                  </div>
                </NGridItem>
              </NGrid>
            </div>

            <!-- 按钮权限列表 -->
            <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-8px border border-gray-100 p-16px">
              <div class="flex items-center justify-between">
                <h4 class="m-0 text-14px font-500">{{ $t('page.system.menu.panelBtnPermission') }}</h4>
                <NButton size="small" quaternary @click="handleRefresh">
                  <template #icon><SvgIcon icon="material-symbols:refresh" /></template>
                </NButton>
              </div>

              <NDataTable
                :columns="btnColumns"
                :data="activeMenu?.menuBtn ?? []"
                size="small"
                :bordered="false"
                single-line
                :scroll-x="btnScrollX"
                :row-key="row => String(row.ID)"
                :loading="loading"
                class="mt-12px flex-1"
              >
                <template #empty>
                  <NEmpty :description="$t('page.system.menu.btnEmpty')" size="small" />
                </template>
              </NDataTable>
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
  padding: 2px 0;
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
