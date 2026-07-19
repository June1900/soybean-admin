import { request } from '@/service/request';
import type { MenuForm, MenuListQuery, MenuListResponse } from './types';

export type { Menu, MenuForm, MenuListQuery, MenuListResponse, MenuSearchParams } from './types';

/** Get paginated menu list (flattened from the tree response). */
export function fetchGetMenuList(params?: MenuListQuery) {
  return request<MenuListResponse>({
    url: '/menu/getMenuList',
    method: 'post',
    data: params
  });
}

/** Create a base menu. */
export function fetchCreateMenu(data: MenuForm) {
  return request<void>({
    url: '/menu/addBaseMenu',
    method: 'post',
    data
  });
}

/** Update a base menu. */
export function fetchUpdateMenu(data: MenuForm & { ID: number }) {
  return request<void>({
    url: '/menu/updateBaseMenu',
    method: 'post',
    data
  });
}

/** Delete a menu by id. */
export function fetchDeleteMenu(id: number) {
  return request<void>({
    url: '/menu/deleteBaseMenu',
    method: 'post',
    data: { ID: id }
  });
}
