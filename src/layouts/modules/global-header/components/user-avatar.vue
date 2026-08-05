<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { getUploadFileUrl } from '@/utils/service';
import { $t } from '@/locales';

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
const { routerPushByKey, toLogin } = useRouterPush();

// 头像：有 headerImg 时显示头像图，否则回退到默认 icon
const avatarUrl = computed(() => getUploadFileUrl(authStore.userInfo.headerImg));

// 控制下拉面板显隐
const showDropdown = ref(false);

// 角色文字（无则显示「无」）
const rolesText = computed(() => (authStore.userInfo.roles ?? []).filter(Boolean).join(' / ') || '无');

function loginOrRegister() {
  toLogin();
}

function handleProfile() {
  showDropdown.value = false;
  routerPushByKey('profile');
}

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      authStore.logout();
    }
  });
}

function handleLogout() {
  showDropdown.value = false;
  logout();
}
</script>

<template>
  <NButton v-if="!authStore.isLogin" quaternary @click="loginOrRegister">
    {{ $t('page.login.common.loginOrRegister') }}
  </NButton>
  <NPopover v-else v-model:show="showDropdown" trigger="click" placement="bottom">
    <template #trigger>
      <div>
        <ButtonIcon>
          <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="h-28px w-28px rounded-full object-cover" />
          <SvgIcon v-else icon="ri:user-6-line" class="text-icon-large" />
          <span class="text-16px font-medium">{{ authStore.userInfo.userName }}</span>
        </ButtonIcon>
      </div>
    </template>

    <div class="w-140px">
      <!-- 昵称 + 角色信息块 -->
      <div class="px-4px py-2px leading-tight">
        <div class="text-14px text-gray-800 dark:text-gray-100">
          {{ authStore.userInfo.nickName || authStore.userInfo.userName }}
        </div>
        <div class="mt-2px text-12px text-gray-400">{{ rolesText }}</div>
      </div>

      <NDivider class="!my-8px" />

      <div
        class="flex cursor-pointer items-center rounded-4px px-4px py-8px hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="handleProfile"
      >
        <SvgIcon icon="ri:user-settings-line" class="mr-8px text-18px" />
        <span>{{ $t('page.profile.title') }}</span>
      </div>

      <div
        class="flex cursor-pointer items-center rounded-4px px-4px py-8px hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="handleLogout"
      >
        <SvgIcon icon="ri:logout-box-r-line" class="mr-8px text-18px" />
        <span>{{ $t('common.logout') }}</span>
      </div>
    </div>
  </NPopover>
</template>

<style scoped></style>
