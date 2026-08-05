import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils/storage';
import messages from './locale';

const i18n = createI18n({
  locale: localStg.get('lang') || 'zh-CN',
  fallbackLocale: 'en',
  messages,
  legacy: false
});

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n);
}

export const $t = i18n.global.t as App.I18n.$T;

/**
 * Check whether the i18n message of the key exists in the **current** locale
 *
 * 后端下发的菜单 `meta.title` 可能是 i18n key（如 `route.system_user`），也可能是纯文本（如「用户管理」）。
 * 该方法用于在渲染前判断当前语言下能否被翻译，翻译不了时应回退原名称。
 *
 * @param key I18n key or raw text
 */
export function $te(key: string): boolean {
  if (!key) return false;

  const te = i18n.global.te as unknown as (k: string) => boolean;

  return te(key);
}

/**
 * Check whether the i18n message of the key exists in **any** loaded locale
 *
 * 用于决定是否记录 `meta.i18nKey`：只要有任一语言存在词条就记录，这样切换语言后可以重新翻译。
 *
 * @param key I18n key or raw text
 */
export function $teAnyLocale(key: string): boolean {
  if (!key) return false;

  const te = i18n.global.te as unknown as (k: string, locale?: string) => boolean;

  if (te(key)) return true;

  const locales = i18n.global.availableLocales as unknown as string[];

  return locales.some(locale => te(key, locale));
}

/**
 * Translate the i18n key, fallback to the raw text when the message does not exist in the current locale
 *
 * @param key I18n key or raw text
 */
export function $tOrRaw(key: string): string {
  return $te(key) ? $t(key as App.I18n.I18nKey) : key;
}

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;

  document?.querySelector('html')?.setAttribute('lang', locale);
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}
