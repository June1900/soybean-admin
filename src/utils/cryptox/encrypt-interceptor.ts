// cryptox/encrypt-interceptor.ts - 加解密与 @sa/axios 的桥接层(非侵入式)
//
// 设计要点:
//   - 仅对标记了 isEncrypt: true 的请求做加密(目前只用于「获取验证码」和「登录」)
//   - 用 onRequest 异步加密请求体,生成随机 AES key 并通过后端 RSA 公钥加密后放入 encrypt-key 头
//   - 用 onResponse 在「后端成功判定」之前同步解密响应体(响应头 X-Response-Encrypted=true 时)
//   - 全局开关 VITE_APP_ENCRYPT=true 才启用,默认关闭,对其它请求零影响
//
// 用法(在 src/service/request/index.ts 中):
//   import { encryptRequest, decryptResponse } from '@/utils/cryptox/encrypt-interceptor'
//   onRequest: async config => { await encryptRequest(config); return config }
//   onResponse: async response => { await decryptResponse(response) }

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { decryptResponsePayload, encryptRequestPayload, isServerPublicKeyReady, setServerPublicKey } from './index';

/** 全局开关: VITE_APP_ENCRYPT=true 才启用加解密 */
export const ENCRYPT_ENABLED = String(import.meta.env.VITE_APP_ENCRYPT || '').toLowerCase() === 'true';

const ENCRYPT_HEADER = 'encrypt-key';
const RESPONSE_ENCRYPTED_HEADER = 'x-response-encrypted';

// 扩展 axios 请求配置:支持 per-request 加密开关与临时 AES key
declare module 'axios' {
  interface AxiosRequestConfig {
    /** 是否对该请求启用请求/响应加解密(仅验证码与登录使用) */
    isEncrypt?: boolean;
    /** 加密时生成的 AES key,用于解密该请求的响应 */
    _aesKey?: ArrayBuffer;
  }
}

// ---------- 模块加载时初始化后端 RSA 公钥 ----------

if (ENCRYPT_ENABLED) {
  const pem = import.meta.env.VITE_APP_RSA_PUBLIC_KEY;
  if (pem) {
    setServerPublicKey(pem)
      .then(() => {
        console.info('[crypto] RSA public key loaded');
      })
      .catch(err => {
        // 公钥加载失败不阻塞启动,首次加密时仍会报错
        console.error('[crypto] load RSA public key failed:', (err as Error)?.message || err);
        console.error(
          '[crypto] 请检查 VITE_APP_RSA_PUBLIC_KEY 格式:\n' +
            '  - 使用单行 base64 (无 -----BEGIN/-----END----- 头尾,无换行)\n' +
            '  - 生成方法参考后端 RSA 公钥导出'
        );
      });
  } else {
    console.warn('[crypto] VITE_APP_ENCRYPT=true 但未配置 VITE_APP_RSA_PUBLIC_KEY');
  }
}

// ---------- 请求加密(在 onRequest 中调用) ----------

async function ensurePublicKeyReady(): Promise<void> {
  if (isServerPublicKeyReady()) return;
  const pem = import.meta.env.VITE_APP_RSA_PUBLIC_KEY;
  if (!pem) {
    throw new Error('未配置 VITE_APP_RSA_PUBLIC_KEY');
  }
  await setServerPublicKey(pem);
}

/**
 * 请求加密钩子:在 axios 请求拦截(onRequest)中调用。
 * 仅当 ENCRYPT_ENABLED 且 config.isEncrypt 为 true 时生效。
 */
export async function encryptRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  if (!ENCRYPT_ENABLED || !config.isEncrypt) return config;

  await ensurePublicKeyReady();

  try {
    const plain = config.data ?? {};
    const { aesKey, encAesKey, envelopeJson } = await encryptRequestPayload(plain);
    config.data = envelopeJson;
    config.headers.set(ENCRYPT_HEADER, encAesKey);
    config.headers.set('Content-Type', 'application/json; charset=utf-8');
    // 把 AES key 暂存在 config 上,响应时取出解密
    config._aesKey = aesKey;
  } catch (e) {
    console.error('[crypto] 请求加密失败:', (e as Error)?.message || e);
    throw e;
  }

  return config;
}

// ---------- 响应解密(在 onResponse 中调用,早于 isBackendSuccess) ----------

/**
 * 响应解密钩子:在 @sa/axios 的 onResponse 钩子中调用。
 * 仅当响应头 X-Response-Encrypted=true 且请求使用了加密时才生效。
 */
export async function decryptResponse(response: AxiosResponse): Promise<void> {
  if (!ENCRYPT_ENABLED) return;

  const headerVal = String(
    response.headers[RESPONSE_ENCRYPTED_HEADER] ||
      response.headers['X-Response-Encrypted'] ||
      ''
  ).toLowerCase();
  const isEncrypted = headerVal === 'true';
  const aesKey = response.config?._aesKey;

  if (!isEncrypted || !aesKey) return;

  try {
    response.data = (await decryptResponsePayload(response.data, aesKey)) as typeof response.data;
  } catch (e) {
    console.error('[crypto] 响应解密失败:', (e as Error)?.message || e);
    throw e;
  }
}
