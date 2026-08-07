import { request } from '@/service/request';
import type { LoginLogListQuery, LoginLogListResponse } from './types';

export type { LoginLog, LoginLogListQuery, LoginLogListResponse, LoginLogSearchParams } from './types';

/**
 * 获取登录日志分页列表
 * @param params
 */
export function fetchLoginLogList(params: LoginLogListQuery) {
  return request<LoginLogListResponse>({
    url: '/sysLoginLog/getLoginLogList',
    method: 'get',
    params
  });
}

/**
 * 删除单条登录日志
 * @param id
 */
export function deleteLoginLog(id: number) {
  return request<void>({
    url: '/sysLoginLog/deleteLoginLog',
    method: 'delete',
    data: { ID: id }
  });
}

/**
 * 批量删除登录日志
 * @param ids
 */
export function deleteLoginLogByIds(ids: number[]) {
  return request<void>({
    url: '/sysLoginLog/deleteLoginLogByIds',
    method: 'delete',
    data: { ids }
  });
}
