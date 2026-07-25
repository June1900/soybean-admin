/** 登录日志 */
export interface LoginLog {
  ID: number;
  CreatedAt: string;
  UpdatedAt?: string;
  username: string;
  ip: string;
  status: boolean;
  errorMessage: string;
  agent: string;
  userId: number;
}

export interface LoginLogListQuery {
  page: number;
  pageSize: number;
  username?: string;
  ip?: string;
  status?: boolean;
  startCreatedAt?: string;
  endCreatedAt?: string;
}

export interface LoginLogListResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** 前端搜索表单模型 */
export interface LoginLogSearchParams {
  username: string;
  ip: string;
  status: 'success' | 'fail' | null;
  startCreatedAt: string;
  endCreatedAt: string;
}
