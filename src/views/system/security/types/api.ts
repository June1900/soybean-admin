/** 安全设置（UI-only mock，无真实接口） */
export interface SecurityConfig {
  captchaOpen: boolean;
  captchaTimeout: number;
  keyLong: number;
  imgWidth: number;
  imgHeight: number;
  pwdMinLength: number;
  pwdRequireUpper: boolean;
  pwdRequireLower: boolean;
  pwdRequireDigit: boolean;
  pwdRequireSpecial: boolean;
  limitEnable: boolean;
  limitWindow: number;
  limitCount: number;
  lockEnable: boolean;
  lockThreshold: number;
  lockDuration: number;
  pwdExpireEnable: boolean;
  pwdExpireDays: number;
}
