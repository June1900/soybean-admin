/** 定时任务 */
export interface TimedTask {
  ID: number;
  name: string;
  description: string;
  spec: string;
  withSeconds: boolean;
  executorType: 'method' | 'http';
  methodName?: string;
  params?: unknown;
  httpUrl?: string;
  httpMethod?: string;
  httpHeader?: unknown;
  httpBody?: string;
  httpAllowPrivate?: boolean;
  enabled: boolean;
  nextRunAt?: string;
}

/** 执行日志 */
export interface TimedTaskLog {
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  taskId?: number;
  taskName?: string;
  triggerType: 'auto' | 'manual';
  status: 'success' | 'fail' | 'timeout';
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  errorMsg?: string;
  output?: string;
}

/** 已注册的任务方法 */
export interface RegisteredMethod {
  name: string;
  description: string;
}

/** 任务列表查询参数 */
export interface TimedTaskListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  executorType?: 'method' | 'http';
  enabled?: boolean;
}

/** 任务列表响应 */
export interface TimedTaskListResponse {
  list: TimedTask[];
  total: number;
  page: number;
  pageSize: number;
}

/** 任务列表前端搜索表单 */
export interface TimedTaskSearchParams {
  name: string;
  executorType: '' | 'method' | 'http';
  /** '' 全部 / '1' 启用 / '0' 停用 */
  enabled: '' | '1' | '0';
}

/** 日志列表查询参数 */
export interface TimedTaskLogListQuery {
  page?: number;
  pageSize?: number;
  taskId?: number;
  triggerType?: 'manual' | 'auto';
  status?: 'success' | 'fail' | 'timeout';
  startCreatedAt?: string;
  endCreatedAt?: string;
}

/** 日志列表响应 */
export interface TimedTaskLogListResponse {
  list: TimedTaskLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** 日志前端搜索表单 */
export interface TimedTaskLogSearchParams {
  taskId: number | null;
  triggerType: '' | 'manual' | 'auto';
  status: '' | 'success' | 'fail' | 'timeout';
  startCreatedAt: string;
  endCreatedAt: string;
}

/** 已注册方法列表响应 */
export interface RegisteredMethodsResponse {
  methods: RegisteredMethod[];
}

/** 新建 / 更新提交数据 */
export interface TimedTaskForm {
  ID?: number;
  name: string;
  description: string;
  spec: string;
  withSeconds: boolean;
  executorType: 'method' | 'http';
  methodName?: string;
  params?: unknown;
  httpUrl?: string;
  httpMethod?: string;
  httpHeader?: unknown;
  httpBody?: string;
  httpAllowPrivate?: boolean;
  enabled: boolean;
}
