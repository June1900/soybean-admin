import type { FlatResponseData } from '@sa/axios';
import type { SysError, SysErrorListQuery, SysErrorListResponse } from './types';

export type {
  SysError,
  SysErrorLevel,
  SysErrorStatus,
  SysErrorListQuery,
  SysErrorListResponse,
  SysErrorSearchParams
} from './types';

/** UI-only：本地 mock 数据，不对接真实接口 */
const mockErrors: SysError[] = Array.from({ length: 18 }).map((_, i) => ({
  ID: i + 1,
  CreatedAt: new Date(Date.now() - i * 3_600_000).toISOString().slice(0, 19).replace('T', ' '),
  form: ['user.go:120', 'menu.go:88', 'auth.go:55', 'cron.go:200'][i % 4],
  level: i % 3 === 0 ? 'fatal' : 'error',
  status: (['pending', 'processing', 'done', 'failed'] as const)[i % 4],
  info: `runtime error: index out of range [${i}] with length ${Math.max(1, 10 - i)} (mock #${i + 1})`,
  solution: i % 2 === 0 ? '请检查数组边界并增加空值保护。' : ''
}));

function resolve<T>(data: T): FlatResponseData<any, T> {
  return { data, error: null } as unknown as FlatResponseData<any, T>;
}

export async function fetchSysErrorList(
  params: SysErrorListQuery
): Promise<FlatResponseData<any, SysErrorListResponse>> {
  const filtered = mockErrors.filter(e => {
    if (params.form && !e.form.includes(params.form)) return false;
    if (params.info && !e.info.includes(params.info)) return false;
    return true;
  });
  const start = (params.page - 1) * params.pageSize;
  const list = filtered.slice(start, start + params.pageSize);
  return resolve({ list, total: filtered.length, page: params.page, pageSize: params.pageSize });
}

export async function deleteSysError(id: number): Promise<FlatResponseData<any, null>> {
  const idx = mockErrors.findIndex(e => e.ID === id);
  if (idx >= 0) mockErrors.splice(idx, 1);
  return resolve(null);
}
