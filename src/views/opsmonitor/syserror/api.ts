import { request } from '@/service/request';
import type { SysError, SysErrorListQuery, SysErrorListResponse } from './types';

export type {
  SysError,
  SysErrorLevel,
  SysErrorStatus,
  SysErrorListQuery,
  SysErrorListResponse,
  SysErrorSearchParams
} from './types';

/** 分页获取错误日志列表 */
export function fetchSysErrorList(params: SysErrorListQuery) {
  return request<SysErrorListResponse>({
    url: '/sysError/getSysErrorList',
    method: 'get',
    params
  });
}

/** 用 id 查询错误日志详情 */
export function findSysError(id: number) {
  return request<SysError>({
    url: '/sysError/findSysError',
    method: 'get',
    params: { ID: id }
  });
}

/** 删除单条错误日志 */
export function deleteSysError(id: number) {
  return request<void>({
    url: '/sysError/deleteSysError',
    method: 'delete',
    params: { ID: id }
  });
}

/** 批量删除错误日志 */
export function deleteSysErrorByIds(ids: number[]) {
  return request<void>({
    url: '/sysError/deleteSysErrorByIds',
    method: 'delete',
    data: { IDs: ids.map(id => String(id)) }
  });
}
