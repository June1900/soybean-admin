<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useLoading } from '@sa/hooks';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { fetchGetCaptcha } from '@/service/api/auth';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

defineOptions({
  name: 'CaptchaLogin'
});

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();
const { loading, startLoading, endLoading } = useLoading();

interface FormModel {
  userName: string;
  password: string;
  code: string;
}

const model: FormModel = reactive({
  userName: '',
  password: '',
  code: ''
});

/** base64 image data url of the captcha */
const picPath = ref('');
/** captcha id returned by `/base/captcha`, used when submitting login */
const captchaId = ref('');
/** expected length of the captcha code, used to limit the input */
const captchaLength = ref(0);

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd,
    code: formRules.code
  };
});

/** Fetch captcha from `/base/captcha` and refresh the image */
async function getCaptcha() {
  startLoading();

  const { error, data } = await fetchGetCaptcha();

  if (!error && data) {
    picPath.value = data.picPath;
    captchaId.value = data.captchaId;
    captchaLength.value = data.captchaLength;
  } else {
    window.$message?.error($t('page.login.captchaLogin.getCaptchaFail'));
  }

  endLoading();
}

async function handleSubmit() {
  await validate();
  const pass = await authStore.loginByCaptcha(model.userName, model.password, model.code, captchaId.value, true);
  if (!pass) {
    // login failed (e.g. wrong captcha), refresh captcha for retry
    getCaptcha();
  }
}

onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem path="code">
      <div class="w-full flex-y-center gap-16px">
        <NInput
          v-model:value="model.code"
          :maxlength="captchaLength || undefined"
          :placeholder="$t('page.login.captchaLogin.imageCodePlaceholder')"
        />
        <div
          class="h-40px w-120px flex-shrink-0 cursor-pointer"
          :class="{ 'pointer-events-none opacity-50': loading }"
          @click="getCaptcha"
        >
          <img
            v-if="picPath"
            :src="picPath"
            :alt="$t('page.login.captchaLogin.refreshCaptcha')"
            class="size-full rounded-4px border-1px border-#d9d9d9 object-cover"
          />
          <div
            v-else
            class="size-full flex-center rounded-4px border-1px border-#d9d9d9 bg-#f5f5f5 text-12px text-#999"
          >
            {{ $t('page.login.captchaLogin.refreshCaptcha') }}
          </div>
        </div>
      </div>
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
