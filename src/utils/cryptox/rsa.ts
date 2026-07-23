// cryptox/rsa.ts - RSA-OAEP(SHA-256) 加解密工具
// 浏览器端实现,使用 Web Crypto API。
// 输入输出与后端保持一致: base64 编码。

/**
 * 导入公钥 (SPKI/PKIX 格式,后端默认输出格式)。
 * @param pemOrBase64 PEM 字符串或多行/单行 base64 (DER)
 *   - 完整 PEM: 包含 -----BEGIN/END----- 和换行的字符串
 *   - 单行 base64: 无 PEM 头尾,无换行 (.env 文件无法保存多行值时的常用方式)
 */
export async function importPublicKey(pemOrBase64: string): Promise<CryptoKey> {
  const der = pemOrDer(pemOrBase64);
  return globalThis.crypto.subtle.importKey(
    'spki',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

/**
 * 导入私钥 (PKCS#8 格式,后端默认输出格式)。
 * 同样兼容完整 PEM 与单行 base64。
 */
export async function importPrivateKey(pemOrBase64: string): Promise<CryptoKey> {
  const der = pemOrDer(pemOrBase64);
  return globalThis.crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}

/**
 * 使用 RSA-OAEP(SHA-256) 公钥加密,输入 ArrayBuffer,输出 base64。
 */
export async function encryptRsa(plainBuf: ArrayBuffer, publicKey: CryptoKey): Promise<string> {
  const out = await globalThis.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, plainBuf);
  return arrayBufferToBase64(out);
}

/**
 * 使用 RSA-OAEP(SHA-256) 私钥解密,输入 base64,输出 ArrayBuffer。
 */
export async function decryptRsa(cipherB64: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
  const buf = base64ToArrayBuffer(cipherB64);
  return globalThis.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, buf);
}

/**
 * 把 PEM 或单行 base64 字符串转换为 ArrayBuffer (DER)。
 *
 * 兼容三种输入:
 *   1. 完整 PEM (多行,带 -----BEGIN/END-----)
 *   2. 单行 base64 (无 PEM 头尾,无换行) — 推荐 .env 使用
 *   3. 多行 base64 (无 PEM 头尾,有换行) — 极少见
 *
 * 不再使用正则贪婪匹配,避免 PEM header 后紧跟换行但 body 为空时返回空字符串。
 */
function pemOrDer(input: string): ArrayBuffer {
  if (!input || typeof input !== 'string') {
    throw new Error('invalid PEM or base64 input (empty)');
  }

  let body = input;

  // 1. 去除 PEM header/footer (如果存在)
  if (body.includes('-----BEGIN')) {
    body = body.replace(/-----BEGIN [^-]+-----/g, '');
    body = body.replace(/-----END [^-]+-----/g, '');
  }

  // 2. 去除所有空白/换行
  body = body.replace(/\s+/g, '');

  if (!body) {
    throw new Error('PEM body is empty after stripping headers/whitespace');
  }

  // 3. base64 解码为 DER
  let binary: string;
  try {
    binary = atob(body);
  } catch (e) {
    throw new Error(`base64 decode failed: ${(e as Error)?.message ?? e}; input head="${input.slice(0, 60)}..."`, { cause: e });
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
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
