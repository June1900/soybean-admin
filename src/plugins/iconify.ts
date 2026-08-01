import { addAPIProvider, addCollection } from '@iconify/vue';
import riIcons from '@iconify-json/ri/icons.json';

/** Setup the iconify offline */
export function setupIconifyOffline() {
  // 预加载 ri 图标集到运行时内存，避免 Icon 组件发起远程请求
  addCollection(riIcons);

  const { VITE_ICONIFY_URL } = import.meta.env;

  if (VITE_ICONIFY_URL) {
    addAPIProvider('', { resources: [VITE_ICONIFY_URL] });
  }
}
