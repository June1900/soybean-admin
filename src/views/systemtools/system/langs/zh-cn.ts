import type { SystemToolsSystemLang } from '../types';

const lang: SystemToolsSystemLang = {
  title: '系统配置',
  save: '保存配置',
  saved: '系统配置已保存（本地演示）',
  tabs: {
    system: '系统',
    jwt: 'JWT 签名',
    zap: 'Zap 日志',
    redis: 'Redis',
    captcha: '验证码',
    email: '邮箱'
  },
  system: {
    addr: '监听地址',
    dbType: '数据库类型',
    ossType: 'OSS 类型',
    useMultipoint: '多点登录',
    useRedis: '使用 Redis',
    useMongo: '使用 MongoDB',
    limitCount: '限流次数',
    limitTime: '限流时间(秒)'
  },
  jwt: {
    signingKey: '签名密钥',
    expiresAt: '过期时间(小时)',
    bufferTime: '缓冲时间(小时)',
    issuer: '签发者'
  },
  zap: {
    level: '日志级别',
    format: '日志格式',
    prefix: '日志前缀',
    director: '日志目录',
    retentionDay: '保留天数',
    showLine: '显示行号',
    logInConsole: '控制台输出'
  },
  redis: {
    db: '数据库索引',
    addr: '连接地址',
    password: '密码'
  },
  captcha: {
    keyLong: '字符长度',
    imgWidth: '图片宽度',
    imgHeight: '图片高度'
  },
  email: {
    to: '收件人',
    port: '端口',
    from: '发件人',
    host: 'SMTP 主机',
    isSsl: '启用 SSL',
    secret: '授权码'
  }
};

export default lang;
