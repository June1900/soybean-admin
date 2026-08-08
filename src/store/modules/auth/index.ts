import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { fetchGetUserInfo, fetchLogin, fetchLoginByCaptcha, fetchLogout } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref('');

  function createDefaultAuthority(): Api.Auth.Authority {
    return {
      CreatedAt: '',
      UpdatedAt: '',
      DeletedAt: null,
      authorityId: 0,
      authorityName: '',
      parentId: 0,
      children: null,
      menus: null,
      dataScope: 1,
      defaultRouter: ''
    };
  }

  function createDefaultDept(): Api.Auth.Dept {
    return {
      ID: 0,
      CreatedAt: '',
      UpdatedAt: '',
      name: '',
      parentId: 0,
      ancestors: '',
      sort: 0,
      leaderId: 0,
      leader: null,
      status: null,
      children: null,
      namePath: ''
    };
  }

  function createDefaultUserInfo(): Api.Auth.UserInfo {
    return {
      ID: 0,
      CreatedAt: '',
      UpdatedAt: '',
      uuid: '',
      userName: '',
      nickName: '',
      headerImg: '',
      authorityId: 0,
      authority: createDefaultAuthority(),
      authorities: [],
      deptId: 0,
      dept: createDefaultDept(),
      departments: [],
      positions: [],
      phone: '',
      email: '',
      enable: 1,
      originSetting: { settings: {}, version: 0 },
      passwordUpdatedAt: null,
      userId: '',
      roles: [],
      role: '',
      buttons: []
    };
  }

  const userInfo: Api.Auth.UserInfo = reactive(createDefaultUserInfo());

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store
   * @param force Force navigation to login even if current route is constant
   */
  async function resetStore(force = false) {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (force || !route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    await routeStore.resetStore();
  }

  async function logout() {
    try {
      await fetchLogout();
    } catch (e) {
      console.warn('[auth] 注销接口调用失败，仍执行本地登出', e);
    }

    // 接口返回后，清空本地存储数据并强制跳转登录页
    await resetStore(true);
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, redirect = true) {
    startLoading();

    const { data: loginToken, error } = await fetchLogin(userName, password);

    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      await resetStore();
    }

    endLoading();
  }

  /**
   * Login with image captcha
   *
   * @param username User name
   * @param password Password
   * @param captcha Captcha code typed by user
   * @param captchaId Captcha id returned by `/base/captcha`
   * @param [openCaptcha=true] Whether captcha verification is enabled
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function loginByCaptcha(
    username: string,
    password: string,
    captcha: string,
    captchaId: string,
    openCaptcha = true,
    redirect = true
  ): Promise<boolean> {
    startLoading();

    const { data: loginToken, error } = await fetchLoginByCaptcha({
      username,
      password,
      captcha,
      captchaId,
      openCaptcha
    });

    let pass = false;

    if (!error) {
      pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    }

    endLoading();

    return pass;
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data, error } = await fetchGetUserInfo();

    if (!error && data?.userInfo) {
      const raw = data.userInfo;

      // 后端返回 data.userInfo（GVA 结构），拍平到 userInfo，并补齐权限系统所需字段
      Object.assign(userInfo, raw);
      console.log(raw);
      userInfo.userId = String(raw.ID);
      userInfo.roles = raw.authorities?.map(item => item.authorityName) ?? [];
      userInfo.role = raw.authority?.authorityName ?? '';
      userInfo.buttons = [];

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;
      const pass = await getUserInfo();

      if (!pass) {
        await resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    logout,
    login,
    loginByCaptcha,
    initUserInfo
  };
});
