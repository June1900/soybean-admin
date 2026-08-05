declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    /** GVA 角色/权限信息 */
    interface Authority {
      CreatedAt: string;
      UpdatedAt: string;
      DeletedAt: null | string;
      authorityId: number;
      authorityName: string;
      parentId: number;
      children: null | Authority[];
      menus: null | unknown;
      dataScope: number;
      defaultRouter: string;
    }

    /** GVA 部门信息 */
    interface Dept {
      ID: number;
      CreatedAt: string;
      UpdatedAt: string;
      name: string;
      parentId: number;
      ancestors: string;
      sort: number;
      leaderId: number;
      leader: null | unknown;
      status: null | unknown;
      children: null | unknown;
      namePath: string;
    }

    /** GVA 用户偏好设置 */
    interface UserOriginSetting {
      settings: Record<string, unknown>;
      version: number;
    }

    /**
     * 获取用户信息返回的用户对象（对应后端 `data.userInfo`）
     *
     * 字段命名遵循 gin-vue-admin 返回结构（大驼峰）。
     * 其中 `userId` / `roles` / `buttons` 为兼容 soybean-admin 权限系统而保留：
     * - `userId` 由 GVA 的 `ID` 映射
     * - `roles` 由 `authorities[].authorityName` 映射
     * - `buttons` 由其他接口提供，此处暂置空
     */
    interface UserInfo {
      ID: number;
      CreatedAt: string;
      UpdatedAt: string;
      uuid: string;
      userName: string;
      nickName: string;
      headerImg: string;
      authorityId: number;
      authority: Authority;
      authorities: Authority[];
      deptId: number;
      dept: Dept;
      departments: Dept[];
      positions: unknown[];
      phone: string;
      email: string;
      enable: number;
      originSetting: UserOriginSetting;
      passwordUpdatedAt: null | string;
      /** 兼容 soybean-admin：用户 ID（映射自 GVA 的 `ID`） */
      userId: string;
      /** 兼容 soybean-admin：角色名列表（由 `authorities` 映射） */
      roles: string[];
      /** 兼容 soybean-admin：按钮权限列表（GVA 由其他接口提供，暂置空） */
      buttons: string[];
    }

    /** Image captcha returned by `/base/captcha` */
    interface Captcha {
      /** captcha id, used to verify when login */
      captchaId: string;
      /** base64 image data url */
      picPath: string;
      /** length of the captcha code */
      captchaLength: number;
      /** whether captcha verification is enabled */
      openCaptcha: boolean;
    }
  }
}
