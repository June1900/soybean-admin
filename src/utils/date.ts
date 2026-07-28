import dayjs from 'dayjs';

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * 将日期格式化为指定格式，默认 `YYYY-MM-DD HH:mm:ss`。
 *
 * 支持传入日期字符串、时间戳（number）或 Date 对象。
 * 当入参为空（`''` / `null` / `undefined`）或无法解析为有效日期时，返回 '-'。
 *
 * @param value - 待格式化的日期。
 * @param format - 目标格式（dayjs 格式化串），默认 `YYYY-MM-DD HH:mm:ss`。
 *
 * @example
 *   formatDateTime('2026-07-28T09:18:34Z'); // '2026-07-28 09:18:34'
 *   formatDateTime('2026-07-28T09:18:34Z', 'YYYY-MM-DD'); // '2026-07-28'
 */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  format: string = DEFAULT_FORMAT
): string {
  if (value === '' || value === null || value === undefined) {
    return '-';
  }
  const d = dayjs(value);
  return d.isValid() ? d.format(format) : '-';
}
