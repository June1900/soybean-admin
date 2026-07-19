import type { SystemToolsSystemLang } from '../types';

const lang: SystemToolsSystemLang = {
  title: 'System Config',
  save: 'Save Config',
  saved: 'System config saved (local demo)',
  tabs: {
    system: 'System',
    jwt: 'JWT',
    zap: 'Zap Log',
    redis: 'Redis',
    captcha: 'Captcha',
    email: 'Email'
  },
  system: {
    addr: 'Listen Addr',
    dbType: 'DB Type',
    ossType: 'OSS Type',
    useMultipoint: 'Multi-point Login',
    useRedis: 'Use Redis',
    useMongo: 'Use MongoDB',
    limitCount: 'Limit Count',
    limitTime: 'Limit Time (s)'
  },
  jwt: {
    signingKey: 'Signing Key',
    expiresAt: 'Expires At (h)',
    bufferTime: 'Buffer Time (h)',
    issuer: 'Issuer'
  },
  zap: {
    level: 'Level',
    format: 'Format',
    prefix: 'Prefix',
    director: 'Directory',
    retentionDay: 'Retention (day)',
    showLine: 'Show Line',
    logInConsole: 'Log In Console'
  },
  redis: {
    db: 'DB Index',
    addr: 'Addr',
    password: 'Password'
  },
  captcha: {
    keyLong: 'Key Length',
    imgWidth: 'Image Width',
    imgHeight: 'Image Height'
  },
  email: {
    to: 'To',
    port: 'Port',
    from: 'From',
    host: 'SMTP Host',
    isSsl: 'Use SSL',
    secret: 'Secret'
  }
};

export default lang;
