import { request } from '@/service/request';
import type { PositionForm, PositionListQuery, PositionListResponse } from './types';

export type { Position, PositionForm, PositionListQuery, PositionListResponse, PositionSearchParams } from './types';

/** Get paginated position list. */
export function fetchGetPositionList(params?: PositionListQuery) {
  return request<PositionListResponse>({
    url: '/position/getPositionList',
    method: 'post',
    data: params
  });
}

/** Create a position. */
export function fetchCreatePosition(data: PositionForm) {
  return request<void>({
    url: '/position/createPosition',
    method: 'post',
    data
  });
}

/** Update a position. */
export function fetchUpdatePosition(data: PositionForm & { ID: number }) {
  return request<void>({
    url: '/position/updatePosition',
    method: 'put',
    data
  });
}

/** Delete a position by id. */
export function fetchDeletePosition(id: number) {
  return request<void>({
    url: '/position/deletePosition',
    method: 'delete',
    data: { id }
  });
}
