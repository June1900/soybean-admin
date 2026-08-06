import { request } from '@/service/request';
import type { ApiForm, ApiGroupResponse, ApiListQuery, ApiListResponse } from './types';

export type { Api, ApiForm, ApiGroupResponse, ApiListQuery, ApiListResponse, ApiSearchParams } from './types';

// 分页获取接口列表
export function fetchGetApiList(params?: ApiListQuery) {
  return request<ApiListResponse>({
    url: '/api/getApiList',
    method: 'post',
    data: params
  });
}

// 新增接口
export function fetchCreateApi(data: ApiForm) {
  return request<void>({
    url: '/api/createApi',
    method: 'post',
    data
  });
}

// 更新接口
export function fetchUpdateApi(data: ApiForm & { ID: number }) {
  return request<void>({
    url: '/api/updateApi',
    method: 'post',
    data
  });
}

// 删除接口
export function fetchDeleteApi(id: number) {
  return request<void>({
    url: '/api/deleteApi',
    method: 'post',
    data: { ID: id }
  });
}

// 获取接口分组
export function fetchGetApiGroups() {
  return request<ApiGroupResponse>({
    url: '/api/getApiGroups',
    method: 'get'
  });
}

// 获取接口已分配的角色 ID
export function fetchGetApiRoles(path: string, method: string) {
  return request<number[]>({
    url: '/api/getApiRoles',
    method: 'get',
    params: { path, method }
  });
}

// 保存接口角色（全量覆盖）
export function fetchSetApiRoles(path: string, method: string, authorityIds: number[]) {
  return request<void>({
    url: '/api/setApiRoles',
    method: 'post',
    data: { path, method, authorityIds }
  });
}

// 刷新 Casbin 缓存
export function fetchFreshCasbin() {
  return request<void>({
    url: '/api/freshCasbin',
    method: 'get'
  });
}
