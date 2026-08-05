import type { RouteComponent } from 'vue-router';
import type { ElegantConstRoute } from '@elegant-router/types';
import Placeholder from '@/components/common/route-placeholder.vue';
import { $tOrRaw, $teAnyLocale } from '@/locales';

/**
 * GVA（gin-vue-admin）`getMenu` 返回的菜单结构转换器。
 *
 * 把后端下发的 GVA 菜单树转换成 soybean-admin 的 `ElegantConstRoute[]`，
 * 从而复用项目既有的菜单生成 / 缓存 / 面包屑等流水线。
 *
 * 真实后端约定（与本项目 `src/views` 目录结构一致）：
 * - 菜单节点含 `menuType`：`directory`=纯目录（仅分组，无自身页面）、`menu`=叶子页面、`link`=外链。
 * - `layout` 字段给出布局标识（`layout.base` / `layout.blank`，见菜单管理页 `layoutOptions`），
 *   目录节点用其作为 `component`；叶子节点用 `${layout}$view.${name}` 组合（name 与 elegant 视图 key 一致）。
 * - `path` 直接对应 `src/views` 下的文件夹结构（`/system/user` -> `views/system/user/index.vue`），
 *   视图文件通过 `import.meta.glob` 按 path 解析，解析不到时回退占位组件避免白屏。
 * - `meta.title` 可能是 i18n key（如 `route.system_user`），也可能是后端直接下发的纯文本（如「用户管理」）。
 *   命中词条时写入 `meta.i18nKey` 并由 `$t` 渲染（支持切换语言实时刷新）；命中不到则原样使用该名称。
 * - 外链（`menuType=link`，`path` 存外链地址）按 `component` 区分打开方式（见菜单管理页「是否项目内打开」）：
 *   `new_tab`=浏览器新标签打开（写入 `meta.href`，由路由守卫 `window.open`）；
 *   其余（默认 `layout.base$view.iframe-page`）=项目内打开，用内置 `iframe-page` 视图承载，url 经静态 props 传入。
 */

type GvaMenu = Api.Route.GvaMenu;

interface LeafInfo {
  key: string;
  path: string;
  hidden: boolean;
  external: boolean;
  defaultMenu: boolean;
}

export interface GvaTransformResult {
  /** 转换后的路由（ElegantConstRoute 结构） */
  routes: ElegantConstRoute[];
  /** 首页路由（key + path），用于设置 root 重定向 */
  home: { key: string; path: string };
  /** 动态视图组件表：key -> 懒加载器，合并进静态 views 映射 */
  dynamicViews: Record<string, () => Promise<{ default: RouteComponent }>>;
}

const viewModules = import.meta.glob('@/views/**/*.vue') as Record<string, () => Promise<{ default: RouteComponent }>>;

// 归一化 glob key，兼容 `@/views/...`、`/src/views/...`、`src/views/...` 等多种形态
const viewModuleMap = new Map<string, () => Promise<{ default: RouteComponent }>>();
for (const [rawKey, loader] of Object.entries(viewModules)) {
  const normalized = rawKey
    .replace(/^@\//, 'src/')
    .replace(/^\/?src\//, '')
    .replace(/^\//, '');
  viewModuleMap.set(normalized, loader);
}

/** 按菜单 path 解析真实视图组件（如 /system/user -> views/system/user/index.vue） */
function resolveViewByPath(path: string): (() => Promise<{ default: RouteComponent }>) | null {
  const segs = path.replace(/^\//, '').split('/').filter(Boolean);
  if (segs.length === 0) return null;

  const base = `views/${segs.join('/')}`;
  const candidates = [`${base}/index.vue`, `${base}.vue`];

  for (const candidate of candidates) {
    const loader = viewModuleMap.get(candidate);
    if (loader) return loader;
  }

  return null;
}

/** 归一化布局标识：确保形如 `layout.base` / `layout.blank` */
function normalizeLayout(layout?: string): string {
  if (!layout) return 'layout.base';
  return layout.startsWith('layout.') ? layout : `layout.${layout}`;
}

function sanitizeKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * 顶级外链（无父目录）专用路由名：必须**不含下划线 `_`**。
 *
 * elegant 的 `transformElegantRoutesToVueRoutes` 用 `_` 作为路由名层级分隔符，
 * `isFirstLevelRoute` 据此判断是否“顶级单路由”。顶级单路由的 component 是 `layout$view` 形式，
 * 对“项目内打开”的顶级外链即 `layout.base$view.iframe-page`。
 *
 * 若该路由名含 `_`，transform 会误判为“仅布局路由”，从而**丢弃 iframe 视图**，
 * 导致内嵌区域空白、页面无法操作。故顶级外链强制生成无 `_` 且基于域名唯一的名字。
 *
 * 挂在目录下的外链则必须含 `_`（由父 key 拼接），以便 transform 按 `view.iframe-page`
 * 正常解析视图。
 */
function buildExternalRouteName(node: GvaMenu, externalUrl: string): string {
  const base = sanitizeKey(node.name || node.path || String(node.ID)).replace(/_/g, '-');

  let hostPart = '';
  try {
    hostPart = new URL(externalUrl).host;
  } catch {
    hostPart = '';
  }
  const host = hostPart ? `-${sanitizeKey(hostPart).replace(/_/g, '-')}` : '';

  return `${base}${host}`;
}

function buildPath(parentPath: string | null, segment: string): string {
  if (/^https?:/i.test(segment)) return segment;
  // GVA 子菜单的 path 为绝对路径（如 /system/user），直接使用；非绝对时才基于父路径拼接
  if (segment.startsWith('/')) return segment;
  const clean = segment.replace(/^\//, '');
  return parentPath ? `${parentPath.replace(/\/$/, '')}/${clean}` : `/${clean}`;
}

/**
 * 外链「浏览器新标签打开」的 component 标识。
 *
 * 与菜单管理页 `menu-operate-drawer.vue` 的 `openInProjectOptions` 保持一致：
 * 「是」-> `layout.base$view.iframe-page`（项目内嵌打开），「否」-> `new_tab`（新标签打开）。
 */
const EXTERNAL_NEW_TAB = 'new_tab';

/** 是否为外链节点：`menuType=link` 时 path 存的就是外链地址（见菜单管理页 `validateExternalLink`） */
function isExternal(node: GvaMenu): boolean {
  return node.menuType === 'link' || /^https?:/i.test(node.path || '') || /^https?:/i.test(node.component || '');
}

/** 外链是否在浏览器新标签打开（否则在项目内用 iframe-page 承载） */
function isOpenInNewTab(node: GvaMenu): boolean {
  return node.component === EXTERNAL_NEW_TAB;
}

/** 是否为纯目录节点（仅分组、无自身页面） */
function isDirectory(node: GvaMenu): boolean {
  return node.menuType === 'directory';
}

export function transformGvaMenus(menus: GvaMenu[]): GvaTransformResult {
  const dynamicViews: Record<string, () => Promise<{ default: RouteComponent }>> = {};
  const leafInfos: LeafInfo[] = [];

  function transformNode(node: GvaMenu, parentPath: string | null, parentKey: string | null): ElegantConstRoute[] {
    const external = isExternal(node);
    const externalUrl = external ? node.path || node.component : '';
    const newTab = external && isOpenInNewTab(node);

    // 外链路径仅用于生成唯一路由记录：新标签打开的路由会被守卫拦截（不渲染），
    // 项目内打开的则由 iframe-page 承载，url 通过静态 props 传入。
    let path: string;
    if (external) {
      path = newTab ? `/external-link/${sanitizeKey(externalUrl)}` : `/iframe-page/${encodeURIComponent(externalUrl)}`;
    } else {
      path = buildPath(parentPath, node.path || node.name || String(node.ID));
    }

    // 路由 key：后端 name 经清洗后作为优雅路由名（嵌套叶子名可含 `_`，与 elegant 层级约定一致）。
    // 外链命名需分场景：
    // - 顶级外链（无父目录）：component 为 `layout.base$view.iframe-page`（首层单路由形式），
    //   名字必须不含 `_`，否则 transform 会误判为“仅布局路由”而丢弃 iframe 视图。
    // - 挂在目录下的外链：component 为 `view.iframe-page`，名字必须含 `_`（与父 key 拼接），
    //   否则 transform 会把它当首层单路由按 `layout$view` 解析，导致“Layout component 'view.iframe-page' not found”。
    const key = external
      ? parentKey
        ? `${parentKey}_${sanitizeKey(node.name || node.path || String(node.ID))}`
        : buildExternalRouteName(node, externalUrl)
      : sanitizeKey(node.name || node.path || String(node.ID));

    // 菜单名称：后端 `meta.title` 可能是 i18n key（`route.system_user`），也可能是纯文本（「用户管理」）。
    // 能在词条表中命中就交给 i18n（并写入 i18nKey，切换语言时可自动重算）；命中不到则原样使用后端下发的名称。
    const rawTitle = node.meta?.title || node.name || node.path || '';
    // 任一语言存在词条即记录 i18nKey，保证切换语言时能重新翻译；当前语言翻不出来时 title 已是原名称
    const translatable = $teAnyLocale(rawTitle);

    const meta: Record<string, unknown> = {
      title: $tOrRaw(rawTitle),
      icon: node.meta?.icon || '',
      keepAlive: Boolean(node.meta?.keepAlive),
      order: node.sort ?? 0,
      hideInMenu: Boolean(node.hidden),
      // 保留原始 component 信息，供占位页提示
      realComponent: node.component
    };
    // 仅在词条真实存在时写入 i18nKey，否则各消费点（菜单/页签/面包屑/文档标题）会回退到 title 原名称
    if (translatable) meta.i18nKey = rawTitle;
    if (node.meta?.activeName) meta.activeMenu = node.meta.activeName;

    // 记录叶子信息，用于首页推导与外链判断
    const hasChildren = Boolean(node.children?.length);
    if (!hasChildren) {
      leafInfos.push({
        key,
        path,
        hidden: Boolean(node.hidden),
        external,
        defaultMenu: Boolean(node.meta?.defaultMenu)
      });
    }

    // 外链：统一复用内置 iframe-page 视图承载
    // - 新标签打开：写入 meta.href，路由守卫会拦截导航并 window.open（此路由不会真正渲染）
    // - 项目内打开：不写 meta.href（否则会被守卫拦截），url 通过静态 props 传给 iframe-page
    if (external) {
      if (newTab) {
        meta.href = externalUrl;
      }

      // 与叶子菜单一致：挂在目录下时继承父布局，避免布局嵌套
      const iframeComponent = parentKey ? 'view.iframe-page' : `${normalizeLayout(node.layout)}$view.iframe-page`;

      return [
        {
          name: key as never,
          path,
          component: iframeComponent,
          props: { url: externalUrl },
          meta: meta as never
        } as ElegantConstRoute
      ];
    }

    // 目录节点：仅作分组容器，component 用 layout，递归处理子节点
    if (isDirectory(node)) {
      const layout = normalizeLayout(node.layout);
      const childRoutes = (node.children ?? []).flatMap(child => transformNode(child, path, key));

      return [
        {
          name: key as never,
          path,
          component: layout,
          meta: meta as never,
          children: childRoutes
        } as ElegantConstRoute
      ];
    }

    // 叶子菜单：解析视图（按 path），用 name 作为 elegant 视图 key
    const viewKey = node.name || sanitizeKey(path);
    const loader = resolveViewByPath(node.path || '');
    const layout = normalizeLayout(node.layout);

    const resolvedLoader =
      loader ??
      (() => {
        console.warn(`[gva-menu] 未匹配到视图文件，使用占位页：`, node.path, node.component);
        return Promise.resolve({ default: Placeholder });
      });

    dynamicViews[viewKey] = resolvedLoader;

    // 有父目录时继承父布局（view.xxx）；顶级叶子自带布局（layout.base$view.xxx）
    const component = parentKey ? `view.${viewKey}` : `${layout}$view.${viewKey}`;

    const route: ElegantConstRoute = {
      name: key as never,
      path,
      component,
      meta: meta as never,
      ...(path.includes(':') ? { props: true } : {})
    } as ElegantConstRoute;

    return [route];
  }

  const routes = menus.flatMap(menu => transformNode(menu, null, null));

  // 首页推导：优先 defaultMenu，其次第一个可见非外链叶子
  const defaultLeaf = leafInfos.find(l => l.defaultMenu && !l.hidden && !l.external);
  const firstLeaf = leafInfos.find(l => !l.hidden && !l.external);
  const home = defaultLeaf ?? firstLeaf ?? { key: 'home', path: '/home' };

  return {
    routes,
    home,
    dynamicViews
  };
}
