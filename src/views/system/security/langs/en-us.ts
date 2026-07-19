import type { SystemSecurityLang } from '../types';

const lang: SystemSecurityLang = {
  title: 'Security Settings',
  save: 'Save',
  saved: 'Security config saved (local demo)',
  tabs: {
    captcha: 'Captcha',
    password: 'Password Policy',
    rateLimit: 'Rate Limit',
    lock: 'Lockout',
    expire: 'Password Expiry'
  },
  captcha: {
    open: 'Enable Captcha',
    timeout: 'Captcha TTL (s)',
    keyLong: 'Key Length',
    imgWidth: 'Image Width',
    imgHeight: 'Image Height'
  },
  password: {
    minLength: 'Min Length',
    requireUpper: 'Require Uppercase',
    requireLower: 'Require Lowercase',
    requireDigit: 'Require Digit',
    requireSpecial: 'Require Special'
  },
  rateLimit: {
    enable: 'Enable Rate Limit',
    window: 'Window (s)',
    count: 'Max Count'
  },
  lock: {
    enable: 'Enable Lockout',
    threshold: 'Threshold (times)',
    duration: 'Duration (min)'
  },
  expire: {
    enable: 'Enable Expiry',
    days: 'Expiry Days'
  }
};

export default lang;
