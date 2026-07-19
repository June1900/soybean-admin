/** 系统错误日志（UI-only mock） */
export type SysErrorLevel = 'fatal' | 'error';
export type SysErrorStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface SysError {
  ID: number;
  CreatedAt: string;
  form: string;
  level: SysErrorLevel;
  status: SysErrorStatus;
  info: string;
  solution: string;
}

export interface SysErrorListQuery {
  page: number;
  pageSize: number;
  form?: string;
  info?: string;
}

export interface SysErrorListResponse {
  list: SysError[];
  total: number;
  page: number;
  pageSize: number;
}

/** Frontend search form model for sys error list */
export interface SysErrorSearchParams {
  form: string;
  info: string;
}
