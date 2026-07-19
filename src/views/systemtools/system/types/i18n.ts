export interface SystemToolsSystemLang {
  title: string;
  save: string;
  saved: string;
  tabs: {
    system: string;
    jwt: string;
    zap: string;
    redis: string;
    captcha: string;
    email: string;
  };
  system: {
    addr: string;
    dbType: string;
    ossType: string;
    useMultipoint: string;
    useRedis: string;
    useMongo: string;
    limitCount: string;
    limitTime: string;
  };
  jwt: {
    signingKey: string;
    expiresAt: string;
    bufferTime: string;
    issuer: string;
  };
  zap: {
    level: string;
    format: string;
    prefix: string;
    director: string;
    retentionDay: string;
    showLine: string;
    logInConsole: string;
  };
  redis: {
    db: string;
    addr: string;
    password: string;
  };
  captcha: {
    keyLong: string;
    imgWidth: string;
    imgHeight: string;
  };
  email: {
    to: string;
    port: string;
    from: string;
    host: string;
    isSsl: string;
    secret: string;
  };
}
