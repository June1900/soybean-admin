/** 状态码 → tag 类型 */
export function statusTagType(status: number): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'error';
  return 'default';
}
