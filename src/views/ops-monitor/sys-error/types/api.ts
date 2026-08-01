/** 系统错误日志（对接真实后端：GET /sysError/getSysErrorList） */

/** 后端 level 字段值（用于 tag 颜色映射） */
export type SysErrorLevel = 'fatal' | 'error';

/** 后端 status 字段值（中文） */
export type SysErrorStatus = '未处理' | '处理中' | '处理完成' | '处理失败';

export interface SysError {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  form: string;
  info: string;
  level: SysErrorLevel;
  request_id: string;
  trace_id: string;
  solution: string | null;
  status: SysErrorStatus;
}

export interface SysErrorListQuery {
  page: number;
  pageSize: number;
  form?: string;
  info?: string;
  startCreatedAt?: string;
  endCreatedAt?: string;
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
  startCreatedAt: string;
  endCreatedAt: string;
}
