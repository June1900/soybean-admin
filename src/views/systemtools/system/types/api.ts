/** 系统配置（UI-only mock，取代表性分组，无真实接口） */
export type DbType = 'mysql' | 'sqlite' | 'postgres' | 'sqlserver' | 'mariadb';
export type OssType = 'local' | 'qiniu' | 'aliyun' | 'tencent' | 'aws' | 'cloudflare';
export type ZapLevel = 'info' | 'warn' | 'error' | 'debug';
export type ZapFormat = 'console' | 'json';

export interface SystemConfig {
  system: {
    addr: string;
    dbType: DbType;
    ossType: OssType;
    useMultipoint: boolean;
    useRedis: boolean;
    useMongo: boolean;
    limitCount: number;
    limitTime: number;
  };
  jwt: {
    signingKey: string;
    expiresAt: number;
    bufferTime: number;
    issuer: string;
  };
  zap: {
    level: ZapLevel;
    format: ZapFormat;
    prefix: string;
    director: string;
    retentionDay: number;
    showLine: boolean;
    logInConsole: boolean;
  };
  redis: {
    db: number;
    addr: string;
    password: string;
  };
  captcha: {
    keyLong: number;
    imgWidth: number;
    imgHeight: number;
  };
  email: {
    to: string;
    port: number;
    from: string;
    host: string;
    isSsl: boolean;
    secret: string;
  };
}
