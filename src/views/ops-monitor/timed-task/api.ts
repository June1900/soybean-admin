import { request } from '@/service/request';
import type {
  TimedTaskListQuery,
  TimedTaskListResponse,
  TimedTaskForm,
  TimedTaskLogListQuery,
  TimedTaskLogListResponse,
  RegisteredMethodsResponse,
  RegisteredMethod
} from './types';

export type {
  TimedTask,
  TimedTaskListQuery,
  TimedTaskListResponse,
  TimedTaskForm,
  TimedTaskLog,
  TimedTaskLogListQuery,
  TimedTaskLogListResponse,
  TimedTaskLogSearchParams,
  RegisteredMethodsResponse,
  RegisteredMethod,
  TimedTaskSearchParams
} from './types';

/**
 * 获取定时任务分页列表
 * @param params
 */
export function fetchGetTimedTaskList(params?: TimedTaskListQuery) {
  return request<TimedTaskListResponse>({
    url: '/timedTask/getTimedTaskList',
    method: 'get',
    params
  });
}

/**
 * 新建定时任务
 * @param data
 */
export function fetchCreateTimedTask(data: TimedTaskForm) {
  return request<void>({
    url: '/timedTask/createTimedTask',
    method: 'post',
    data
  });
}

/**
 * 更新定时任务
 * @param data
 */
export function fetchUpdateTimedTask(data: TimedTaskForm) {
  return request<void>({
    url: '/timedTask/updateTimedTask',
    method: 'put',
    data
  });
}

/**
 * 删除定时任务
 * @param id
 */
export function fetchDeleteTimedTask(id: number) {
  return request<void>({
    url: '/timedTask/deleteTimedTask',
    method: 'delete',
    data: { ID: id }
  });
}

/**
 * 启用 / 停用
 * @param id
 * @param enabled
 */
export function fetchToggleTimedTask(id: number, enabled: boolean) {
  return request<void>({
    url: '/timedTask/toggleTimedTask',
    method: 'post',
    data: { ID: id, enabled }
  });
}

/**
 * 立即触发（执行一次）
 * @param id
 */
export function fetchTriggerTimedTask(id: number) {
  return request<void>({
    url: '/timedTask/triggerTimedTask',
    method: 'post',
    data: { ID: id }
  });
}

/**
 * 获取任务执行日志
 * @param params
 */
export function fetchGetTimedTaskLogList(params?: TimedTaskLogListQuery) {
  return request<TimedTaskLogListResponse>({
    url: '/timedTask/getTimedTaskLogList',
    method: 'get',
    params
  });
}

/**
 * 获取后端已注册的任务方法
 */
export async function fetchRegisteredMethods() {
  const { data, error } = await request<RegisteredMethodsResponse>({
    url: '/timedTask/getRegisteredMethods',
    method: 'get'
  });
  if (error || !data) return [] as RegisteredMethod[];
  return data.methods ?? [];
}
