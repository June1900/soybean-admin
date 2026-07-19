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
  RegisteredMethodsResponse,
  RegisteredMethod,
  TimedTaskSearchParams
} from './types';

/** Get paginated timed task list (GET) */
export function fetchGetTimedTaskList(params?: TimedTaskListQuery) {
  return request<TimedTaskListResponse>({
    url: '/timedTask/getTimedTaskList',
    method: 'get',
    params
  });
}

/** Create a timed task */
export function fetchCreateTimedTask(data: TimedTaskForm) {
  return request<void>({
    url: '/timedTask/createTimedTask',
    method: 'post',
    data
  });
}

/** Update a timed task */
export function fetchUpdateTimedTask(data: TimedTaskForm) {
  return request<void>({
    url: '/timedTask/updateTimedTask',
    method: 'put',
    data
  });
}

/** Delete a timed task */
export function fetchDeleteTimedTask(id: number) {
  return request<void>({
    url: '/timedTask/deleteTimedTask',
    method: 'delete',
    data: { ID: id }
  });
}

/** Enable / disable a timed task */
export function fetchToggleTimedTask(id: number, enabled: boolean) {
  return request<void>({
    url: '/timedTask/toggleTimedTask',
    method: 'post',
    data: { ID: id, enabled }
  });
}

/** Trigger a task immediately (run once) */
export function fetchTriggerTimedTask(id: number) {
  return request<void>({
    url: '/timedTask/triggerTimedTask',
    method: 'post',
    data: { ID: id }
  });
}

/** Get execution logs for a task (GET) */
export function fetchGetTimedTaskLogList(params?: TimedTaskLogListQuery) {
  return request<TimedTaskLogListResponse>({
    url: '/timedTask/getTimedTaskLogList',
    method: 'get',
    params
  });
}

/** Get registered task methods on the backend */
export async function fetchRegisteredMethods() {
  const { data, error } = await request<RegisteredMethodsResponse>({
    url: '/timedTask/getRegisteredMethods',
    method: 'get'
  });
  if (error || !data) return [] as RegisteredMethod[];
  return data.methods ?? [];
}
