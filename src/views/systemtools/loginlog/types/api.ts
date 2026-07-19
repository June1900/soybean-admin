/** 登录日志（UI-only mock） */
export interface LoginLog {
  ID: number;
  username: string;
  ip: string;
  status: boolean;
  errorMessage: string;
  agent: string;
  CreatedAt: string;
}

export interface LoginLogListQuery {
  page: number;
  pageSize: number;
  username?: string;
  status?: 'success' | 'fail';
}

export interface LoginLogListResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** Frontend search form model for login log list */
export interface LoginLogSearchParams {
  username: string;
  status: 'success' | 'fail' | null;
}
