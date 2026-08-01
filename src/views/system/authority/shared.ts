import type { TreeOption, TreeSelectOption } from 'naive-ui';
import { $t } from '@/locales';
import type { Menu } from '@/views/system/menu/api';
import { translateTitle } from '@/views/system/menu/shared';
import type { Authority } from './api';

/* ---------------- 通用树工具（泛型） ---------------- */

/** 收集所有叶子节点 id */
export function collectLeafIds<T>(
  tree: T[],
  getId: (n: T) => number,
  getChildren: (n: T) => T[] | undefined
): number[] {
  const ids: number[] = [];
  const walk = (list: T[]) => {
    for (const n of list ?? []) {
      const children = getChildren(n);
      if (children?.length) walk(children);
      else ids.push(Number(getId(n)));
    }
  };
  walk(tree);
  return ids;
}

/** 收集 TreeOption 节点的所有叶子后代 key */
export function collectTreeLeafKeys(node: TreeOption): number[] {
  const keys: number[] = [];
  const walk = (n: TreeOption) => {
    const children = n.children as TreeOption[] | undefined;
    if (children?.length) {
      for (const c of children) walk(c);
    } else {
      keys.push(Number(n.key));
    }
  };
  walk(node);
  return keys;
}

/** 拍平树为一维数组，去除 children 嵌套 */
export function flattenTree<T>(tree: T[], getChildren: (n: T) => T[] | undefined): T[] {
  const out: T[] = [];
  const walk = (list: T[]) => {
    for (const n of list ?? []) {
      const children = getChildren(n);
      const { children: _omit, ...rest } = n as any;
      out.push(rest as T);
      if (children?.length) walk(children);
    }
  };
  walk(tree);
  return out;
}

/** 按 id 查找节点 */
export function findNodeById<T>(
  tree: T[],
  id: number,
  getId: (n: T) => number,
  getChildren: (n: T) => T[] | undefined
): T | null {
  for (const n of tree ?? []) {
    if (Number(getId(n)) === id) return n;
    const found = findNodeById(getChildren(n) ?? [], id, getId, getChildren);
    if (found) return found;
  }
  return null;
}

/** 收集 targetId 及其所有子孙 id（防循环引用） */
export function collectDisabledIds<T>(
  tree: T[],
  targetId: number,
  getId: (n: T) => number,
  getChildren: (n: T) => T[] | undefined
): Set<number> {
  const result = new Set<number>();
  const collectAll = (list: T[], acc: Set<number>) => {
    for (const n of list ?? []) {
      acc.add(Number(getId(n)));
      collectAll(getChildren(n) ?? [], acc);
    }
  };
  const walk = (list: T[]): boolean => {
    for (const n of list ?? []) {
      const id = Number(getId(n));
      if (id === targetId) {
        result.add(id);
        collectAll(getChildren(n) ?? [], result);
        return true;
      }
      if (walk(getChildren(n) ?? [])) return true;
    }
    return false;
  };
  walk(tree);
  return result;
}

/* ---------------- 角色树工具 ---------------- */

/** 角色树拍平为 { authorityId: authorityName } */
export function buildRoleNameMap(list: Authority[]): Record<number, string> {
  const map: Record<number, string> = {};
  const walk = (items: Authority[]) => {
    for (const it of items ?? []) {
      map[Number(it.authorityId) || 0] = it.authorityName ?? '';
      walk(it.children ?? []);
    }
  };
  walk(list);
  return map;
}

/** 构建父级角色树选项，disableIds 中的节点禁用 */
export function buildParentOptions(list: Authority[], disableIds: Set<number>): TreeSelectOption[] {
  return (list ?? []).map(item => {
    const id = Number(item.authorityId) || 0;
    const children = item.children?.length ? buildParentOptions(item.children, disableIds) : undefined;
    return {
      label: item.authorityName ?? '',
      value: id,
      disabled: disableIds.has(id),
      children
    };
  });
}

/** 收集角色树中目标节点及子孙 id */
export function collectRoleDisabledIds(list: Authority[], targetId: number): Set<number> {
  return collectDisabledIds(
    list,
    targetId,
    n => Number(n.authorityId),
    n => n.children ?? undefined
  );
}

/* ---------------- 数据范围 ---------------- */

/** 数据范围下拉选项 */
export const dataScopeOptions = () => [
  { label: $t('page.system.authority.allData'), value: 1 },
  { label: $t('page.system.authority.deptAndBelow'), value: 2 },
  { label: $t('page.system.authority.deptOnly'), value: 3 },
  { label: $t('page.system.authority.selfOnly'), value: 4 },
  { label: $t('page.system.authority.customDept'), value: 5 }
];

/** 数据范围标签颜色 */
export const dataScopeTagType = (value: number): 'success' | 'warning' | 'default' =>
  value === 1 ? 'success' : value === 5 ? 'warning' : 'default';

/* ---------------- 菜单树工具 ---------------- */

/** 菜单树转 TreeOption，label 经 i18n 转义 */
export function toMenuTreeOptions(menus: Menu[]): TreeOption[] {
  return (menus ?? []).map(m => ({
    key: m.ID,
    label: translateTitle(m.meta?.title) || m.name,
    children: m.children?.length ? toMenuTreeOptions(m.children) : undefined
  }));
}

/** 菜单树搜索过滤 */
export function filterMenuTree(menus: Menu[], k: string): TreeOption[] {
  return (menus ?? []).reduce<TreeOption[]>((acc, m) => {
    const label = (translateTitle(m.meta?.title) || m.name).toLowerCase();
    const children = m.children?.length ? filterMenuTree(m.children, k) : [];
    if (label.includes(k) || children.length > 0) {
      acc.push({
        key: m.ID,
        label: translateTitle(m.meta?.title) || m.name,
        children: children.length > 0 ? children : undefined
      });
    }
    return acc;
  }, []);
}

/** 收集菜单树所有叶子节点 ID */
export function collectMenuLeafIds(menus: Menu[]): number[] {
  return collectLeafIds(
    menus,
    n => Number(n.ID),
    n => n.children ?? undefined
  );
}

/** 按 ID 查找菜单 name */
export function findMenuNameById(menus: Menu[], id: number): string | null {
  const node = findNodeById(
    menus,
    id,
    n => Number(n.ID),
    n => n.children ?? undefined
  );
  return node?.name ?? null;
}

/** 菜单树拍平为一维数组 */
export function flattenMenuTree(menus: Menu[]): Menu[] {
  return flattenTree(menus, n => n.children ?? undefined);
}

/** 裁剪已勾选菜单树：保留勾选节点及其祖先路径 */
export function pruneMenuTree(menus: Menu[], checked: Set<number>): Menu[] {
  const out: Menu[] = [];
  for (const m of menus ?? []) {
    const childChecked = m.children?.length ? pruneMenuTree(m.children, checked) : [];
    if (checked.has(Number(m.ID))) {
      out.push({ ...m, children: childChecked.length ? childChecked : undefined });
    } else if (childChecked.length) {
      out.push({ ...m, children: childChecked });
    }
  }
  return out;
}
