export interface SystemSecurityLang {
  title: string;
  save: string;
  saved: string;
  tabs: {
    captcha: string;
    password: string;
    rateLimit: string;
    lock: string;
    expire: string;
  };
  captcha: {
    open: string;
    timeout: string;
    keyLong: string;
    imgWidth: string;
    imgHeight: string;
  };
  password: {
    minLength: string;
    requireUpper: string;
    requireLower: string;
    requireDigit: string;
    requireSpecial: string;
  };
  rateLimit: {
    enable: string;
    window: string;
    count: string;
  };
  lock: {
    enable: string;
    threshold: string;
    duration: string;
  };
  expire: {
    enable: string;
    days: string;
  };
}
