import { request } from '@/service/request';
import type { LoginLogListQuery, LoginLogListResponse } from './types';

export type { LoginLog, LoginLogListQuery, LoginLogListResponse, LoginLogSearchParams } from './types';

/** 获取登录日志分页列表 */
export function fetchLoginLogList(params: LoginLogListQuery) {
  return request<LoginLogListResponse>({
    url: '/sysLoginLog/getLoginLogList',
    method: 'get',
    params
  });
}

/** 删除单条登录日志 */
export function deleteLoginLog(id: number) {
  return request<void>({
    url: '/sysLoginLog/deleteLoginLog',
    method: 'delete',
    data: { ID: id }
  });
}

/** 批量删除登录日志 */
export function deleteLoginLogByIds(ids: number[]) {
  return request<void>({
    url: '/sysLoginLog/deleteLoginLogByIds',
    method: 'delete',
    data: { ids }
  });
}
