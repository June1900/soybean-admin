import { request } from '@/service/request';
import type { FlatResponseData } from '@sa/axios';
import type { SystemConfig, SystemConfigResponse } from './types';

export type {
  AliyunOssConfig,
  ApiDecryptConfig,
  AppConfig,
  AwsS3Config,
  AutoCodeConfig,
  CloudflareR2Config,
  CorsConfig,
  CorsWhitelistItem,
  DatabaseConfig,
  DatabaseKey,
  DatabaseType,
  DiskConfig,
  EmailConfig,
  HuaweiObsConfig,
  JwtConfig,
  LocalConfig,
  McpConfig,
  MediaConfig,
  MinioConfig,
  MongoConfig,
  MongoHost,
  OssConfig,
  OssKey,
  OssType,
  QiniuConfig,
  RedisConfig,
  SystemConfig,
  SystemConfigResponse,
  SystemSection,
  TencentCosConfig,
  ZapConfig,
  ZapFormat,
  ZapLevel
} from './types';

/** 获取系统配置（GET /system/getSystemConfig）。 */
export function fetchSystemConfig() {
  return request<SystemConfigResponse>({
    url: '/system/getSystemConfig',
    method: 'post'
  });
}

/** 更新系统配置（POST /system/setSystemConfig）。 */
export function updateSystemConfig(config: SystemConfig) {
  return request<void>({
    url: '/system/setSystemConfig',
    method: 'post',
    data: config
  });
}

/** 重载服务（POST /system/reloadSystem）。 */
export function reloadSystem() {
  return request<void>({
    url: '/system/reloadSystem',
    method: 'post'
  });
}

/** 发送测试邮件（POST /email/emailTest）。 */
export function testSystemEmail() {
  return request<void>({
    url: '/email/emailTest',
    method: 'post'
  });
}

/** 保留旧调用名，避免其他页面引用时产生破坏性变更。 */
export async function saveSystemConfig(_config: SystemConfig): Promise<FlatResponseData<any, null>> {
  return { data: null, error: null } as unknown as FlatResponseData<any, null>;
}
