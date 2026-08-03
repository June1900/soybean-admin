/** Metadata of a menu item (nested under `meta`). */
export interface MenuMeta {
  title: string;
  icon: string;
  keepAlive: boolean;
  closeTab: boolean;
  defaultMenu: boolean;
  activeName?: string;
  transitionType?: string;
  /** 外链地址（menuType=link 时生效），路由生成时透传到路由的 meta.href，由路由守卫新窗口打开 */
  href?: string;
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
  /** 菜单类型：directory 目录 | menu 菜单 | link 外链 */
  menuType?: 'directory' | 'menu' | 'link';
  /** 布局方式：layout.base 默认布局 | layout.blank 空白布局 */
  layout?: string;
  meta: MenuMeta;
  /** nested children; `null` on leaf nodes in the gin-vue-admin response */
  children?: Menu[] | null;
  /** buttons bound to this menu (gin-vue-admin SysAuthorityBtn) */
  menuBtn?: MenuBtn[] | null;
  /** route parameters for this menu */
  parameters?: { ID?: number; type: string; key: string; value: string }[];
}

/** A button bound to a menu (gin-vue-admin SysAuthorityBtn). */
export interface MenuBtn {
  ID: number;
  name: string;
  desc: string;
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
  /** 菜单类型：directory 目录 | menu 菜单 | link 外链 */
  menuType?: 'directory' | 'menu' | 'link';
  /** 布局方式：layout.base 默认布局 | layout.blank 空白布局 */
  layout?: string;
  meta: MenuMeta;
}
