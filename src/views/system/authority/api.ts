import { request } from '@/service/request';
import type { Menu } from '@/views/system/menu/api';
import type { Authority, AuthorityApi, AuthorityApiPolicy, AuthorityForm, AuthorityListQuery } from './types';

export type { Authority, AuthorityApi, AuthorityApiPolicy, AuthorityForm, AuthorityListQuery } from './types';

/** 获取角色列表，后端返回完整树 */
export function fetchGetAuthorityList(params?: AuthorityListQuery) {
  return request<Authority[]>({
    url: '/authority/getAuthorityList',
    method: 'post',
    data: params
  });
}

/** 新增角色 */
export function fetchCreateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/createAuthority',
    method: 'post',
    data
  });
}

/** 编辑角色 */
export function fetchUpdateAuthority(data: AuthorityForm) {
  return request<void>({
    url: '/authority/updateAuthority',
    method: 'put',
    data
  });
}

/** 删除角色 */
export function fetchDeleteAuthority(authorityId: number) {
  return request<void>({
    url: '/authority/deleteAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/** 获取完整菜单树 */
export function fetchGetBaseMenuTree() {
  return request<{ menus: Menu[] }>({
    url: '/v2/menu/getBaseMenuTree',
    method: 'post'
  });
}

/** 获取角色已授权菜单（扁平列表） */
export function fetchGetMenuAuthority(authorityId: number) {
  return request<{ menus: (Menu & { menuId?: number })[] }>({
    url: '/v2/menu/getMenuAuthority',
    method: 'post',
    data: { authorityId }
  });
}

/** 保存角色菜单权限（上传完整菜单对象数组，非仅 menuId） */
export function fetchAddMenuAuthority(authorityId: number, menus: Menu[]) {
  return request<void>({
    url: '/v2/menu/addMenuAuthority',
    method: 'post',
    data: { authorityId, menus }
  });
}

/** 获取全部 API */
export function fetchGetAllApis() {
  return request<{ apis: AuthorityApi[] }>({
    url: '/api/getAllApis',
    method: 'post'
  });
}

/** 获取角色已授权 API 策略 */
export function fetchGetPolicyPathByAuthorityId(authorityId: number) {
  return request<{ paths: AuthorityApiPolicy[] }>({
    url: '/casbin/getPolicyPathByAuthorityId',
    method: 'post',
    data: { authorityId }
  });
}

/** 保存角色 API 权限 */
export function fetchUpdateCasbin(authorityId: number, paths: AuthorityApiPolicy[]) {
  return request<void>({
    url: '/casbin/updateCasbin',
    method: 'post',
    data: { authorityId, casbinInfos: paths }
  });
}

/** 获取角色在某菜单下已授权的按钮 ID */
export function fetchGetAuthorityBtn(menuID: number, authorityId: number) {
  return request<{ selected: number[] }>({
    url: '/authorityBtn/getAuthorityBtn',
    method: 'post',
    data: { menuID, authorityId, menuVersion: 'v2' }
  });
}

/** 保存角色在某菜单下已授权的按钮 */
export function fetchSetAuthorityBtn(menuID: number, selected: number[], authorityId: number) {
  return request<void>({
    url: '/authorityBtn/setAuthorityBtn',
    method: 'post',
    data: { menuID, selected, authorityId, menuVersion: 'v2' }
  });
}

/** 获取角色已关联的用户 ID */
export function fetchGetUsersByAuthority(authorityId: number) {
  return request<number[]>({
    url: '/authority/getUsersByAuthority',
    method: 'get',
    params: { authorityId }
  });
}

/** 保存角色分配的用户（全量覆盖） */
export function fetchSetRoleUsers(authorityId: number, userIds: number[]) {
  return request<void>({
    url: '/authority/setRoleUsers',
    method: 'post',
    data: { authorityId, userIds }
  });
}
