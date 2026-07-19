import { request } from '@/service/request';
import type {
  ApiTokenListQuery,
  ApiTokenListResponse,
  ApiTokenForm,
  ApiTokenCreateResponse,
  ApiTokenUserOption
} from './types';
import { fetchGetUserList } from '@/views/system/user/api';

export type {
  ApiToken,
  ApiTokenListQuery,
  ApiTokenListResponse,
  ApiTokenForm,
  ApiTokenCreateResponse,
  ApiTokenUserOption,
  ApiTokenSearchParams
} from './types';

/** Get paginated API token list */
export function fetchGetApiTokenList(params?: ApiTokenListQuery) {
  return request<ApiTokenListResponse>({
    url: '/sysApiToken/getApiTokenList',
    method: 'post',
    data: params
  });
}

/** Issue (create) an API token */
export function fetchCreateApiToken(data: ApiTokenForm) {
  return request<ApiTokenCreateResponse>({
    url: '/sysApiToken/createApiToken',
    method: 'post',
    data
  });
}

/** Invalidate (delete) an API token */
export function fetchDeleteApiToken(id: number) {
  return request<void>({
    url: '/sysApiToken/deleteApiToken',
    method: 'post',
    data: { ID: id }
  });
}

/** Fetch users for the issue drawer (capped page) */
export async function fetchUserOptions() {
  const { data, error } = await fetchGetUserList({ page: 1, pageSize: 999 });
  if (error || !data) return [] as ApiTokenUserOption[];
  return data.list as ApiTokenUserOption[];
}
