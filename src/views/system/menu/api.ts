import { request } from '@/service/request';
import type { Menu, MenuForm } from './types';

export type { Menu, MenuBtn, MenuForm } from './types';

export function fetchGetMenuList() {
  return request<Menu[]>({
    url: '/v2/menu/getMenuList',
    method: 'post'
  });
}

export function fetchCreateMenu(data: MenuForm) {
  return request<void>({
    url: '/v2/menu/addBaseMenu',
    method: 'post',
    data
  });
}

export function fetchUpdateMenu(data: MenuForm & { ID: number }) {
  return request<void>({
    url: '/v2/menu/updateBaseMenu',
    method: 'post',
    data
  });
}

export function fetchDeleteMenu(id: number) {
  return request<void>({
    url: '/v2/menu/deleteBaseMenu',
    method: 'post',
    data: { ID: id }
  });
}
