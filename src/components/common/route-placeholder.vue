<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const componentPath = String((route.meta as Record<string, unknown>).realComponent ?? '');
</script>

<template>
  <div class="flex-col-center h-full gap-2 px-4 text-center">
    <NEmpty description="页面组件尚未接入">
      <template #extra>
        <div class="max-w-480px text-14px text-gray-500 leading-6">
          <p>
            后端菜单返回的
            <b>component</b>
            未匹配到项目
            <code>src/views</code>
            下的文件：
          </p>
          <p class="break-all text-primary">
            {{ componentPath || '（无 component 信息）' }}
          </p>
          <p class="mt-2">
            请提供与项目实际视图路径一致的后端菜单数据，或在
            <code>src/router/routes/transform-menu.ts</code>
            中补全映射。
          </p>
        </div>
      </template>
    </NEmpty>
  </div>
</template>
