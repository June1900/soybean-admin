// cryptox/aes.ts - AES-256-CBC 加解密工具
// 浏览器端实现,使用 Web Crypto API。
// 输出格式与后端保持一致: base64([16字节IV][密文])。
//
// 注意: Web Crypto 的 AES-CBC 模式内部已自动做 PKCS#7 padding,
// 因此本文件不再手动 pad/unpad,避免与后端产生双重 padding 不兼容。
// 后端 Go 使用 cipher.NewCBCEncrypter (底层原语,不自动 padding),
// 由后端手动 pad/unpad。两端各做且只做一次 PKCS#7 即可互通。

const AES_KEY_LENGTH = 32; // 256 bit
const AES_BLOCK_SIZE = 16;

/**
 * 生成 32 字节随机 AES key,返回 ArrayBuffer。
 */
export function generateAesKey(): ArrayBuffer {
  const key = new Uint8Array(AES_KEY_LENGTH);
  globalThis.crypto.getRandomValues(key);
  return key.buffer;
}

/**
 * AES-256-CBC + PKCS#7 加密,返回 base64 字符串 ([IV][ciphertext])。
 * Web Crypto 的 AES-CBC 内部已做 PKCS#7 padding,无需手动 pad。
 *
 * @param plainText 已序列化的明文(JSON 字符串或普通文本)
 * @param keyBuf 32 字节 key(ArrayBuffer 或 Uint8Array)
 */
export async function encryptAes(plainText: string | Uint8Array, keyBuf: ArrayBuffer | Uint8Array): Promise<string> {
  const keyBytes = toUint8(keyBuf);
  if (keyBytes.length !== AES_KEY_LENGTH) {
    throw new Error(`AES key must be ${AES_KEY_LENGTH} bytes, got ${keyBytes.length}`);
  }
  const key = await importKey(keyBytes);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(AES_BLOCK_SIZE));
  const data = typeof plainText === 'string' ? new TextEncoder().encode(plainText) : plainText;
  // 直接传原文给 crypto.subtle.encrypt,Web Crypto 内部会做 PKCS#7 padding
  // @ts-ignore
  const cipherBuf = await globalThis.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, data);
  const out = new Uint8Array(iv.length + cipherBuf.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipherBuf), iv.length);
  return arrayBufferToBase64(out.buffer);
}

/**
 * AES-256-CBC 解密,输入 base64 字符串 ([IV][ciphertext]),返回明文字符串。
 * crypto.subtle.decrypt 内部已去除 PKCS#7 padding,无需手动 unpad。
 */
export async function decryptAes(cipherB64: string, keyBuf: ArrayBuffer | Uint8Array): Promise<string> {
  const keyBytes = toUint8(keyBuf);
  if (keyBytes.length !== AES_KEY_LENGTH) {
    throw new Error(`AES key must be ${AES_KEY_LENGTH} bytes, got ${keyBytes.length}`);
  }
  const key = await importKey(keyBytes);
  const raw = base64ToArrayBuffer(cipherB64);
  if (raw.byteLength < AES_BLOCK_SIZE * 2) {
    throw new Error('ciphertext too short');
  }
  const iv = new Uint8Array(raw, 0, AES_BLOCK_SIZE);
  const cipherBytes = new Uint8Array(raw, AES_BLOCK_SIZE);
  // crypto.subtle.decrypt 已自动去除 PKCS#7 padding,plainBuf 即为原始明文
  const plainBuf = await globalThis.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, cipherBytes);
  return new TextDecoder().decode(new Uint8Array(plainBuf));
}

function importKey(bytes: Uint8Array): Promise<CryptoKey> {
  // @ts-ignore
  return globalThis.crypto.subtle.importKey('raw', bytes, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

function toUint8(buf: ArrayBuffer | Uint8Array): Uint8Array {
  if (buf instanceof Uint8Array) return buf;
  if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
  throw new Error('unsupported key buffer type');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    // @ts-ignore
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
