<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { $t } from '@/locales';
import { fetchResetPassword, type User } from '../api';

defineOptions({
  name: 'UserResetPwdModal'
});

const props = defineProps<{
  visible: boolean;
  user: User | null;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const { loading, startLoading, endLoading } = useLoading();
const password = ref('');

watch(
  () => props.visible,
  visible => {
    if (visible) password.value = '';
  },
  { immediate: true }
);

/** 生成随机密码：10位，以字母开头，含大小写字母+数字+特殊字符 */
function generateRandomPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '^!@#$%&*?';
  const letters = upper + lower;
  const all = upper + lower + digits + special;
  // 首字符必须是字母
  const first = letters[Math.floor(Math.random() * letters.length)];
  // 剩余 9 位：先保证大写、小写、数字、特殊字符各至少出现一次
  const rest: string[] = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)]
  ];
  for (let i = rest.length; i < 9; i++) {
    rest.push(all[Math.floor(Math.random() * all.length)]);
  }
  // 打乱剩余部分（首字符保持字母不变）
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  password.value = first + rest.join('');
}

async function handleSubmit() {
  if (!props.user || !password.value) return;
  startLoading();
  try {
    const { error } = await fetchResetPassword({
      ID: props.user.ID,
      password: password.value
    });
    if (!error) {
      window.$message?.success($t('page.system.user.resetPwdSuccess'));
      emit('submitted');
      emit('close');
    }
  } finally {
    endLoading();
  }
}
</script>

<template>
  <NModal
    :show="visible"
    :title="$t('page.system.user.resetPwdTitle')"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
    @update:show="val => !val && emit('close')"
  >
    <NSpace vertical :size="18" class="pt-8px">
      <div class="flex items-center">
        <span class="w-80px shrink-0 text-right pr-12px">{{ $t('page.system.user.userName') }}</span>
        <NInput :value="user?.userName ?? ''" readonly class="flex-1" />
      </div>
      <div class="flex items-center">
        <span class="w-80px shrink-0 text-right pr-12px">{{ $t('page.system.user.nickName') }}</span>
        <NInput :value="user?.nickName ?? ''" readonly class="flex-1" />
      </div>
      <div class="flex items-center">
        <span class="w-80px shrink-0 text-right pr-12px">{{ $t('page.system.user.resetPwdNewPassword') }}</span>
        <div class="flex items-center gap-8px flex-1">
          <NInput
            v-model:value="password"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.system.user.passwordPlaceholder')"
            class="flex-1"
          />
          <NButton type="primary" size="small" :disabled="loading" @click="generateRandomPassword">
            {{ $t('page.system.user.resetPwdGenerate') }}
          </NButton>
        </div>
      </div>
    </NSpace>
    <template #footer>
      <NSpace justify="end" :size="12">
        <NButton :disabled="loading" @click="emit('close')">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" :disabled="!password" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
