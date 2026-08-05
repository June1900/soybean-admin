import { $t } from '@/locales';

// 校验外链地址：必填，且必须以 http:// 或 https:// 开头
export function validateExternalLink(_rule: unknown, value: unknown): boolean | Error {
  const url = ((value as string) || '').trim();
  if (!url) return new Error($t('page.system.menu.linkRequired'));
  if (!/^https?:\/\/.+/.test(url)) return new Error($t('page.system.menu.linkFormatInvalid'));
  return true;
}
