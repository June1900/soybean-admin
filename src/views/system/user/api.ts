import { request } from '@/service/request';
import type { UserListQuery, UserListResponse, UserForm } from './types';

export type { User, UserListQuery, UserListResponse, UserForm, UserSearchParams } from './types';

/** Get paginated user list */
export function fetchGetUserList(params?: UserListQuery) {
  return request<UserListResponse>({
    url: '/user/getUserList',
    method: 'post',
    data: params
  });
}

/** Create user (register) */
export function fetchCreateUser(data: UserForm) {
  return request<void>({
    url: '/user/admin_register',
    method: 'post',
    data
  });
}

/** Update user info */
export function fetchUpdateUser(data: Partial<UserForm> & { ID: number }) {
  return request<void>({
    url: '/user/setUserInfo',
    method: 'put',
    data
  });
}

/** Delete a single user */
export function fetchDeleteUser(id: number) {
  return request<void>({
    url: '/user/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/** Batch delete users (gin-vue-admin uses single delete in loop, or batch if supported) */
export function fetchBatchDeleteUser(ids: number[]) {
  return Promise.all(ids.map(id => fetchDeleteUser(id))).then(() => ({ data: null, error: false }) as const);
}

/** Reset user password */
export function fetchResetPassword(data: { ID: number; password: string }) {
  return request<void>({
    url: '/user/resetPassword',
    method: 'post',
    data
  });
}

/** Set user roles (authorities) */
export function fetchSetUserAuthorities(data: { ID: number; authorityIds: number[] }) {
  return request<void>({
    url: '/user/setUserAuthorities',
    method: 'post',
    data
  });
}
