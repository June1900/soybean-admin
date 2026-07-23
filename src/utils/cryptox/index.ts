// cryptox/index.ts - 加解密高层封装
//
// 加密策略(非对称 + 对称混合,业界主流做法):
//
// 请求加密: 前端生成随机 AES key -> 用后端 RSA 公钥加密 AES key 放 encrypt-key 头
//           -> 用 AES 加密 body 放 data 字段
//
// 响应加密: 后端使用「请求中的同一个 AES key」加密响应体,响应头不放 AES key
//           (因为前端本来就知道),只在响应头里标记 X-Response-Encrypted
//
// 优势:
//   - 性能好: 响应无需再做一次 RSA,只用 AES 即可
//   - 简洁: 前端只需持有后端的 RSA 公钥
//   - 安全: 整个流程中 AES key 始终以密文形式传输,后端私钥解出后才能使用

import { decryptAes, encryptAes, generateAesKey } from './aes';
import { encryptRsa, importPublicKey } from './rsa';

let publicKeyCache: CryptoKey | null = null;

/**
 * 设置/更新后端 RSA 公钥(PEM 格式)。
 * 用于加密请求中的 AES key。该公钥在配置 VITE_APP_RSA_PUBLIC_KEY 时由模块加载时自动调用。
 */
export async function setServerPublicKey(pem: string | undefined | null) {
  if (!pem) {
    publicKeyCache = null;
    return;
  }
  publicKeyCache = await importPublicKey(pem);
}

export function isServerPublicKeyReady(): boolean {
  return Boolean(publicKeyCache);
}

/** 加密信封格式 */
export interface EncryptedEnvelope {
  __encrypted__: true;
  data: string;
}

/**
 * 加密请求体。
 *
 * @param plainObject 业务请求体
 * @returns 加密所需的全部材料
 */
export async function encryptRequestPayload(plainObject: unknown): Promise<{
  aesKey: ArrayBuffer;
  encAesKey: string;
  ciphertext: string;
  envelopeJson: string;
}> {
  if (!publicKeyCache) {
    throw new Error('未配置后端 RSA 公钥 (VITE_APP_RSA_PUBLIC_KEY)');
  }
  const aesKey = generateAesKey();
  const plainText = JSON.stringify(plainObject ?? {});
  const ciphertext = await encryptAes(plainText, aesKey);
  const encAesKey = await encryptRsa(aesKey, publicKeyCache);
  const envelope: EncryptedEnvelope = { __encrypted__: true, data: ciphertext };
  return {
    aesKey,
    encAesKey,
    ciphertext,
    envelopeJson: JSON.stringify(envelope)
  };
}

/**
 * 解密响应体(使用请求时缓存的 AES key,响应头 X-Response-Encrypted=true 标识)。
 *
 * @param body 原始响应(envelope JSON 字符串或已解析对象)
 * @param aesKey 请求时使用并缓存的 AES key
 */
export async function decryptResponsePayload(body: unknown, aesKey?: ArrayBuffer): Promise<unknown> {
  if (!aesKey) {
    throw new Error('缺少响应解密用的 AES key');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let envelope: any = body;
  if (typeof body === 'string') {
    try {
      envelope = JSON.parse(body);
    } catch {
      // 非 envelope,直接返回原文
      return body;
    }
  }
  if (!envelope || !envelope.__encrypted__ || !envelope.data) {
    return envelope;
  }
  const plain = await decryptAes(envelope.data as string, aesKey);
  try {
    return JSON.parse(plain);
  } catch {
    return plain;
  }
}

// 兼容旧 API: 暴露底层加解密能力给高级用户
export { decryptAes, encryptAes, encryptRsa, generateAesKey, importPublicKey };
