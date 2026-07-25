import { request } from '@/service/request';
import type {
  DictionaryDetailForm,
  DictionaryDetailListQuery,
  DictionaryDetailTreeResponse,
  DictionaryForm,
  DictionaryPageQuery,
  DictionaryPageResponse
} from './types';

export type {
  Dictionary,
  DictionaryDetail,
  DictionaryDetailForm,
  DictionaryDetailListQuery,
  DictionaryDetailTreeResponse,
  DictionaryForm,
  DictionaryPageQuery,
  DictionaryPageResponse,
  DictionarySearchParams
} from './types';

/** 分页查询系统字典 */
export function fetchGetDictionaryPage(params?: DictionaryPageQuery) {
  return request<DictionaryPageResponse>({
    url: '/sysDictionary/getSysDictionaryPage',
    method: 'get',
    params
  });
}

/** 新增字典 */
export function fetchCreateDictionary(data: DictionaryForm) {
  return request<void>({
    url: '/sysDictionary/createSysDictionary',
    method: 'post',
    data
  });
}

/** 修改字典 */
export function fetchUpdateDictionary(data: DictionaryForm & { ID: number }) {
  return request<void>({
    url: '/sysDictionary/updateSysDictionary',
    method: 'put',
    data
  });
}

/** 删除字典 */
export function fetchDeleteDictionary(id: number) {
  return request<void>({
    url: '/sysDictionary/deleteSysDictionary',
    method: 'delete',
    data: { ID: id }
  });
}

/** 获取字典项树形列表 */
export function fetchGetDictionaryDetailList(params?: DictionaryDetailListQuery) {
  return request<DictionaryDetailTreeResponse>({
    url: '/sysDictionaryDetail/getDictionaryTreeList',
    method: 'get',
    params
  });
}

/** 新增字典项 */
export function fetchCreateDictionaryDetail(data: DictionaryDetailForm) {
  return request<void>({
    url: '/sysDictionaryDetail/createSysDictionaryDetail',
    method: 'post',
    data
  });
}

/** 修改字典项 */
export function fetchUpdateDictionaryDetail(data: DictionaryDetailForm & { ID: number }) {
  return request<void>({
    url: '/sysDictionaryDetail/updateSysDictionaryDetail',
    method: 'put',
    data
  });
}

/** 删除字典项 */
export function fetchDeleteDictionaryDetail(id: number) {
  return request<void>({
    url: '/sysDictionaryDetail/deleteSysDictionaryDetail',
    method: 'delete',
    data: { ID: id }
  });
}
