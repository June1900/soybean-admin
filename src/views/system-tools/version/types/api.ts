/** 版本信息（UI-only mock） */
export interface SysVersion {
  ID: number;
  CreatedAt: string;
  versionName: string;
  versionCode: string;
  description: string;
  menuIds: number[];
  apiIds: number[];
  dictIds: number[];
}

export interface SysVersionListQuery {
  page: number;
  pageSize: number;
  versionName?: string;
  versionCode?: string;
}

export interface SysVersionListResponse {
  list: SysVersion[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SysVersionForm {
  versionName: string;
  versionCode: string;
  description: string;
}

/** Frontend search form model for version list */
export interface VersionSearchParams {
  versionName: string;
  versionCode: string;
}
