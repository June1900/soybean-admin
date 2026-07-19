/** Timed task (aligned with gin-vue-admin TimedTask) */
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

/** Timed task execution log */
export interface TimedTaskLog {
  ID?: number;
  taskId?: number;
  triggerType: 'auto' | 'manual';
  status: 'success' | 'failed';
  startedAt?: string;
  durationMs?: number;
  errorMsg?: string;
  output?: string;
}

/** A registered task method on the backend */
export interface RegisteredMethod {
  name: string;
  description: string;
}

/** Query params for getTimedTaskList */
export interface TimedTaskListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  executorType?: 'method' | 'http';
}

/** List response shape (gin-vue-admin convention) */
export interface TimedTaskListResponse {
  list: TimedTask[];
  total: number;
  page: number;
  pageSize: number;
}

/** Frontend search form model for timed task list */
export interface TimedTaskSearchParams {
  name: string;
  executorType: '' | 'method' | 'http';
}

/** Query params for getTimedTaskLogList */
export interface TimedTaskLogListQuery {
  page?: number;
  pageSize?: number;
  taskId?: number;
}

/** Log list response shape */
export interface TimedTaskLogListResponse {
  list: TimedTaskLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** Registered methods response */
export interface RegisteredMethodsResponse {
  methods: RegisteredMethod[];
}

/** Create / update payload */
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
