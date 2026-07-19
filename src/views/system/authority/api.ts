import { request } from '@/service/request';
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
