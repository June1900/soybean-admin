import { request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password
    },
    isEncrypt: true
  });
}

/**
 * Get user info
 *
 * 后端返回结构为 `{ code, data: { userInfo: {...} }, msg }`，
 * request 的 transform 会取出 `data`，因此这里的数据类型为 `{ userInfo: GvaUserInfo }`。
 */
export function fetchGetUserInfo() {
  return request<{ userInfo: Omit<Api.Auth.UserInfo, 'userId' | 'roles' | 'buttons'> }>({
    url: '/user/getUserInfo',
    method: 'get'
  });
}

/**
 * Get image captcha
 *
 * @returns captcha id, base64 image and related info
 */
export function fetchGetCaptcha() {
  return request<Api.Auth.Captcha>({
    url: '/base/captcha',
    method: 'post',
    isEncrypt: true
  });
}

/**
 * Login with image captcha
 *
 * @param params
 */
export function fetchLoginByCaptcha(params: {
  username: string;
  password: string;
  captcha: string;
  captchaId: string;
  openCaptcha: boolean;
}) {
  return request<Api.Auth.LoginToken>({
    url: '/base/login',
    method: 'post',
    data: params,
    isEncrypt: true
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}

/**
 * 退出登录
 */
export function fetchLogout() {
  return request({
    url: '/jwt/jsonInBlacklist',
    method: 'post'
  });
}
