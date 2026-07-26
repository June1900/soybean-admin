/** System configuration returned by /system/getSystemConfig. */
export type DatabaseType = 'mysql' | 'mssql' | 'pgsql' | 'oracle' | 'sqlite' | string;
export type OssType =
  | 'local'
  | 'qiniu'
  | 'aliyun-oss'
  | 'hua-wei-obs'
  | 'tencent-cos'
  | 'aws-s3'
  | 'cloudflare-r2'
  | 'minio'
  | string;
export type ZapLevel = 'off' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | string;
export type ZapFormat = 'console' | 'json' | string;

export interface SystemSection {
  'db-type': DatabaseType;
  'oss-type': OssType;
  'router-prefix': string;
  addr: number;
  'iplimit-count': number;
  'iplimit-time': number;
  'use-multipoint': boolean;
  'use-redis': boolean;
  'use-mongo': boolean;
  'use-strict-auth': boolean;
  'disable-auto-migrate': boolean;
}

export interface JwtConfig {
  'signing-key': string;
  'expires-time': string;
  'buffer-time': string;
  issuer: string;
}

export interface ZapConfig {
  level: ZapLevel;
  prefix: string;
  format: ZapFormat;
  director: string;
  'encode-level': string;
  'stacktrace-key': string;
  'show-line': boolean;
  'log-in-console': boolean;
  'retention-day': number;
  'access-req-body': boolean;
  'access-resp-data': boolean;
  'access-req-headers': boolean;
  'access-log-max-bytes': number;
  'file-only-modules': string[];
}

export interface RedisConfig {
  name: string;
  addr: string;
  password: string;
  db: number;
  useCluster: boolean;
  clusterAddrs: string[];
}

export interface MongoHost {
  host: string;
  port: string;
}

export interface MongoConfig {
  coll: string;
  options: string;
  database: string;
  username: string;
  password: string;
  'auth-source': string;
  'min-pool-size': number;
  'max-pool-size': number;
  'socket-timeout-ms': number;
  'connect-timeout-ms': number;
  'is-zap': boolean;
  hosts: MongoHost[];
}

export interface EmailConfig {
  to: string;
  from: string;
  host: string;
  secret: string;
  nickname: string;
  port: number;
  'is-ssl': boolean;
  'is-loginauth': boolean;
}

export interface DatabaseConfig {
  prefix: string;
  port: string;
  config: string;
  'db-name': string;
  username: string;
  password: string;
  path: string;
  engine: string;
  'log-mode': string;
  'max-idle-conns': number;
  'max-open-conns': number;
  'conn-max-lifetime': number;
  singular: boolean;
}

export interface AutoCodeConfig {
  web: string;
  root: string;
  server: string;
  module: string;
  'ai-path': string;
}

export interface LocalConfig {
  path: string;
  'store-path': string;
}

export interface QiniuConfig {
  zone: string;
  bucket: string;
  'img-path': string;
  'access-key': string;
  'secret-key': string;
  'use-https': boolean;
  'use-cdn-domains': boolean;
}

export interface AliyunOssConfig {
  endpoint: string;
  'access-key-id': string;
  'access-key-secret': string;
  'bucket-name': string;
  'bucket-url': string;
  'base-path': string;
}

export interface HuaweiObsConfig {
  path: string;
  bucket: string;
  endpoint: string;
  'access-key': string;
  'secret-key': string;
}

export interface TencentCosConfig {
  bucket: string;
  region: string;
  'secret-id': string;
  'secret-key': string;
  'base-url': string;
  'path-prefix': string;
}

export interface AwsS3Config {
  bucket: string;
  region: string;
  endpoint: string;
  'secret-id': string;
  'secret-key': string;
  'base-url': string;
  'path-prefix': string;
  's3-force-path-style': boolean;
  'disable-ssl': boolean;
}

export interface CloudflareR2Config {
  bucket: string;
  'base-url': string;
  path: string;
  'account-id': string;
  'access-key-id': string;
  'secret-access-key': string;
}

export interface MinioConfig {
  endpoint: string;
  'access-key-id': string;
  'access-key-secret': string;
  'bucket-name': string;
  'use-ssl': boolean;
  'base-path': string;
  'bucket-url': string;
}

export interface MediaConfig {
  'chunk-dir': string;
  'max-file-size': number;
  'session-ttl': number;
}

export interface DiskConfig {
  'mount-point': string;
}

export interface CorsWhitelistItem {
  'allow-origin': string;
  'allow-methods': string;
  'allow-headers': string;
  'expose-headers': string;
  'allow-credentials': boolean;
}

export interface CorsConfig {
  mode: string;
  whitelist: CorsWhitelistItem[];
}

export interface McpConfig {
  name: string;
  version: string;
  path: string;
  addr: number;
  base_url: string;
  upstream_base_url: string;
  auth_header: string;
  request_timeout: number;
}

export interface ApiDecryptConfig {
  enabled: boolean;
  'header-flag': string;
  'public-key': string;
  'private-key': string;
  'always-encrypt-paths': string[] | null;
}

export interface AppConfig {
  node: string;
  'app-id': string;
  env: string;
}

export type OssConfig =
  | LocalConfig
  | QiniuConfig
  | AliyunOssConfig
  | HuaweiObsConfig
  | TencentCosConfig
  | AwsS3Config
  | CloudflareR2Config
  | MinioConfig;

export interface SystemConfig {
  jwt: JwtConfig;
  zap: ZapConfig;
  redis: RedisConfig;
  'redis-list': RedisConfig[];
  mongo: MongoConfig;
  email: EmailConfig;
  system: SystemSection;
  autocode: AutoCodeConfig;
  mysql: DatabaseConfig;
  mssql: DatabaseConfig;
  pgsql: DatabaseConfig;
  oracle: DatabaseConfig;
  sqlite: DatabaseConfig;
  'db-list': Array<DatabaseConfig & { type: string; 'alias-name': string; disable: boolean }>;
  local: LocalConfig;
  qiniu: QiniuConfig;
  'aliyun-oss': AliyunOssConfig;
  'hua-wei-obs': HuaweiObsConfig;
  'tencent-cos': TencentCosConfig;
  'aws-s3': AwsS3Config;
  'cloudflare-r2': CloudflareR2Config;
  minio: MinioConfig;
  media: MediaConfig;
  'disk-list': DiskConfig[];
  cors: CorsConfig;
  mcp: McpConfig;
  'api-decrypt': ApiDecryptConfig;
  app: AppConfig;
}

export interface SystemConfigResponse {
  config: SystemConfig;
}

export type DatabaseKey = 'mysql' | 'mssql' | 'pgsql' | 'oracle' | 'sqlite';
export type OssKey =
  | 'local'
  | 'qiniu'
  | 'aliyun-oss'
  | 'hua-wei-obs'
  | 'tencent-cos'
  | 'aws-s3'
  | 'cloudflare-r2'
  | 'minio';
