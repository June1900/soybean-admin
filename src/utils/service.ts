import json5 from 'json5';

/**
 * Parse `VITE_OTHER_SERVICE_BASE_URL` from a tuple-array string into a record
 *
 * @param raw The raw env string (json5). In `.env` files it is wrapped in
 *   backticks, e.g. `` VITE_OTHER_SERVICE_BASE_URL=`[["demo","http://..."]]` ``.
 *   Each tuple is `[key, baseURL]`; the parsed record maps key -> baseURL.
 */
function parseOtherServiceBaseURLs(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const tuples = json5.parse(raw);
    if (!Array.isArray(tuples)) {
      // eslint-disable-next-line no-console
      console.error('VITE_OTHER_SERVICE_BASE_URL should be a tuple array like [["demo","http://..."]]');
      return result;
    }
    for (const item of tuples) {
      if (!Array.isArray(item) || item.length < 2 || typeof item[0] !== 'string') {
        // eslint-disable-next-line no-console
        console.warn('Skip invalid item in VITE_OTHER_SERVICE_BASE_URL:', item);
        continue;
      }
      const key = item[0];
      result[key] = typeof item[1] === 'string' ? item[1] : String(item[1] ?? '');
    }
  } catch {
    // eslint-disable-next-line no-console
    console.error('VITE_OTHER_SERVICE_BASE_URL is not a valid json5 string');
  }
  return result;
}

/**
 * Create service config by current env
 *
 * @param env The current env
 */
export function createServiceConfig(env: Env.ImportMeta) {
  const { VITE_SERVICE_BASE_URL, VITE_OTHER_SERVICE_BASE_URL } = env;

  const other = parseOtherServiceBaseURLs(VITE_OTHER_SERVICE_BASE_URL);

  const httpConfig: App.Service.SimpleServiceConfig = {
    baseURL: VITE_SERVICE_BASE_URL,
    other
  };

  const otherHttpKeys = Object.keys(httpConfig.other) as App.Service.OtherBaseURLKey[];

  const otherConfig: App.Service.OtherServiceConfigItem[] = otherHttpKeys.map(key => {
    return {
      key,
      baseURL: httpConfig.other[key],
      proxyPattern: createProxyPattern(key)
    };
  });

  const config: App.Service.ServiceConfig = {
    baseURL: httpConfig.baseURL,
    proxyPattern: createProxyPattern(),
    other: otherConfig
  };

  return config;
}

/**
 * get backend service base url
 *
 * @param env - the current env
 * @param isProxy - if use proxy
 */
export function getServiceBaseURL(env: Env.ImportMeta, isProxy: boolean) {
  const { baseURL, other } = createServiceConfig(env);

  const otherBaseURL = {} as Record<App.Service.OtherBaseURLKey, string>;

  other.forEach(item => {
    otherBaseURL[item.key] = isProxy ? item.proxyPattern : item.baseURL;
  });

  return {
    baseURL: isProxy ? createProxyPattern() : baseURL,
    otherBaseURL
  };
}

/**
 * Get proxy pattern of backend service base url
 *
 * @param key If not set, will use the default key
 */
function createProxyPattern(key?: App.Service.OtherBaseURLKey) {
  if (!key) {
    return '/proxy-dev';
  }

  return `/proxy-${key}`;
}

/**
 * 将后端返回的相对文件地址（如 `uploads/file/xxx.png`）转换为可访问的完整 URL。
 *
 *  文件上传接口 `/fileUploadAndDownload/upload` 返回的 `url` 是相对路径，
 * 直接作为 `<img src>` 无法显示，需要拼接后端基地址：
 * - 已为 http(s)/data/blob 绝对地址则原样返回；
 * - 开发代理模式下前缀为代理路径（如 `/proxy-dev`）；
 * - 生产/直连模式下前缀为 `VITE_SERVICE_BASE_URL`。
 */
export function getUploadFileUrl(url?: string | null): string {
  if (!url) {
    return '';
  }

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  const isProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
  const { baseURL } = getServiceBaseURL(import.meta.env, isProxy);

  if (!baseURL) {
    return url;
  }

  const base = baseURL.replace(/\/+$/, '');
  const path = url.replace(/^\/+/, '');

  return `${base}/${path}`;
}
