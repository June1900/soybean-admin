import { request } from '@/service/request';
import type { UserListQuery, UserListResponse, UserForm } from './types';

export type { User, UserListQuery, UserListResponse, UserForm, UserSearchParams } from './types';

/** 获取分页用户列表 */
export function fetchGetUserList(params?: UserListQuery) {
  return request<UserListResponse>({
    url: '/user/getUserList',
    method: 'post',
    data: params
  });
}

/** 创建用户（注册） */
export function fetchCreateUser(data: UserForm) {
  return request<void>({
    url: '/user/admin_register',
    method: 'post',
    data
  });
}

/** 更新用户信息 */
export function fetchUpdateUser(data: Partial<UserForm> & { ID: number }) {
  return request<void>({
    url: '/user/setUserInfo',
    method: 'put',
    data
  });
}

/** 删除单个用户 */
export function fetchDeleteUser(id: number) {
  return request<void>({
    url: '/user/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/** 批量删除用户（gin-vue-admin 采用循环单删，若后端支持批量则批量） */
export async function fetchBatchDeleteUser(ids: number[]) {
  await Promise.all(ids.map(id => fetchDeleteUser(id)));
  return { data: null, error: false } as const;
}

/** 重置用户密码 */
export function fetchResetPassword(data: { ID: number; password: string }) {
  return request<void>({
    url: '/user/resetPassword',
    method: 'post',
    data,
    isEncrypt: true
  });
}

/** 设置用户角色权限 */
export function fetchSetUserAuthorities(data: { ID: number; authorityIds: number[] }) {
  return request<void>({
    url: '/user/setUserAuthorities',
    method: 'post',
    data
  });
}

/** 设置用户部门 */
export function fetchSetUserDepartments(data: { ID: number; deptIds: number[]; primaryDeptId: number }) {
  return request<void>({
    url: '/user/setUserDepartments',
    method: 'post',
    data
  });
}

/** 设置用户岗位 */
export function fetchSetUserPositions(data: { ID: number; positionIds: number[] }) {
  return request<void>({
    url: '/user/setUserPositions',
    method: 'post',
    data
  });
}
