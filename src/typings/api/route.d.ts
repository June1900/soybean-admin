declare namespace Api {
  /**
   * namespace Route
   *
   * 后端路由/菜单相关接口（GVA `getMenu`）
   */
  namespace Route {
    /** GVA 菜单 meta 字段 */
    interface GvaMenuMeta {
      activeName: string;
      keepAlive: boolean;
      defaultMenu: boolean;
      title: string;
      icon: string;
      closeTab: boolean;
      transitionType: string;
    }

    /** GVA 菜单节点（后端 `getMenu` 返回结构） */
    interface GvaMenu {
      ID: number;
      CreatedAt: string;
      UpdatedAt: string;
      parentId: number;
      path: string;
      name: string;
      hidden: boolean;
      component: string;
      /** 菜单类型：directory=目录（仅分组，无自身页面），menu=菜单（叶子页面），link=外链 */
      menuType: 'directory' | 'menu' | 'link' | string;
      /** 布局标识："layout.base" / "layout.blank" */
      layout: string;
      sort: number;
      meta: GvaMenuMeta;
      authoritys: unknown | null;
      menuBtn: unknown | null;
      menuId: number;
      children: GvaMenu[] | null;
      parameters: unknown[];
      btns: unknown | null;
    }

    /** `getMenu` 返回结构 */
    interface GvaMenuResponse {
      menus: GvaMenu[];
    }
  }
}
