import type { FlatResponseData } from '@sa/axios';
import type { LoginLog, LoginLogListQuery, LoginLogListResponse } from './types';

export type { LoginLog, LoginLogListQuery, LoginLogListResponse, LoginLogSearchParams } from './types';

/** UI-only：本地 mock 数据，不对接真实接口 */
const browsers = [
  'Chrome 120 / Windows',
  'Safari 17 / macOS',
  'Firefox 121 / Linux',
  'Edge 120 / Windows',
  'Mobile Safari / iOS'
];
const mockLogs: LoginLog[] = Array.from({ length: 26 }).map((_, i) => {
  const ok = i % 4 !== 0;
  return {
    ID: i + 1,
    username: ['admin', 'zhangsan', 'lisi', 'wangwu', 'operator'][i % 5],
    ip: `192.168.1.${10 + (i % 240)}`,
    status: ok,
    errorMessage: ok ? '' : '密码错误次数过多，账号已锁定',
    agent: browsers[i % browsers.length],
    CreatedAt: new Date(Date.now() - i * 1_800_000).toISOString().slice(0, 19).replace('T', ' ')
  };
});

function resolve<T>(data: T): FlatResponseData<any, T> {
  return { data, error: null } as unknown as FlatResponseData<any, T>;
}

export async function fetchLoginLogList(
  params: LoginLogListQuery
): Promise<FlatResponseData<any, LoginLogListResponse>> {
  const filtered = mockLogs.filter(l => {
    if (params.username && !l.username.includes(params.username)) return false;
    if (params.status === 'success' && !l.status) return false;
    if (params.status === 'fail' && l.status) return false;
    return true;
  });
  const start = (params.page - 1) * params.pageSize;
  const list = filtered.slice(start, start + params.pageSize);
  return resolve({ list, total: filtered.length, page: params.page, pageSize: params.pageSize });
}

export async function deleteLoginLog(id: number): Promise<FlatResponseData<any, null>> {
  const idx = mockLogs.findIndex(l => l.ID === id);
  if (idx >= 0) mockLogs.splice(idx, 1);
  return resolve(null);
}
