import type { FlatResponseData } from '@sa/axios';
import type { SystemConfig } from './types';

export type { SystemConfig } from './types';

/** UI-only：保存为本地 mock，不对接真实接口 */
function resolve<T>(data: T): FlatResponseData<any, T> {
  return { data, error: null } as unknown as FlatResponseData<any, T>;
}

export async function saveSystemConfig(_config: SystemConfig): Promise<FlatResponseData<any, null>> {
  return resolve(null);
}
