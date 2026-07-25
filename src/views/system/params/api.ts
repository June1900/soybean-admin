import { request } from '@/service/request';
import type { ParamsForm, ParamsListQuery, ParamsListResponse } from './types';

export type { Params, ParamsForm, ParamsListQuery, ParamsListResponse, ParamsSearchParams } from './types';

/** 分页查询系统参数列表 */
export function fetchGetParamsList(params?: ParamsListQuery) {
  return request<ParamsListResponse>({
    url: '/sysParams/getSysParamsList',
    method: 'get',
    params
  });
}

/** 新增系统参数 */
export function fetchCreateParams(data: ParamsForm) {
  return request<void>({
    url: '/sysParams/createSysParams',
    method: 'post',
    data
  });
}

/** 更新系统参数 */
export function fetchUpdateParams(data: ParamsForm & { ID: number }) {
  return request<void>({
    url: '/sysParams/updateSysParams',
    method: 'put',
    data
  });
}

/** 删除系统参数 */
export function fetchDeleteParams(id: number) {
  return request<void>({
    url: '/sysParams/deleteSysParams',
    method: 'delete',
    params: { ID: id }
  });
}
