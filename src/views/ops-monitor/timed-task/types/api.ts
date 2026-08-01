/** 定时任务（与 gin-vue-admin 的 TimedTask 对齐） */
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

/** 定时任务执行日志 */
export interface TimedTaskLog {
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  taskId?: number;
  taskName?: string;
  triggerType: 'auto' | 'manual';
  status: 'success' | 'failed';
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  errorMsg?: string;
  output?: string;
}

/** 后端已注册的任务方法 */
export interface RegisteredMethod {
  name: string;
  description: string;
}

/** 获取定时任务列表的查询参数 */
export interface TimedTaskListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  executorType?: 'method' | 'http';
  enabled?: boolean;
}

/** 列表响应结构（gin-vue-admin 约定） */
export interface TimedTaskListResponse {
  list: TimedTask[];
  total: number;
  page: number;
  pageSize: number;
}

/** 定时任务列表的前端搜索表单模型 */
export interface TimedTaskSearchParams {
  name: string;
  executorType: '' | 'method' | 'http';
  /** '' = 全部，'1' = 启用，'0' = 停用 */
  enabled: '' | '1' | '0';
}

/** 获取任务日志列表的查询参数 */
export interface TimedTaskLogListQuery {
  page?: number;
  pageSize?: number;
  taskId?: number;
  triggerType?: 'manual' | 'auto';
  status?: 'success' | 'failed';
  startCreatedAt?: string;
  endCreatedAt?: string;
}

/** 日志列表响应结构 */
export interface TimedTaskLogListResponse {
  list: TimedTaskLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** 执行日志前端搜索表单模型 */
export interface TimedTaskLogSearchParams {
  taskId: number | null;
  triggerType: '' | 'manual' | 'auto';
  status: '' | 'success' | 'failed';
  startCreatedAt: string;
  endCreatedAt: string;
}

/** 已注册方法列表响应 */
export interface RegisteredMethodsResponse {
  methods: RegisteredMethod[];
}

/** 新建 / 更新的提交数据 */
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
