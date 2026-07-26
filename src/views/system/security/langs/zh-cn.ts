import type { SystemSecurityLang } from '../types';

const lang: SystemSecurityLang = {
  title: '安全设置',
  save: '保存',
  saved: '安全配置已保存',
  tabs: {
    captcha: '验证码',
    password: '密码复杂度',
    rateLimit: '限流',
    lock: '失败锁定',
    expire: '密码过期'
  },
  captcha: {
    open: '错误N次后出验证码',
    openTip: '0 = 每次都需要验证码',
    timeout: '计数缓存超时(秒)',
    keyLong: '验证码长度',
    imgWidth: '验证码宽度',
    imgHeight: '验证码高度'
  },
  password: {
    minLength: '最小长度',
    requireUpper: '需大写字母',
    requireLower: '需小写字母',
    requireDigit: '需数字',
    requireSpecial: '需特殊字符'
  },
  rateLimit: {
    enable: '开启限流',
    window: '窗口(秒)',
    count: '窗口内最大次数'
  },
  lock: {
    enable: '开启失败锁定',
    threshold: '失败次数阈值',
    duration: '锁定时长(分钟)'
  },
  expire: {
    enable: '开启密码过期',
    days: '有效天数'
  }
};

export default lang;
