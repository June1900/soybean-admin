import { request } from '@/service/request';
import type { Menu } from '@/views/system/menu/api';
import type { Authority, AuthorityForm, AuthorityListQuery } from './types';

export type { Authority, AuthorityForm, AuthorityListQuery } from './types';

/** Get the full role tree (backend ignores pagination) */
export function fetchGetAuthorityList(params?: AuthorityListQuery) {
  return request<Authority[]>({
    url: '/authority/getAuthorityList',
    method: 'post',
    data: params
  });
}

/** Create role */
export function fetchCreateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/createAuthority',
    method: 'post',
    data
  });
}

/** Update role */
export function fetchUpdateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/updateAuthority',
    method: 'put',
    data
  });
}

/** Delete role (by authorityId) */
export function fetchDeleteAuthority(authorityId: string) {
  return request<void>({
    url: '/authority/deleteAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/** Copy role */
export function fetchCopyAuthority(data: {
  authorityId: string;
  authorityName: string;
  parentId: number;
  dataScope: number;
  oldAuthorityId: string;
}) {
  return request<void>({
    url: '/authority/copyAuthority',
    method: 'post',
    data
  });
}

/** 设置权限：获取角色菜单权限树与已勾选节点（gin-vue-admin 约定） */
export function fetchGetMenuAuthority(authorityId: string) {
  return request<{ menus: Menu[]; checkedKeys: number[] }>({
    url: '/menu/getMenuAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/** 设置权限：保存角色菜单权限 */
export function fetchUpdateMenuAuthority(authorityId: string, menuIds: number[]) {
  return request<void>({
    url: '/menu/updateMenuAuthority',
    method: 'post',
    data: { authorityId, menuIds }
  });
}

/** 分配给用户：保存角色分配的用户 */
export function fetchSetAuthorityUsers(authorityId: string, userIds: number[]) {
  return request<void>({
    url: '/authority/setAuthorityUsers',
    method: 'post',
    data: { authorityId, userIds }
  });
}
