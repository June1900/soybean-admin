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
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({
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
    method: 'post'
  });
}

/**
 * Login with image captcha
 *
 * @param username User name
 * @param password Password
 * @param captcha Captcha code typed by user
 * @param captchaId Captcha id returned by `/base/captcha`
 * @param openCaptcha Whether captcha verification is enabled
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
    data: params
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
