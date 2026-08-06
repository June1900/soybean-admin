import { request } from '@/service/request';
import type { UserListQuery, UserListResponse, UserForm } from './types';

export type { User, UserListQuery, UserListResponse, UserForm, UserSearchParams } from './types';

/**
 * 获取分页用户列表
 * @param params
 */
export function fetchGetUserList(params?: UserListQuery) {
  return request<UserListResponse>({
    url: '/user/getUserList',
    method: 'post',
    data: params
  });
}

/**
 * 创建用户（注册）
 * @param data
 */
export function fetchCreateUser(data: UserForm) {
  return request<void>({
    url: '/user/admin_register',
    method: 'post',
    data
  });
}

/**
 * 更新用户信息
 * @param data
 */
export function fetchUpdateUser(data: Partial<UserForm> & { ID: number }) {
  return request<void>({
    url: '/user/setUserInfo',
    method: 'put',
    data
  });
}

/**
 * 删除单个用户
 * @param id
 */
export function fetchDeleteUser(id: number) {
  return request<void>({
    url: '/user/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/**
 * 批量删除用户（gin-vue-admin 采用循环单删，若后端支持批量则批量）
 * @param ids
 */
export async function fetchBatchDeleteUser(ids: number[]) {
  await Promise.all(ids.map(id => fetchDeleteUser(id)));
  return { data: null, error: false } as const;
}

/**
 * 重置用户密码
 * @param data
 */
export function fetchResetPassword(data: { ID: number; password: string }) {
  return request<void>({
    url: '/user/resetPassword',
    method: 'post',
    data,
    isEncrypt: true
  });
}

/**
 * 修改密码（当前登录用户，ID 由后端从 JWT 提取，传输加密）
 * @param data
 */
export function fetchChangePassword(data: { password: string; newPassword: string }) {
  return request<void>({
    url: '/user/changePassword',
    method: 'post',
    data,
    isEncrypt: true
  });
}

/**
 * 设置用户角色权限
 * @param data
 */
export function fetchSetUserAuthorities(data: { ID: number; authorityIds: number[] }) {
  return request<void>({
    url: '/user/setUserAuthorities',
    method: 'post',
    data
  });
}

/**
 * 设置用户部门
 * @param data
 */
export function fetchSetUserDepartments(data: { ID: number; deptIds: number[]; primaryDeptId: number }) {
  return request<void>({
    url: '/user/setUserDepartments',
    method: 'post',
    data
  });
}

/**
 * 设置用户岗位
 * @param data
 */
export function fetchSetUserPositions(data: { ID: number; positionIds: number[] }) {
  return request<void>({
    url: '/user/setUserPositions',
    method: 'post',
    data
  });
}
