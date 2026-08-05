<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  url?: string;
}

const props = defineProps<Props>();

const route = useRoute();

// url 来源：优先后端菜单静态传入的 props.url（已是解码后的真实地址）；
// 同时兼容内置 /iframe-page/:url（经路由参数传入，vue-router 已自动解码）。
const rawUrl = computed(() => {
  if (props.url) return props.url;

  const param = route.params.url;
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] ?? '';

  return '';
});

const targetUrl = computed(() => {
  const u = rawUrl.value.trim();
  if (!u) return '';

  // 兜底再解码一次，避免被二次编码的地址（如 %253A）导致 iframe 加载异常
  try {
    return decodeURIComponent(u);
  } catch {
    return u;
  }
});
</script>

<template>
  <div class="h-full w-full overflow-hidden box-border">
    <!--    <iframe-->
    <!--      id="gva-base-load-dom"-->
    <!--      class="gva-body-h bg-main w-full border-t h-full border-border"-->
    <!--      src="https://www.gin-vue-admin.com"-->
    <!--    ></iframe>-->
    <iframe
      v-if="targetUrl"
      id="iframePage"
      class="size-full"
      :src="targetUrl"
      title="iframe-page"
      referrerpolicy="no-referrer-when-downgrade"
      allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
    <div v-else class="flex-center h-full flex-col gap-2 text-16px text-gray-500">
      <span>未配置内嵌页面地址</span>
    </div>
  </div>
</template>

<style scoped></style>
