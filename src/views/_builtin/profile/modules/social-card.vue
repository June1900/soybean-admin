<script lang="ts" setup>
import { ref } from 'vue';
import { useLoading } from '@sa/hooks';

defineOptions({
  name: 'SocialCard'
});

interface SocialItem {
  id: string;
  source: string;
  nickName: string;
  avatar: string;
  createTime: string;
}

const socialList = ref<SocialItem[]>([]);
const { loading, startLoading, endLoading } = useLoading();
const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading();

/** 获取SSO账户列表（模拟接口） */
function getSsoUserList() {
  startLoading();
  // 模拟接口返回
  socialList.value = [
    { id: '1', source: 'gitee', nickName: 'Soybean', avatar: '', createTime: '2024-03-01 12:00:00' },
    { id: '2', source: 'github', nickName: 'soybean', avatar: '', createTime: '2024-03-02 12:00:00' }
  ];
  endLoading();
}

/** 绑定SSO账户（模拟接口：本地新增记录） */
function bindSsoAccount(source: string) {
  if (socialList.value.some(item => item.source.toLowerCase() === source)) {
    return;
  }
  socialList.value.push({
    id: `${Date.now()}`,
    source,
    nickName: 'DemoUser',
    avatar: '',
    createTime: new Date().toLocaleString()
  });
  window.$message?.success('绑定成功（演示数据）');
}

/** 解绑SSO账户（模拟接口：本地移除记录） */
function unbindSsoAccount(id: string) {
  startBtnLoading();
  socialList.value = socialList.value.filter(item => item.id !== id);
  window.$message?.success('账户解绑成功（演示数据）');
  endBtnLoading();
}

const socialSources: {
  key: string;
  icon?: string;
  localIcon?: string;
  color: string;
  name: string;
}[] = [
  { key: 'wechat_open', icon: 'ic:outline-wechat', color: '#44b549', name: '微信' },
  { key: 'topiam', localIcon: 'topiam', color: '', name: 'TopIAM' },
  { key: 'maxkey', localIcon: 'maxkey', color: '', name: 'MaxKey' },
  { key: 'gitee', icon: 'simple-icons:gitee', color: '#c71d23', name: 'Gitee' },
  { key: 'github', icon: 'mdi:github', color: '#010409', name: 'GitHub' }
];

getSsoUserList();

function getSocial(key: string) {
  return socialList.value.find(s => s.source.toLowerCase() === key);
}
</script>

<template>
  <NSpin :show="loading" class="mt-16px">
    <div class="grid grid-cols-1 gap-16px 2xl:grid-cols-3 xl:grid-cols-2">
      <div v-for="source in socialSources" :key="source.key" class="relative">
        <NCard class="h-full transition-all duration-300 hover:shadow-md" :bordered="true">
          <template v-if="getSocial(source.key)">
            <div class="flex flex-col items-center gap-16px">
              <NAvatar round size="large" :src="getSocial(source.key)?.avatar" class="size-80px" />
              <div class="text-center">
                <div class="text-16px font-medium">
                  {{ getSocial(source.key)?.nickName }}
                </div>
                <div class="mt-4px text-12px text-gray-500">绑定时间：{{ getSocial(source.key)?.createTime }}</div>
              </div>
              <NButton
                type="error"
                size="small"
                :loading="btnLoading"
                @click="unbindSsoAccount(getSocial(source.key)?.id || '')"
              >
                解绑
              </NButton>
            </div>
          </template>
          <template v-else>
            <div class="h-full flex flex-col items-center justify-center gap-16px">
              <SvgIcon
                :local-icon="source.localIcon"
                :icon="source.icon"
                class="size-48px"
                :style="{ color: source.color }"
              />
              <div class="text-16px font-medium">{{ source.name }}</div>
              <NButton type="primary" size="small" @click="bindSsoAccount(source.key)">绑定</NButton>
            </div>
          </template>
        </NCard>
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.border-primary {
  border-color: var(--primary-color);
}
</style>
