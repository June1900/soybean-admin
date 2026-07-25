import { request } from '@/service/request';
import type { Menu, MenuBtn } from '@/views/system/menu/api';
import type { Authority, AuthorityApi, AuthorityApiPolicy, AuthorityForm, AuthorityListQuery } from './types';

export type { Authority, AuthorityApi, AuthorityApiPolicy, AuthorityForm, AuthorityListQuery } from './types';

/** 获取角色（权限）列表（POST /authority/getAuthorityList），后端返回完整树 */
export function fetchGetAuthorityList(params?: AuthorityListQuery) {
  return request<Authority[]>({
    url: '/authority/getAuthorityList',
    method: 'post',
    data: params
  });
}

/** 新增角色（POST /authority/createAuthority） */
export function fetchCreateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/createAuthority',
    method: 'post',
    data
  });
}

/** 编辑角色（PUT /authority/updateAuthority） */
export function fetchUpdateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/updateAuthority',
    method: 'put',
    data
  });
}

/** 删除角色（POST /authority/deleteAuthority，按 authorityId） */
export function fetchDeleteAuthority(authorityId: number) {
  return request<void>({
    url: '/authority/deleteAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/** 获取完整菜单树（POST /menu/getBaseMenuTree），用于「角色菜单」Tab */
export function fetchGetBaseMenuTree() {
  return request<{ menus: Menu[] }>({
    url: '/menu/getBaseMenuTree',
    method: 'post'
  });
}

/** 获取角色已授权菜单（POST /menu/getMenuAuthority），返回扁平列表 */
export function fetchGetMenuAuthority(authorityId: number) {
  return request<{ menus: (Menu & { menuId?: number })[] }>({
    url: '/menu/getMenuAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/**
 * 保存角色菜单权限（POST /menu/addMenuAuthority）。
 * 注意：上传「完整菜单对象数组」（每个菜单自带嵌套 children），而非仅 menuId 列表；
 * 后端据此重建角色菜单关系（gin-vue-admin 的 addMenuAuthority）。
 */
export function fetchAddMenuAuthority(authorityId: number, menus: Menu[]) {
  return request<void>({
    url: '/menu/addMenuAuthority',
    method: 'post',
    data: { authorityId, menus }
  });
}

/** 获取全部 API（POST /api/getAllApis），用于「角色 API」Tab */
export function fetchGetAllApis() {
  return request<{ apis: AuthorityApi[] }>({
    url: '/api/getAllApis',
    method: 'post'
  });
}

/** 获取角色已授权 API 策略（POST /casbin/getPolicyPathByAuthorityId） */
export function fetchGetPolicyPathByAuthorityId(authorityId: number) {
  return request<{ paths: AuthorityApiPolicy[] }>({
    url: '/casbin/getPolicyPathByAuthorityId',
    method: 'post',
    data: { authorityId }
  });
}

/** 保存角色 API 权限（POST /casbin/updateCasbin） */
export function fetchUpdateCasbin(authorityId: number, paths: AuthorityApiPolicy[]) {
  return request<void>({
    url: '/casbin/updateCasbin',
    method: 'post',
    data: { authorityId, casbinInfos: paths }
  });
}

/**
 * 获取角色在某菜单下已授权的按钮 ID 列表（POST /authorityBtn/getAuthorityBtn）。
 * 按钮全集取自菜单树的 `menuBtn`；已选 ID 由返回的 `selected` 提供。
 */
export function fetchGetAuthorityBtn(menuID: number, authorityId: number) {
  return request<{ selected: number[] }>({
    url: '/authorityBtn/getAuthorityBtn',
    method: 'post',
    data: { menuID, authorityId }
  });
}

/** 保存角色在某菜单下已授权的按钮（POST /authorityBtn/setAuthorityBtn） */
export function fetchSetAuthorityBtn(menuID: number, selected: number[], authorityId: number) {
  return request<void>({
    url: '/authorityBtn/setAuthorityBtn',
    method: 'post',
    data: { menuID, selected, authorityId }
  });
}

/** 获取角色已关联的用户 ID（GET /authority/getUsersByAuthority） */
export function fetchGetUsersByAuthority(authorityId: number) {
  return request<number[]>({
    url: '/authority/getUsersByAuthority',
    method: 'get',
    params: { authorityId }
  });
}

/** 保存角色分配的用户（POST /authority/setRoleUsers），全量覆盖 */
export function fetchSetRoleUsers(authorityId: number, userIds: number[]) {
  return request<void>({
    url: '/authority/setRoleUsers',
    method: 'post',
    data: { authorityId, userIds }
  });
}
