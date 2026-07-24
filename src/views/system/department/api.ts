import { request } from '@/service/request';
import type { DepartmentListResponse, DepartmentSubmitForm } from './types';

export type {
  Department,
  DepartmentForm,
  DepartmentListResponse,
  DepartmentSearchParams,
  DepartmentStatusFilter,
  DepartmentSubmitForm
} from './types';

export function fetchGetDepartmentList() {
  return request<DepartmentListResponse>({
    url: '/department/getDepartmentList',
    method: 'post',
    data: {}
  });
}

export function fetchCreateDepartment(data: DepartmentSubmitForm) {
  return request<void>({
    url: '/department/createDepartment',
    method: 'post',
    data
  });
}

export function fetchUpdateDepartment(data: DepartmentSubmitForm & { ID: number }) {
  return request<void>({
    url: '/department/updateDepartment',
    method: 'put',
    data
  });
}

export function fetchDeleteDepartment(id: number) {
  return request<void>({
    url: '/department/deleteDepartment',
    method: 'delete',
    data: { id }
  });
}
