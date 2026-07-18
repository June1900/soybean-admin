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

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
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
