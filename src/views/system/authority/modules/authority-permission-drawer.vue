<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  NButton,
  NCard,
  NDrawer,
  NDrawerContent,
  NInput,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTree,
  type TreeOption
} from 'naive-ui';
import { $t } from '@/locales';
import type { Menu } from '@/views/system/menu/api';
import {
  fetchAddMenuAuthority,
  fetchGetAllApis,
  fetchGetBaseMenuTree,
  fetchGetMenuAuthority,
  fetchGetPolicyPathByAuthorityId,
  fetchUpdateCasbin,
  type Authority,
  type AuthorityApi,
  type AuthorityApiPolicy
} from '../api';
import AuthorityBtnAssignModal from './authority-btn-assign-modal.vue';

const props = defineProps<{
  visible: boolean;
  role: Authority | null;
}>();

const emit = defineEmits<{ close: [] }>();

const { loading, startLoading, endLoading } = useLoading();

// 两个 Tab 各自的保存 loading（菜单 / API 互相独立）
const { loading: menuSaving, startLoading: startMenuSaving, endLoading: endMenuSaving } = useLoading();
const { loading: apiSaving, startLoading: startApiSaving, endLoading: endApiSaving } = useLoading();

const activeTab = ref<'menu' | 'api'>('menu');

/* ---------- menu tab ---------- */
const menuKeyword = ref('');
const menuKeywordApplied = ref('');
const menuTree = ref<Menu[]>([]);
const checkedMenuKeys = ref<number[]>([]);
const defaultRouter = ref<string | null>(null);

function toMenuTreeOptions(menus: Menu[]): TreeOption[] {
  return (menus ?? []).map(m => ({
    key: m.ID,
    label: m.meta?.title || m.name,
    children: m.children?.length ? toMenuTreeOptions(m.children) : undefined
  }));
}

function filterMenuTree(menus: Menu[], k: string): TreeOption[] {
  return (menus ?? []).reduce<TreeOption[]>((acc, m) => {
    const label = (m.meta?.title || m.name).toLowerCase();
    const children = m.children?.length ? filterMenuTree(m.children, k) : [];
    if (label.includes(k) || children.length > 0) {
      acc.push({
        key: m.ID,
        label: m.meta?.title || m.name,
        children: children.length > 0 ? children : undefined
      });
    }
    return acc;
  }, []);
}

const filteredMenuTreeOptions = computed(() => {
  const k = menuKeywordApplied.value.trim().toLowerCase();
  if (!k) return toMenuTreeOptions(menuTree.value);
  return filterMenuTree(menuTree.value, k);
});

const defaultRouterOptions = computed(() => {
  const opts: { label: string; value: string }[] = [];
  const walk = (menus: Menu[]) => {
    for (const m of menus ?? []) {
      if (!m.children?.length) {
        // gin-vue-admin 的 defaultRouter 存的是菜单 name（路由名），不是 path
        opts.push({ label: m.meta?.title || m.name, value: m.name });
      }
      walk(m.children ?? []);
    }
  };
  walk(menuTree.value);
  return opts;
});

/** 菜单 ID → 完整 Menu 对象，供 render-label 快速取 menuBtn */
const menuById = computed(() => {
  const map = new Map<number, Menu>();
  const walk = (menus: Menu[]) => {
    for (const m of menus ?? []) {
      map.set(Number(m.ID), m);
      walk(m.children ?? []);
    }
  };
  walk(menuTree.value);
  return map;
});

/** 菜单树节点渲染：标题 + （menuBtn 非空时）「分配按钮」入口 */
function renderMenuLabel(info: { option: TreeOption }) {
  const label = info.option.label as string;
  const menu = menuById.value.get(Number(info.option.key));
  if (menu?.menuBtn?.length) {
    return h(
      'div',
      { class: 'flex items-center justify-between w-full gap-16px' },
      {
        default: () => [
          h('span', { class: 'truncate' }, label),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              tertiary: true,
              onClick: (e: MouseEvent) => {
                // 阻止冒泡，避免触发树节点勾选
                e.stopPropagation();
                openBtnAssign(menu);
              }
            },
            { default: () => $t('page.system.authority.assignBtn') }
          )
        ]
      }
    );
  }
  return label;
}

function findMenuNameById(menus: Menu[], id: number): string | null {
  for (const m of menus ?? []) {
    if (m.ID === id) return m.name;
    const found = findMenuNameById(m.children ?? [], id);
    if (found) return found;
  }
  return null;
}

/**
 * 根据勾选集合，从完整菜单树中裁剪出「已授权菜单树」——与 gin-vue-admin 的
 * addMenuAuthority 期望的 menus 数组结构一致：每个节点携带其「仅含已勾选后代」的 children。
 * - 节点被勾选 → 保留该节点，children 递归裁剪为已勾选的后代
 * - 节点未被勾选但其后代有勾选（半选父节点）→ 不保留父节点，直接把已勾选后代上提
 */
function pruneMenuTree(menus: Menu[], checked: Set<number>): Menu[] {
  const out: Menu[] = [];
  for (const m of menus ?? []) {
    const childChecked = m.children?.length ? pruneMenuTree(m.children, checked) : [];
    if (checked.has(Number(m.ID))) {
      out.push({ ...m, children: childChecked });
    } else if (childChecked.length) {
      out.push(...childChecked);
    }
  }
  return out;
}

/* ---------- api tab ---------- */
const apiNameKeyword = ref('');
const apiNameKeywordApplied = ref('');
const apiPathKeyword = ref('');
const apiPathKeywordApplied = ref('');
const allApis = ref<AuthorityApi[]>([]);
const checkedApiKeys = ref<string[]>([]);

const apiById = computed(() => {
  const map = new Map<number, AuthorityApi>();
  for (const api of allApis.value) map.set(api.ID, api);
  return map;
});

function toApiTreeOptions(apis: AuthorityApi[]): TreeOption[] {
  const groupMap = new Map<string, AuthorityApi[]>();
  for (const api of apis) {
    const group = api.apiGroup || $t('page.system.authority.otherGroup');
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(api);
  }
  return Array.from(groupMap.entries()).map(([group, items]) => ({
    key: `group-${group}`,
    label: `${group}${$t('page.system.authority.groupSuffix')}`,
    children: items.map(api => ({
      key: `${api.ID}`,
      label: api.description
    }))
  }));
}

const filteredApiTreeOptions = computed(() => {
  let list = allApis.value;
  const nameK = apiNameKeywordApplied.value.trim().toLowerCase();
  const pathK = apiPathKeywordApplied.value.trim().toLowerCase();
  if (nameK) list = list.filter(a => a.description.toLowerCase().includes(nameK));
  if (pathK) list = list.filter(a => a.path.toLowerCase().includes(pathK));
  return toApiTreeOptions(list);
});

function renderApiLabel(info: { option: TreeOption; checked: boolean; selected: boolean }) {
  const api = apiById.value.get(Number(info.option.key));
  if (!api) return info.option.label as string;
  return h(
    'div',
    { class: 'flex justify-between items-center w-full gap-16px' },
    {
      default: () => [
        h('span', { class: 'truncate' }, api.description),
        h('span', { class: 'text-gray-400 text-xs shrink-0' }, api.path)
      ]
    }
  );
}

function policiesFromCheckedKeys(keys: string[]): AuthorityApiPolicy[] {
  return keys
    .map(k => apiById.value.get(Number(k)))
    .filter((a): a is AuthorityApi => !!a)
    .map(a => ({ path: a.path, method: a.method }));
}

// 分配按钮
const btnModalVisible = ref(false);
const btnModalMenu = ref<Menu | null>(null);
//  打开「分配按钮」弹窗
function openBtnAssign(menu: Menu) {
  if (!props.role) return;
  btnModalMenu.value = menu;
  btnModalVisible.value = true;
}

/* ---------- 加载与保存 ---------- */

/** 加载角色权限数据：菜单树 / 已授权菜单 / 接口列表 / 已授权接口策略（四个接口并行） */
async function loadPermissionData(authorityId: number) {
  startLoading();
  try {
    const [{ data: baseMenuData }, { data: menuAuthData }, { data: apiData }, { data: policyData }] =
      await Promise.all([
        fetchGetBaseMenuTree(),
        fetchGetMenuAuthority(authorityId),
        fetchGetAllApis(),
        fetchGetPolicyPathByAuthorityId(authorityId)
      ]);

    menuTree.value = baseMenuData?.menus ?? [];
    // gin-vue-admin：只勾选叶子节点，避免父节点被勾选后级联全选
    const authMenus = menuAuthData?.menus ?? [];
    const parentIdSet = new Set(authMenus.map(m => Number(m.parentId)));
    checkedMenuKeys.value = authMenus
      .filter(m => !parentIdSet.has(Number(m.menuId ?? m.ID)))
      .map(m => Number(m.menuId ?? m.ID));
    allApis.value = apiData?.apis ?? [];
    checkedApiKeys.value = (policyData?.paths ?? [])
      .map(p => allApis.value.find(a => a.path === p.path && a.method === p.method))
      .filter((a): a is AuthorityApi => !!a)
      .map(a => String(a.ID));

    const router = props.role?.defaultRouter;
    defaultRouter.value =
      router ||
      (checkedMenuKeys.value.length > 0 ? findMenuNameById(menuTree.value, checkedMenuKeys.value[0]) : null);
  } finally {
    endLoading();
  }
}

watch(
  () => props.visible,
  async visible => {
    // 关闭抽屉后，Tab 回归默认值（菜单），并收起分配按钮弹窗，避免下次打开残留
    if (!visible) {
      activeTab.value = 'menu';
      btnModalVisible.value = false;
      return;
    }
    if (!props.role) return;
    await loadPermissionData(props.role.authorityId);
  },
  { immediate: true }
);

// 角色菜单
async function handleSaveMenu() {
  if (!props.role) return;

  const checkedSet = new Set(checkedMenuKeys.value.map(Number));
  const menus = pruneMenuTree(menuTree.value, checkedSet);

  startMenuSaving();
  try {
    const { error } = await fetchAddMenuAuthority(props.role.authorityId, menus);
    if (!error) {
      window.$message?.success($t('page.system.authority.permissionSuccess'));
    }
  } finally {
    endMenuSaving();
  }
}

// 角色API
async function handleSaveApi() {
  if (!props.role) return;

  startApiSaving();
  try {
    const { error } = await fetchUpdateCasbin(props.role.authorityId, policiesFromCheckedKeys(checkedApiKeys.value));
    if (!error) {
      window.$message?.success($t('page.system.authority.permissionSuccess'));
    }
  } finally {
    endApiSaving();
  }
}

function handleSave() {
  if (activeTab.value === 'api') {
    handleSaveApi();
  } else {
    handleSaveMenu();
  }
}

function handleSearch() {
  menuKeywordApplied.value = menuKeyword.value;
  apiNameKeywordApplied.value = apiNameKeyword.value;
  apiPathKeywordApplied.value = apiPathKeyword.value;
}

function handleReset() {
  menuKeyword.value = '';
  menuKeywordApplied.value = '';
  apiNameKeyword.value = '';
  apiNameKeywordApplied.value = '';
  apiPathKeyword.value = '';
  apiPathKeywordApplied.value = '';
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="720" @update:show="val => !val && emit('close')">
    <NDrawerContent
      :title="$t('page.system.authority.permissionTitle')"
      :native-scrollbar="true"
      :body-content-style="{ display: 'flex', flexDirection: 'column' }"
    >
      <NTabs v-model:value="activeTab" type="line" display-directive="show:lazy" class="permission-tabs">
        <NTabPane name="menu" :tab="$t('page.system.authority.roleMenu')">
          <div class="mb-12px flex items-center gap-12px">
            <span class="shrink-0">{{ $t('page.system.authority.defaultHomepage') }}</span>
            <NSelect v-model:value="defaultRouter" :options="defaultRouterOptions" clearable class="flex-1" />
          </div>

          <div class="mb-12px flex items-center gap-12px">
            <NInput
              v-model:value="menuKeyword"
              :placeholder="$t('page.system.authority.filterMenu')"
              clearable
              class="flex-1"
            />
            <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
            <NButton @click="handleReset">{{ $t('common.reset') }}</NButton>
          </div>

          <NCard :bordered="false" class="permission-card" :loading="loading">
            <div class="permission-tree-wrap">
              <NTree
                v-model:checked-keys="checkedMenuKeys"
                block-line
                checkable
                cascade
                :data="filteredMenuTreeOptions"
                :default-expand-all="true"
                :render-label="renderMenuLabel"
              />
            </div>
          </NCard>
        </NTabPane>

        <NTabPane name="api" :tab="$t('page.system.authority.roleApi')">
          <div class="mb-12px flex items-center gap-12px">
            <NInput
              v-model:value="apiNameKeyword"
              :placeholder="$t('page.system.authority.filterApiName')"
              clearable
              class="flex-1"
            />
            <NInput
              v-model:value="apiPathKeyword"
              :placeholder="$t('page.system.authority.filterApiPath')"
              clearable
              class="flex-1"
            />
            <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
            <NButton @click="handleReset">{{ $t('common.reset') }}</NButton>
          </div>

          <NCard :bordered="false" class="permission-card" :loading="loading">
            <div class="permission-tree-wrap">
              <NTree
                v-model:checked-keys="checkedApiKeys"
                block-line
                checkable
                cascade
                :data="filteredApiTreeOptions"
                :default-expand-all="true"
                :render-label="renderApiLabel"
              />
            </div>
          </NCard>
        </NTabPane>
      </NTabs>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="activeTab === 'api' ? apiSaving : menuSaving" @click="handleSave">
            {{ $t('common.save') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>

  <AuthorityBtnAssignModal
    v-model:show="btnModalVisible"
    :menu="btnModalMenu"
    :authority-id="props.role?.authorityId ?? 0"
  />
</template>

<style scoped>
.permission-tabs {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.permission-tabs :deep(.n-tabs-nav) {
  flex-shrink: 0;
}

.permission-tabs :deep(.n-tabs-pane-wrapper) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.permission-tabs :deep(.n-tab-pane) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.permission-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.permission-card :deep(.n-card__content) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.permission-tree-wrap {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
</style>
