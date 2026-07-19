import { request } from '@/service/request';
import type { ParamsForm, ParamsListQuery, ParamsListResponse } from './types';

export type { Params, ParamsForm, ParamsListQuery, ParamsListResponse, ParamsSearchParams } from './types';

/** Get paginated system params list. */
export function fetchGetParamsList(params?: ParamsListQuery) {
  return request<ParamsListResponse>({
    url: '/sysParams/getSysParamsList',
    method: 'get',
    params
  });
}

/** Create a system param. */
export function fetchCreateParams(data: ParamsForm) {
  return request<void>({
    url: '/sysParams/createSysParams',
    method: 'post',
    data
  });
}

/** Update a system param. */
export function fetchUpdateParams(data: ParamsForm & { ID: number }) {
  return request<void>({
    url: '/sysParams/updateSysParams',
    method: 'put',
    data
  });
}

/** Delete a system param by id. */
export function fetchDeleteParams(id: number) {
  return request<void>({
    url: '/sysParams/deleteSysParams',
    method: 'delete',
    params: { ID: id }
  });
}
