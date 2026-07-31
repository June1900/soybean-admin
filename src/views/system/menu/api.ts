import { request } from '@/service/request';
import type { Menu, MenuBtn, MenuForm } from './types';

export type { Menu, MenuBtn, MenuForm } from './types';

/**
 * Get the full menu tree.
 *
 * gin-vue-admin returns `{ code, data: Menu[], msg }`; the `request` helper's
 * `transform` unwraps it to `response.data.data`, so the transformed payload is
 * the `Menu[]` tree (with `children` nested) directly.
 */
export function fetchGetMenuList() {
  return request<Menu[]>({
    url: '/v2/menu/getMenuList',
    method: 'post'
  });
}

/** Create a base menu. */
export function fetchCreateMenu(data: MenuForm) {
  return request<void>({
    url: '/v2/menu/addBaseMenu',
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
