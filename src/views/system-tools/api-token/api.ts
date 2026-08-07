import { request } from '@/service/request';
import type { ApiTokenListQuery, ApiTokenListResponse, ApiTokenForm, ApiTokenCreateResponse } from './types';

export type {
  ApiToken,
  ApiTokenListQuery,
  ApiTokenListResponse,
  ApiTokenForm,
  ApiTokenCreateResponse,
  ApiTokenSearchParams
} from './types';

/**
 * 获取凭证分页列表
 * @param params
 */
export function fetchGetApiTokenList(params?: ApiTokenListQuery) {
  return request<ApiTokenListResponse>({
    url: '/sysApiToken/getApiTokenList',
    method: 'post',
    data: params
  });
}

/**
 * 签发凭证
 * @param data
 */
export function fetchCreateApiToken(data: ApiTokenForm) {
  return request<ApiTokenCreateResponse>({
    url: '/sysApiToken/createApiToken',
    method: 'post',
    data
  });
}

/**
 * 作废凭证
 * @param id
 */
export function fetchDeleteApiToken(id: number) {
  return request<void>({
    url: '/sysApiToken/deleteApiToken',
    method: 'post',
    data: { ID: id }
  });
}
