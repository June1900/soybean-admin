import { request } from '@/service/request';
import type { DepartmentForm, DepartmentListQuery, DepartmentListResponse } from './types';

export type { Department, DepartmentForm, DepartmentListQuery, DepartmentListResponse, DepartmentSearchParams } from './types';

/** Get paginated department list. */
export function fetchGetDepartmentList(params?: DepartmentListQuery) {
  return request<DepartmentListResponse>({
    url: '/department/getDepartmentList',
    method: 'post',
    data: params
  });
}

/** Create a department. */
export function fetchCreateDepartment(data: DepartmentForm) {
  return request<void>({
    url: '/department/createDepartment',
    method: 'post',
    data
  });
}

/** Update a department. */
export function fetchUpdateDepartment(data: DepartmentForm & { ID: number }) {
  return request<void>({
    url: '/department/updateDepartment',
    method: 'put',
    data
  });
}

/** Delete a department by id. */
export function fetchDeleteDepartment(id: number) {
  return request<void>({
    url: '/department/deleteDepartment',
    method: 'delete',
    data: { id }
  });
}
