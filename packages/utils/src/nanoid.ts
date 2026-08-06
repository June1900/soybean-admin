import { customAlphabet, nanoid } from 'nanoid';

/**
 * 生成纯字母数字ID
 * @param {number} length 长度
 * @returns {string}
 */
export function createSafeNanoid(length: number = 10): string {
  const pool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return customAlphabet(pool, length)();
}

export { nanoid };
