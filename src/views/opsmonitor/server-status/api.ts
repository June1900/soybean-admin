import { request } from '@/service/request';
import type { ServerInfoResponse, ServerInfo } from './types';

export type {
  ServerInfo,
  ServerInfoResponse,
  ServerOSInfo,
  ServerCpuInfo,
  ServerRamInfo,
  ServerDiskItem
} from './types';

/** 获取服务器状态信息 */
export function fetchServerInfo() {
  return request<ServerInfoResponse>({
    url: '/system/getServerInfo',
    method: 'post'
  });
}
