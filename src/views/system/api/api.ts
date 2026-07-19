import { request } from '@/service/request';
import type { ApiForm, ApiListQuery, ApiListResponse } from './types';

export type { Api, ApiForm, ApiListQuery, ApiListResponse, ApiSearchParams } from './types';

/** Get paginated api list. */
export function fetchGetApiList(params?: ApiListQuery) {
  return request<ApiListResponse>({
    url: '/api/getApiList',
    method: 'post',
    data: params
  });
}

/** Create an api. */
export function fetchCreateApi(data: ApiForm) {
  return request<void>({
    url: '/api/createApi',
    method: 'post',
    data
  });
}

/** Update an api. */
export function fetchUpdateApi(data: ApiForm & { ID: number }) {
  return request<void>({
    url: '/api/updateApi',
    method: 'post',
    data
  });
}

/** Delete an api by id. */
export function fetchDeleteApi(id: number) {
  return request<void>({
    url: '/api/deleteApi',
    method: 'post',
    data: { ID: id }
  });
}
