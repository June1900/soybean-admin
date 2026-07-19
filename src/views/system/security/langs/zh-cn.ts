import type { SystemSecurityLang } from '../types';

const lang: SystemSecurityLang = {
  title: '安全设置',
  save: '保存',
  saved: '安全配置已保存（本地演示）',
  tabs: {
    captcha: '验证码',
    password: '密码复杂度',
    rateLimit: '限流',
    lock: '失败锁定',
    expire: '密码过期'
  },
  captcha: {
    open: '启用验证码',
    timeout: '验证码有效期(秒)',
    keyLong: '字符长度',
    imgWidth: '图片宽度',
    imgHeight: '图片高度'
  },
  password: {
    minLength: '最小长度',
    requireUpper: '需大写字母',
    requireLower: '需小写字母',
    requireDigit: '需数字',
    requireSpecial: '需特殊字符'
  },
  rateLimit: {
    enable: '启用限流',
    window: '时间窗口(秒)',
    count: '最大次数'
  },
  lock: {
    enable: '启用失败锁定',
    threshold: '锁定阈值(次)',
    duration: '锁定时长(分钟)'
  },
  expire: {
    enable: '启用密码过期',
    days: '过期天数'
  }
};

export default lang;
