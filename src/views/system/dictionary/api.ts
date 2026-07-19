import { request } from '@/service/request';
import type {
  Dictionary,
  DictionaryDetail,
  DictionaryDetailForm,
  DictionaryDetailListQuery,
  DictionaryForm,
  DictionaryListQuery
} from './types';

export type {
  Dictionary,
  DictionaryDetail,
  DictionaryDetailForm,
  DictionaryDetailListQuery,
  DictionaryForm,
  DictionaryListQuery,
  DictionarySearchParams
} from './types';

/** Get the list of system dictionaries. */
export function fetchGetDictionaryList(params?: DictionaryListQuery) {
  return request<Dictionary[]>({
    url: '/sysDictionary/getSysDictionaryList',
    method: 'get',
    params
  });
}

/** Create a system dictionary. */
export function fetchCreateDictionary(data: DictionaryForm) {
  return request<void>({
    url: '/sysDictionary/createSysDictionary',
    method: 'post',
    data
  });
}

/** Update a system dictionary. */
export function fetchUpdateDictionary(data: DictionaryForm & { ID: number }) {
  return request<void>({
    url: '/sysDictionary/updateSysDictionary',
    method: 'put',
    data
  });
}

/** Delete a system dictionary by id. */
export function fetchDeleteDictionary(id: number) {
  return request<void>({
    url: '/sysDictionary/deleteSysDictionary',
    method: 'delete',
    params: { ID: id }
  });
}

/** Get the list of details for a dictionary. */
export function fetchGetDictionaryDetailList(params?: DictionaryDetailListQuery) {
  return request<DictionaryDetail[]>({
    url: '/sysDictionaryDetail/getSysDictionaryDetailList',
    method: 'get',
    params
  });
}

/** Create a dictionary detail. */
export function fetchCreateDictionaryDetail(data: DictionaryDetailForm) {
  return request<void>({
    url: '/sysDictionaryDetail/createSysDictionaryDetail',
    method: 'post',
    data
  });
}

/** Update a dictionary detail. */
export function fetchUpdateDictionaryDetail(data: DictionaryDetailForm & { ID: number }) {
  return request<void>({
    url: '/sysDictionaryDetail/updateSysDictionaryDetail',
    method: 'put',
    data
  });
}

/** Delete a dictionary detail by id. */
export function fetchDeleteDictionaryDetail(id: number) {
  return request<void>({
    url: '/sysDictionaryDetail/deleteSysDictionaryDetail',
    method: 'delete',
    params: { ID: id }
  });
}
