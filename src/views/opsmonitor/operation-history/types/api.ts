/** 操作历史（对接真实后端：GET /sysOperationRecord/getSysOperationRecordList） */

/** 嵌套的用户信息 */
export interface OperationRecordUser {
  ID: number;
  userName: string;
  nickName: string;
  headerImg: string;
}

export interface OperationRecord {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency_ms: number;
  agent: string;
  error_message: string;
  body: string;
  resp: string;
  user_id: number;
  request_id: string;
  trace_id: string;
  device_id: string;
  user: OperationRecordUser;
}

export interface OperationRecordListQuery {
  page: number;
  pageSize: number;
  method?: string;
  path?: string;
  status?: string | number;
  startCreatedAt?: string;
  endCreatedAt?: string;
}

export interface OperationRecordListResponse {
  list: OperationRecord[];
  total: number;
  page: number;
  pageSize: number;
}

/** Frontend search form model for operation record list */
export interface OperationRecordSearchParams {
  method: string;
  path: string;
  status: string;
  startCreatedAt: string;
  endCreatedAt: string;
}
