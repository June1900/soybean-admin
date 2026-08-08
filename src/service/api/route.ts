import { request } from '../request';

/**
 * 获取后端菜单
 */
export function fetchGetMenu() {
  return request<Api.Route.GvaMenuResponse>({ url: '/v2/menu/getMenu', method: 'post' });
}
