import type { FlatResponseData } from '@sa/axios';
import type { SysVersion, SysVersionForm, SysVersionListQuery, SysVersionListResponse } from './types';

export type {
  SysVersion,
  SysVersionForm,
  SysVersionListQuery,
  SysVersionListResponse,
  VersionSearchParams
} from './types';

/** UI-only：本地 mock 数据，不对接真实接口 */
const mockVersions: SysVersion[] = Array.from({ length: 12 }).map((_, i) => ({
  ID: i + 1,
  CreatedAt: new Date(Date.now() - i * 7 * 86_400_000).toISOString().slice(0, 19).replace('T', ' '),
  versionName: `v${(2.0 + i * 0.1).toFixed(1)} 正式版`,
  versionCode: `2.${i}.0`,
  description: i % 2 === 0 ? '包含菜单与接口权限重构，建议所有环境升级。' : '修复若干已知问题，按需升级。',
  menuIds: [],
  apiIds: [],
  dictIds: []
}));

function resolve<T>(data: T): FlatResponseData<any, T> {
  return { data, error: null } as unknown as FlatResponseData<any, T>;
}

export async function fetchVersionList(
  params: SysVersionListQuery
): Promise<FlatResponseData<any, SysVersionListResponse>> {
  const filtered = mockVersions.filter(v => {
    if (params.versionName && !v.versionName.includes(params.versionName)) return false;
    if (params.versionCode && !v.versionCode.includes(params.versionCode)) return false;
    return true;
  });
  const start = (params.page - 1) * params.pageSize;
  const list = filtered.slice(start, start + params.pageSize);
  return resolve({ list, total: filtered.length, page: params.page, pageSize: params.pageSize });
}

export async function createVersion(form: SysVersionForm): Promise<FlatResponseData<any, SysVersion>> {
  const item: SysVersion = {
    ID: Math.max(0, ...mockVersions.map(v => v.ID)) + 1,
    CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    versionName: form.versionName,
    versionCode: form.versionCode,
    description: form.description,
    menuIds: [],
    apiIds: [],
    dictIds: []
  };
  mockVersions.unshift(item);
  return resolve(item);
}

export async function deleteVersion(id: number): Promise<FlatResponseData<any, null>> {
  const idx = mockVersions.findIndex(v => v.ID === id);
  if (idx >= 0) mockVersions.splice(idx, 1);
  return resolve(null);
}
