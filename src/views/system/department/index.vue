<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
import type { TreeOption } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchDeleteDepartment,
  fetchGetDepartmentList,
  type Department,
  type DepartmentSearchParams,
  type DepartmentStatusFilter
} from './api';
import DepartmentOperateDrawer from './modules/department-operate-drawer.vue';
import DepartmentSearch from './modules/department-search.vue';
import TableActionButtons from '@/components/common/table-action-buttons';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'SystemDepartment'
});

const appStore = useAppStore();

const searchModel = reactive<DepartmentSearchParams>({
  name: '',
  status: 'all'
});

function flatten(list: Department[] = [], acc: Department[] = []): Department[] {
  for (const item of list) {
    acc.push(item);
    if (item.children?.length) flatten(item.children, acc);
  }
  return acc;
}

function filterTree(list: Department[], kw: string, status: DepartmentStatusFilter): Department[] {
  const res: Department[] = [];
  for (const item of list) {
    const children = item.children?.length ? filterTree(item.children, kw, status) : [];
    const nameMatch = !kw || item.name.toLowerCase().includes(kw);
    const statusMatch = status === 'all' || (status === 'enabled') === item.status;
    if ((nameMatch && statusMatch) || children.length) {
      res.push({ ...item, children });
    }
  }
  return res;
}

type DepartmentApiResult = Awaited<ReturnType<typeof fetchGetDepartmentList>>;

const { data, columns, columnChecks, getData, loading } = useNaiveTable<DepartmentApiResult, Department>({
  api: () => fetchGetDepartmentList(),
  transform: res => res.data ?? [],
  columns: () => createAllColumns(),
  immediate: false
});

const keyword = computed(() => searchModel.name.trim().toLowerCase());
const statusFilter = computed<DepartmentStatusFilter>(() => searchModel.status);
const displayData = computed(() => filterTree(data.value, keyword.value, statusFilter.value));

const expandedRowKeys = ref<string[]>([]);

/** 展开全部：需与表格 row-key（String(ID)）类型一致，否则点击无效 */
function expandAll() {
  expandedRowKeys.value = flatten(data.value).map(d => String(d.ID));
}

function collapseAll() {
  expandedRowKeys.value = [];
}

/** 是否已全部展开（用于切换按钮的图标/文案） */
const isAllExpanded = computed(() => {
  const all = flatten(data.value);
  return all.length > 0 && expandedRowKeys.value.length === all.length;
});

/** 合并为一个按钮：已全展开则折叠，否则展开 */
function toggleExpand() {
  if (isAllExpanded.value) {
    collapseAll();
  } else {
    expandAll();
  }
}

const scrollX = computed(() =>
  columns.value.reduce((acc, col) => {
    const c = col as { width?: number; minWidth?: number };
    return acc + (c.width ?? c.minWidth ?? 120);
  }, 0)
);

const parentNameMap = computed(() => {
  const map = new Map<number, string>();
  for (const d of flatten(data.value)) map.set(d.ID, d.name);
  return map;
});
const parentName = (id: number) => parentNameMap.value.get(id) ?? '-';

const { drawerVisible, closeDrawer, operateType, handleAdd, editingData, handleEdit, onDeleted } =
  useTableOperate<Department>(data, 'ID', getData);

/** 行内「新增子部门」时，预先设为上级部门 ID；为 null 表示不预设（顶级） */
const defaultParentId = ref<number | null>(null);

/** 顶部新增：重置预设上级部门为顶级 */
function handleAddTop() {
  defaultParentId.value = null;
  handleAdd();
}

/** 行内新增子部门：以上级部门 = 当前行 */
function handleAddChild(parentId: number) {
  defaultParentId.value = parentId;
  handleAdd();
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteDepartment(id);
  if (!error) {
    await onDeleted();
  }
}

/* ---------- parent options (tree) for drawer（从列表数据派生，随增删改自动同步） ---------- */
/** 将部门树转换为 NTreeSelect 的 options（key=ID, label=name） */
function toTreeOptions(list: Department[]): TreeOption[] {
  return list.map(d => ({
    key: d.ID,
    label: d.name,
    children: d.children?.length ? toTreeOptions(d.children) : undefined
  }));
}

const parentOptions = computed<TreeOption[]>(() => [
  // 虚拟根节点 key=0 代表「顶级部门」(parentId = 0)
  { key: 0, label: $t('page.system.department.parentIdTop'), children: toTreeOptions(data.value) }
]);

onMounted(() => {
  getData();
});

/* ---------- columns ---------- */
function createAllColumns(): NaiveUI.TableColumn<Department>[] {
  return [
    {
      key: 'name',
      title: $t('page.system.department.name'),
      minWidth: 220,
      render: row => row.name
    },
    {
      key: 'parentId',
      title: $t('page.system.department.parentId'),
      minWidth: 160,
      render: row => parentName(row.parentId)
    },
    {
      key: 'leader',
      title: $t('page.system.department.leader'),
      minWidth: 140,
      render: row => row.leader?.nickName ?? '-'
    },
    {
      key: 'sort',
      title: $t('page.system.department.sort'),
      width: 80,
      align: 'center',
      render: row => row.sort ?? '-'
    },
    {
      key: 'status',
      title: $t('page.system.department.status'),
      width: 100,
      align: 'center',
      render: row =>
        h(
          NTag,
          { size: 'small', type: row.status ? 'success' : 'default', bordered: false },
          {
            default: () => (row.status ? $t('page.system.department.enabled') : $t('page.system.department.disabled'))
          }
        )
    },
    {
      key: 'operation',
      title: $t('page.system.department.operation'),
      align: 'center',
      fixed: 'right',
      width: 280,
      render: row =>
        h(TableActionButtons, {
          actions: [
            {
              label: $t('common.add'),
              icon: 'material-symbols:add',
              type: 'primary',
              onClick: () => handleAddChild(row.ID)
            },
            {
              kind: 'edit',
              icon: 'material-symbols:edit',
              type: 'primary',
              onClick: () => handleEdit(row.ID)
            },
            {
              kind: 'delete',
              icon: 'material-symbols:delete',
              type: 'error',
              popconfirm: {
                content: $t('page.system.department.confirmDelete'),
                onPositiveClick: () => handleDelete(row.ID)
              }
            }
          ]
        })
    }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DepartmentSearch v-model:model="searchModel" @search="getData" @reset="getData" />

    <NCard
      :title="$t('page.system.department.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <NSpace :size="8" align="center" wrap>
          <NButton size="small" tertiary @click="toggleExpand">
            <template #icon>
              <SvgIcon :icon="isAllExpanded ? 'material-symbols:unfold-less' : 'material-symbols:unfold-more'" />
            </template>
            {{ isAllExpanded ? $t('page.system.department.collapseAll') : $t('page.system.department.expandAll') }}
          </NButton>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            @add="handleAddTop"
            @refresh="getData"
          >
            <template #default>
              <NButton size="small" ghost type="primary" @click="handleAdd">
                <template #icon>
                  <SvgIcon icon="material-symbols:add" />
                </template>
                {{ $t('common.add') }}
              </NButton>
            </template>
          </TableHeaderOperation>
        </NSpace>
      </template>

      <NDataTable
        v-model:expanded-row-keys="expandedRowKeys"
        :columns="columns"
        :data="displayData"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        :row-key="row => String((row as Department).ID)"
        class="sm:h-full"
      />

      <DepartmentOperateDrawer
        :visible="drawerVisible"
        :operate-type="operateType"
        :editing-data="editingData"
        :parent-options="parentOptions"
        :default-parent-id="defaultParentId"
        @close="closeDrawer"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>
