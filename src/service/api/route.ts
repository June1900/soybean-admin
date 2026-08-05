import { request } from '../request';

/**
 * 获取后端菜单（GVA：`/api/v2/menu/getMenu`）
 *
 * 后端按当前登录用户的权限返回菜单树，前端据此动态生成路由与侧边栏。
 * 返回结构见 `Api.Route.GvaMenuResponse`。
 */
export function fetchGetMenu() {
  return request<Api.Route.GvaMenuResponse>({ url: '/v2/menu/getMenu', method: 'post' });
}
