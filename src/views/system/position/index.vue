<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NEmpty,
  NInput,
  NPopconfirm,
  NScrollbar,
  NSpin,
  NTag,
  NTooltip,
  NPagination,
  useThemeVars
} from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import {
  fetchDeletePosition,
  fetchGetPositionList,
  fetchGetPositionUsers,
  fetchSetPositionUsers,
  type Position
} from './api';
import { fetchGetUserList, type User } from '@/views/system/user/api';
import PositionOperateDrawer from './modules/position-operate-drawer.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'SystemPosition'
});

const appStore = useAppStore();

// naive-ui 主题主色，注入为局部 CSS 变量供样式使用
const themeVars = useThemeVars();

// 左侧面板宽度百分比（可拖拽分隔条调整）
const MIN_PERCENT = 20;
const MAX_PERCENT = 50;
const DEFAULT_PERCENT = 25;
const leftPanelPercent = ref(DEFAULT_PERCENT);
const isDragging = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const leftPanelStyle = computed(() => {
  if (appStore.isMobile) return {};
  return { width: `${leftPanelPercent.value}%` };
});

function handleDragMove(ev: MouseEvent) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  // 容器有 16px padding，按内容区计算百分比
  const contentLeft = rect.left + 16;
  const contentWidth = rect.width - 32;
  if (contentWidth <= 0) return;
  const percent = ((ev.clientX - contentLeft) / contentWidth) * 100;
  leftPanelPercent.value = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, percent));
}

function handleDragEnd() {
  isDragging.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}

function startDrag(e: MouseEvent) {
  if (appStore.isMobile) return;
  e.preventDefault();
  isDragging.value = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// 左侧面板：岗位列表（已对接接口）

// 从接口加载的岗位列表
const positionList = ref<Position[]>([]);
const positionLoading = ref(false);
const positionKeyword = ref('');

const filteredPositions = computed(() => {
  const kw = positionKeyword.value.trim().toLowerCase();
  if (!kw) return positionList.value;
  return positionList.value.filter(p => p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw));
});

/** 加载岗位列表（全量拉取，pageSize 1000） */
async function loadPositions() {
  positionLoading.value = true;
  try {
    const { data, error } = await fetchGetPositionList({ page: 1, pageSize: 1000 });
    if (!error) {
      positionList.value = data?.list ?? [];
    }
  } finally {
    positionLoading.value = false;
  }
}

// 当前选中的岗位（右侧面板标题来源）
const selectedPosition = ref<Position | null>(null);

/** 选中岗位并加载其成员列表 */
function selectPosition(pos: Position) {
  selectedPosition.value = pos;
  // 切换岗位时重置右侧搜索与勾选状态
  memberSearch.userName = '';
  memberSearch.nickName = '';
  checkedMemberKeys.value = [];
  memberPagination.page = 1;
  // 加载新选中岗位的成员列表
  loadMembers(pos.ID);
}

// 抽屉：新增 / 编辑岗位
type DrawerOperateType = 'add' | 'edit';
const drawerVisible = ref(false);
const drawerOperateType = ref<DrawerOperateType>('add');
const editingPosition = ref<Position | null>(null);

/** 打开新增岗位抽屉 */
function openAddDrawer() {
  drawerOperateType.value = 'add';
  editingPosition.value = null;
  drawerVisible.value = true;
}

/** 打开编辑岗位抽屉 */
function openEditDrawer(pos: Position) {
  drawerOperateType.value = 'edit';
  editingPosition.value = pos;
  drawerVisible.value = true;
}

/** 关闭抽屉 */
function closeDrawer() {
  drawerVisible.value = false;
}

/** 提交成功后刷新列表，并保持原选中岗位 */
async function handleDrawerSubmitted() {
  closeDrawer();
  const previousId = selectedPosition.value?.ID;
  await loadPositions();
  // 刷新后保持原选中岗位
  if (previousId !== undefined) {
    const refreshed = positionList.value.find(p => p.ID === previousId);
    if (refreshed) selectedPosition.value = refreshed;
  }
}

/** 删除岗位并刷新列表 */
async function handleDeletePosition(id: number) {
  const { error } = await fetchDeletePosition(id);
  if (!error) {
    window.$message?.success($t('page.system.position.deleteSuccess'));
    if (selectedPosition.value?.ID === id) selectedPosition.value = null;
    await loadPositions();
  }
}

// 右侧面板：成员（已对接用户列表与岗位成员接口）

// 右侧表格渲染的用户列表（来自用户管理列表接口）
const members = ref<User[]>([]);
// 用户列表总数（服务端分页用）
const memberTotal = ref(0);
// 当前岗位已分配的用户 ID（来自 getPositionUsers）
const selectedUserIds = ref<number[]>([]);
const memberLoading = ref(false);
// 保存成员操作的加载状态
const savingMembers = ref(false);

const memberSearch = reactive({
  userName: '',
  nickName: ''
});

const checkedMemberKeys = ref<Array<string | number>>([]);

// 右侧用户表格的分页状态（服务端分页）
const memberPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
});

/** 加载当前页用户列表（带搜索条件） */
async function loadUserList() {
  memberLoading.value = true;
  try {
    const { data, error } = await fetchGetUserList({
      page: memberPagination.page,
      pageSize: memberPagination.pageSize,
      username: memberSearch.userName || undefined,
      nickname: memberSearch.nickName || undefined
    });
    if (!error && data) {
      members.value = data.list;
      memberTotal.value = data.total;
      memberPagination.itemCount = data.total;
    }
  } finally {
    memberLoading.value = false;
  }
}

/**
 * 查询选中岗位已分配的用户，并同步勾选状态
 * @param positionId 选中的岗位 ID
 */
async function loadMembers(positionId?: number) {
  if (positionId === undefined) return;
  memberLoading.value = true;
  try {
    const [posRes, userRes] = await Promise.all([
      fetchGetPositionUsers(positionId),
      fetchGetUserList({
        page: memberPagination.page,
        pageSize: memberPagination.pageSize,
        username: memberSearch.userName || undefined,
        nickname: memberSearch.nickName || undefined
      })
    ]);
    // 根据岗位已分配的用户 ID 同步勾选状态
    if (!posRes.error && posRes.data) {
      selectedUserIds.value = posRes.data;
      checkedMemberKeys.value = posRes.data.map(String);
    }
    // 渲染用户列表
    if (!userRes.error && userRes.data) {
      members.value = userRes.data.list;
      memberTotal.value = userRes.data.total;
      memberPagination.itemCount = userRes.data.total;
    }
  } finally {
    memberLoading.value = false;
  }
}

/** 点击查询：重置到第 1 页并重新加载用户列表 */
function handleMemberQuery() {
  memberPagination.page = 1;
  loadUserList();
}

/** 重置搜索条件并重新加载用户列表 */
function handleMemberReset() {
  memberSearch.userName = '';
  memberSearch.nickName = '';
  memberPagination.page = 1;
  loadUserList();
}

/** 修改每页条数：重置到第 1 页并重新加载 */
function onMemberPageSizeChange(size: number) {
  memberPagination.pageSize = size;
  memberPagination.page = 1;
  loadUserList();
}

/** 保存当前岗位的成员关系（调用 setPositionUsers） */
async function handleSaveMembers() {
  if (!selectedPosition.value) {
    window.$message?.warning($t('page.system.position.selectPositionFirst'));
    return;
  }

  savingMembers.value = true;
  try {
    const positionId = selectedPosition.value.ID;
    const userIds = checkedMemberKeys.value.map(id => Number(id));
    const { error } = await fetchSetPositionUsers({ positionId, userIds });
    if (!error) {
      window.$message?.success($t('page.system.position.saveSuccess'));
    }
  } finally {
    savingMembers.value = false;
  }
}

// 右侧用户表格列配置
const memberColumns: NaiveUI.TableColumn<User>[] = [
  { type: 'selection', align: 'center', width: 48 },
  { key: 'ID', title: 'ID', align: 'center', width: 80 },
  { key: 'userName', title: $t('page.system.position.userName'), align: 'center', minWidth: 120 },
  {
    key: 'nickName',
    title: $t('page.system.position.nickName'),
    align: 'center',
    minWidth: 120,
    render: row => h(NTag, { size: 'small', bordered: false, type: 'info' }, { default: () => row.nickName })
  }
];

const scrollX = computed(() => 600);

onMounted(async () => {
  await loadPositions();
  // 默认选中第一个岗位，并加载其成员列表
  if (!selectedPosition.value && positionList.value.length) {
    selectPosition(positionList.value[0]);
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="position-page flex h-full overflow-hidden p-16px lt-sm:block lt-sm:overflow-auto"
    :style="{ '--theme-primary': themeVars.primaryColor, '--theme-border': themeVars.borderColor }"
  >
    <NCard
      :bordered="false"
      size="small"
      class="position-page__left flex-shrink-0 self-stretch lt-sm:w-full lt-sm:mb-16px"
      :style="leftPanelStyle"
      :content-style="{ display: 'flex', flexDirection: 'column', minHeight: 0 }"
    >
      <template #header>
        <span class="font-semibold">{{ $t('page.system.position.positionList') }}</span>
      </template>

      <div class="flex gap-8px pb-12px">
        <NInput
          v-model:value="positionKeyword"
          :placeholder="$t('page.system.position.searchPosition')"
          clearable
          size="small"
        />
        <NButton type="primary" size="small" @click="openAddDrawer">
          <template #icon>
            <span class="text-14px font-bold leading-none">+</span>
          </template>
          {{ $t('common.add') }}
        </NButton>
      </div>

      <NScrollbar class="position-page__list flex-1" :native-scrollbar="false">
        <NSpin :show="positionLoading">
          <NEmpty v-if="!positionLoading && filteredPositions.length === 0" class="mt-5" description="暂无岗位" />
          <ul v-else class="position-list">
            <li
              v-for="pos in filteredPositions"
              :key="pos.ID"
              class="position-item"
              :class="{ 'is-active': selectedPosition?.ID === pos.ID }"
              @click="selectPosition(pos)"
            >
              <span class="position-item__name">{{ pos.name }}</span>
              <span class="position-item__code">({{ pos.code }})</span>
              <span class="position-item__actions">
                <NButton ghost type="primary" size="tiny" @click.stop="openEditDrawer(pos)">
                  <template #icon><SvgIcon icon="material-symbols:edit" /></template>
                  {{ $t('common.edit') }}
                </NButton>
                <NPopconfirm @positive-click="handleDeletePosition(pos.ID)">
                  <template #trigger>
                    <NButton ghost type="error" size="tiny" @click.stop>
                      <template #icon><SvgIcon icon="material-symbols:delete" /></template>
                      {{ $t('common.delete') }}
                    </NButton>
                  </template>
                  {{ $t('page.system.position.confirmDelete') }}
                </NPopconfirm>
              </span>
            </li>
          </ul>
        </NSpin>
      </NScrollbar>
    </NCard>

    <div class="drag-handle lt-sm:hidden" :class="{ 'is-dragging': isDragging }" @mousedown="startDrag"></div>

    <NCard
      :bordered="false"
      size="small"
      class="position-page__right flex-1 card-wrapper sm:flex-1-hidden"
      :content-style="{ display: 'flex', flexDirection: 'column', minHeight: 0 }"
    >
      <template #header>
        <span class="font-semibold">
          [{{ selectedPosition?.name ?? $t('page.system.position.title') }}] {{ $t('page.system.position.members') }}
        </span>
      </template>
      <template #header-extra>
        <NTooltip placement="bottom">
          <template #trigger>
            <NButton type="primary" size="small" :loading="savingMembers" @click="handleSaveMembers">
              {{ $t('page.system.position.saveMembers') }}
            </NButton>
          </template>
          {{ $t('page.system.position.saveMembers') }}
        </NTooltip>
      </template>

      <div class="member-toolbar">
        <div class="flex flex-wrap items-center gap-16px">
          <div class="member-field">
            <label class="member-field__label">{{ $t('page.system.position.userName') }}</label>
            <NInput
              v-model:value="memberSearch.userName"
              :placeholder="$t('page.system.position.userNamePlaceholder')"
              clearable
              size="small"
              style="width: 180px"
            />
          </div>
          <div class="member-field">
            <label class="member-field__label">{{ $t('page.system.position.nickName') }}</label>
            <NInput
              v-model:value="memberSearch.nickName"
              :placeholder="$t('page.system.position.nickNamePlaceholder')"
              clearable
              size="small"
              style="width: 180px"
            />
          </div>
          <div class="member-actions flex gap-8px">
            <NButton type="primary" size="small" @click="handleMemberQuery">
              <template #icon>
                <icon-mdi-magnify class="text-14px" />
              </template>
              {{ $t('page.system.position.query') }}
            </NButton>
            <NButton size="small" @click="handleMemberReset">
              <template #icon>
                <icon-mdi-refresh class="text-14px" />
              </template>
              {{ $t('page.system.position.reset') }}
            </NButton>
          </div>
        </div>
      </div>

      <div class="member-divider"></div>

      <NDataTable
        v-model:checked-row-keys="checkedMemberKeys"
        :columns="memberColumns"
        :data="members"
        :loading="memberLoading"
        size="small"
        :bordered="true"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :row-key="row => String(row.ID)"
        :pagination="false"
        class="member-table"
      />
      <div class="mt-12px flex justify-end">
        <NPagination
          v-model:page="memberPagination.page"
          v-model:page-size="memberPagination.pageSize"
          :item-count="memberTotal"
          :page-sizes="memberPagination.pageSizes"
          show-size-picker
          @update:page="loadUserList"
          @update:page-size="onMemberPageSizeChange"
        />
      </div>
    </NCard>

    <PositionOperateDrawer
      :visible="drawerVisible"
      :operate-type="drawerOperateType"
      :editing-data="editingPosition"
      @close="closeDrawer"
      @submitted="handleDrawerSubmitted"
    />
  </div>
</template>

<style scoped lang="scss">
.position-page {
  &__left {
    :deep(.n-card__content) {
      padding-top: 12px;
    }
  }

  &__list {
    min-height: 0;
  }
}

// 左右面板之间的拖拽分隔条
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
    background-color: var(--theme-primary, #18a058);
    height: 64px;
  }
}

.position-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

// 右侧面板：成员工具栏
.member-toolbar {
  padding: 14px 16px;
  background-color: var(--n-action-color);
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
}

.member-field {
  display: flex;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--n-text-color-2);
    white-space: nowrap;
  }
}

.member-divider {
  height: 1px;
  background-color: var(--n-divider-color);
  margin: 12px 0;
}

.member-table {
  // 表格整体作为 flex 子项撑满剩余高度
  flex: 1;
  min-height: 0;

  :deep(.n-data-table) {
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.n-data-table-thead) {
    background-color: var(--n-action-color);
  }

  :deep(.n-data-table-th) {
    font-weight: 600;
    color: var(--n-text-color-1);
  }

  :deep(.n-data-table-tr:hover > .n-data-table-td) {
    background-color: var(--n-action-color);
  }
}

.position-item {
  position: relative;
  display: flex;
  align-items: center;
  line-height: 1;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--n-text-color-base);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  margin-bottom: 6px;

  &__name {
    display: inline-flex;
    align-items: center;
    font-weight: 500;
  }

  &__code {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
    color: var(--n-text-color-disabled);
    font-size: 12px;
  }

  &__actions {
    margin-left: auto;
    display: none;
    gap: 4px;
    flex-shrink: 0;
    align-items: center;
  }

  &:hover {
    background-color: var(--n-action-color);

    .position-item__actions {
      display: inline-flex;
    }
  }

  &.is-active {
    // 1px 主色描边，跟随主题
    border-color: var(--theme-primary);
    // 轻微浮起，提升精致度
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    // 主色淡底：opacity 叠加，兼容所有浏览器且不依赖 color-mix
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-color: var(--theme-primary);
      opacity: 0.16;
      pointer-events: none;
    }

    // 左侧主色标识条
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 56%;
      border-radius: 0 4px 4px 0;
      background-color: var(--theme-primary, #18a058);
      z-index: 1;
    }

    .position-item__name {
      color: var(--theme-primary, #18a058);
      font-weight: 600;
    }

    // 选中态常驻显示操作按钮，便于快速编辑/删除
    .position-item__actions {
      display: inline-flex;
    }

    // 文字、编码、操作按钮浮于淡底之上
    & > * {
      position: relative;
      z-index: 1;
    }
  }
}
</style>
