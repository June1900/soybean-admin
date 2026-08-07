import { request } from '@/service/request';
import type { OperationRecordListQuery, OperationRecordListResponse } from './types';

export type {
  OperationRecord,
  OperationRecordUser,
  OperationRecordListQuery,
  OperationRecordListResponse,
  OperationRecordSearchParams
} from './types';

/**
 * 分页获取操作历史列表
 * @param params
 */
export function fetchOperationRecordList(params: OperationRecordListQuery) {
  return request<OperationRecordListResponse>({
    url: '/sysOperationRecord/getSysOperationRecordList',
    method: 'get',
    params
  });
}

/**
 * 删除单条操作记录
 * @param id
 */
export function deleteOperationRecord(id: number) {
  return request<void>({
    url: '/sysOperationRecord/deleteSysOperationRecord',
    method: 'delete',
    data: { ID: id }
  });
}

/**
 * 批量删除操作记录
 * @param ids
 */
export function deleteOperationRecordByIds(ids: number[]) {
  return request<void>({
    url: '/sysOperationRecord/deleteSysOperationRecordByIds',
    method: 'delete',
    data: { ids: ids }
  });
}
