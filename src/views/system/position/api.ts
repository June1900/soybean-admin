import { request } from '@/service/request';
import type { PositionForm, PositionListQuery, PositionListResponse } from './types';

export type { Position, PositionForm, PositionListQuery, PositionListResponse, PositionSearchParams } from './types';

/** 获取岗位分页列表 */
export function fetchGetPositionList(params?: PositionListQuery) {
  return request<PositionListResponse>({
    url: '/position/getPositionList',
    method: 'post',
    data: params
  });
}

/** 新增岗位 */
export function fetchCreatePosition(data: PositionForm) {
  return request<void>({
    url: '/position/createPosition',
    method: 'post',
    data
  });
}

/** 更新岗位 */
export function fetchUpdatePosition(data: PositionForm & { ID: number }) {
  return request<void>({
    url: '/position/updatePosition',
    method: 'put',
    data
  });
}

/** 删除岗位 */
export function fetchDeletePosition(id: number) {
  return request<void>({
    url: '/position/deletePosition',
    method: 'delete',
    data: { id }
  });
}

/** 获取岗位已分配的用户 ID 列表 */
export function fetchGetPositionUsers(positionId: number) {
  return request<number[]>({
    url: '/position/getPositionUsers',
    method: 'get',
    params: { positionId }
  });
}

/** 设置岗位关联的用户（保存成员关系） */
export function fetchSetPositionUsers(data: { positionId: number; userIds: number[] }) {
  return request<void>({
    url: '/position/setPositionUsers',
    method: 'post',
    data
  });
}
