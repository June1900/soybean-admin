import type { SystemSecurityLang } from '../types';

const lang: SystemSecurityLang = {
  title: 'Security Settings',
  save: 'Save',
  saved: 'Security config saved',
  tabs: {
    captcha: 'Captcha',
    password: 'Password Policy',
    rateLimit: 'Rate Limit',
    lock: 'Lockout',
    expire: 'Password Expiry'
  },
  captcha: {
    open: 'Show captcha after N failures',
    openTip: '0 = captcha required every time',
    timeout: 'Count cache timeout (s)',
    keyLong: 'Captcha length',
    imgWidth: 'Captcha width',
    imgHeight: 'Captcha height'
  },
  password: {
    minLength: 'Min length',
    requireUpper: 'Require uppercase',
    requireLower: 'Require lowercase',
    requireDigit: 'Require digit',
    requireSpecial: 'Require special char'
  },
  rateLimit: {
    enable: 'Enable rate limit',
    window: 'Window (s)',
    count: 'Max count in window'
  },
  lock: {
    enable: 'Enable failure lock',
    threshold: 'Failure threshold',
    duration: 'Lock duration (min)'
  },
  expire: {
    enable: 'Enable password expiry',
    days: 'Valid days'
  }
};

export default lang;
