/** Metadata of a menu item (nested under `meta`). */
export interface MenuMeta {
  title: string;
  icon: string;
  keepAlive: boolean;
  closeTab: boolean;
  defaultMenu: boolean;
}

/** A menu item. `ID` is the primary key (uppercase, gin-vue-admin convention). */
export interface Menu {
  ID: number;
  path: string;
  name: string;
  component: string;
  parentId: number;
  sort: number;
  hidden: boolean;
  meta: MenuMeta;
  children?: Menu[];
}

/** Payload for creating / updating a menu. */
export interface MenuForm {
  ID?: number;
  path: string;
  name: string;
  component: string;
  parentId: number;
  sort: number;
  hidden: boolean;
  meta: MenuMeta;
}

/** Query params for getMenuList */
export interface MenuListQuery {
  page?: number;
  pageSize?: number;
}

/** Response of getMenuList */
export interface MenuListResponse {
  list: Menu[];
  total: number;
}

/** Frontend search form model for menu list */
export interface MenuSearchParams {
  title: string;
  name: string;
  component: string;
}
