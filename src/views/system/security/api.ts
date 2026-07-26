import { request } from '@/service/request';
import type { SecurityConfig } from './types';

export type { SecurityConfig } from './types';

/** 获取安全配置 */
export function fetchGetSecurityConfig() {
  return request<SecurityConfig>({
    url: '/securityConfig/getSecurityConfig',
    method: 'get'
  });
}

/** 保存安全配置 */
export function saveSecurityConfig(config: SecurityConfig) {
  return request<null>({
    url: '/securityConfig/setSecurityConfig',
    method: 'post',
    data: config
  });
}
