import { $t } from '@/locales';
import type { Menu } from './api';

/**
 * 外链打开方式：借用 `component` 字段存储，与路由转换器 `transform-menu.ts` 的约定保持一致。
 *
 * - `layout.base$view.iframe-page`：项目内打开，由内置 iframe-page 视图承载
 * - `new_tab`：浏览器新标签打开，路由 meta.href 交给守卫 window.open
 */
export const EXTERNAL_OPEN_IFRAME = 'layout.base$view.iframe-page';
export const EXTERNAL_OPEN_NEW_TAB = 'new_tab';

/** 将 meta.title 中存储的 i18n key（如 route.home）转换为实际文案 */
export function translateTitle(title: string | undefined): string {
  if (!title) return '';
  return $t(title as any);
}

/** 菜单类型：优先使用 menuType 字段，回退到根据 children 判断 */
export function resolveMenuType(menu: Menu): 'directory' | 'menu' | 'link' {
  if (menu.menuType) return menu.menuType;
  return menu.children && menu.children.length > 0 ? 'directory' : 'menu';
}

/** 是否外链菜单：menuType 为 link，或 meta.href 已填写 */
export function isExternalLink(menu: Menu): boolean {
  return menu.menuType === 'link' || !!menu.meta?.href;
}

/** 菜单类型对应的 NTag 颜色类型（决定 tag 文字/背景颜色）：目录=info，外链=warning，菜单=success */
export function menuTypeTagType(menu: Menu): 'info' | 'warning' | 'success' {
  const type = resolveMenuType(menu);
  if (type === 'directory') return 'info';
  if (type === 'link') return 'warning';
  return 'success';
}

/** 是/否下拉选项（value: 1 = 是, 0 = 否） */
export const yesOrNoOptions = () => [
  { label: $t('common.yesOrNo.yes'), value: 1 },
  { label: $t('common.yesOrNo.no'), value: 0 }
];

/** 显示/隐藏下拉选项（value: 0 = 显示, 1 = 隐藏） */
export const showHiddenOptions = () => [
  { label: $t('page.system.menu.show'), value: 0 },
  { label: $t('page.system.menu.hidden'), value: 1 }
];

/** 菜单类型可选项：directory 目录 | menu 菜单 | link 外链 */
export const menuTypeOptions = () => [
  { label: $t('page.system.menu.typeDirectory'), value: 'directory' },
  { label: $t('page.system.menu.typeMenu'), value: 'menu' },
  { label: $t('page.system.menu.typeLink'), value: 'link' }
];

/** 布局方式可选项：label 为简短文案（单选按钮显示），完整描述见 tooltip */
export const layoutOptions = () => [
  { label: $t('page.system.menu.layoutBaseLabel'), value: 'layout.base' },
  { label: $t('page.system.menu.layoutBlankLabel'), value: 'layout.blank' }
];
