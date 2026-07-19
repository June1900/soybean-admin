<script setup lang="ts">
import { reactive } from 'vue';
import { NButton, NForm, NFormItem, NInputNumber, NSwitch, NTabPane, NTabs } from 'naive-ui';
import { $t } from '@/locales';
import { saveSecurityConfig, type SecurityConfig } from './api';

defineOptions({
  name: 'SystemSecurity'
});

const model = reactive<SecurityConfig>({
  captchaOpen: true,
  captchaTimeout: 300,
  keyLong: 6,
  imgWidth: 240,
  imgHeight: 80,
  pwdMinLength: 8,
  pwdRequireUpper: true,
  pwdRequireLower: true,
  pwdRequireDigit: true,
  pwdRequireSpecial: false,
  limitEnable: true,
  limitWindow: 60,
  limitCount: 10,
  lockEnable: true,
  lockThreshold: 5,
  lockDuration: 30,
  pwdExpireEnable: false,
  pwdExpireDays: 90
});

async function handleSave() {
  const { error } = await saveSecurityConfig({ ...model });
  if (!error) window.$message?.success($t('page.system.security.saved'));
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="flex-1 flex-col-stretch sm:p-16px">
      <template #header>
        <span class="text-16px font-500">{{ $t('page.system.security.title') }}</span>
      </template>

      <NTabs type="line" animated>
        <NTabPane name="captcha" :tab="$t('page.system.security.tabs.captcha')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.system.security.captcha.open')">
              <NSwitch v-model:value="model.captchaOpen" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.captcha.timeout')">
              <NInputNumber v-model:value="model.captchaTimeout" :min="30" :max="3600" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.captcha.keyLong')">
              <NInputNumber v-model:value="model.keyLong" :min="3" :max="8" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.captcha.imgWidth')">
              <NInputNumber v-model:value="model.imgWidth" :min="100" :max="400" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.captcha.imgHeight')">
              <NInputNumber v-model:value="model.imgHeight" :min="40" :max="200" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="password" :tab="$t('page.system.security.tabs.password')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.system.security.password.minLength')">
              <NInputNumber v-model:value="model.pwdMinLength" :min="6" :max="32" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.password.requireUpper')">
              <NSwitch v-model:value="model.pwdRequireUpper" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.password.requireLower')">
              <NSwitch v-model:value="model.pwdRequireLower" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.password.requireDigit')">
              <NSwitch v-model:value="model.pwdRequireDigit" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.password.requireSpecial')">
              <NSwitch v-model:value="model.pwdRequireSpecial" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="rateLimit" :tab="$t('page.system.security.tabs.rateLimit')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.system.security.rateLimit.enable')">
              <NSwitch v-model:value="model.limitEnable" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.rateLimit.window')">
              <NInputNumber v-model:value="model.limitWindow" :min="10" :max="3600" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.rateLimit.count')">
              <NInputNumber v-model:value="model.limitCount" :min="1" :max="100" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="lock" :tab="$t('page.system.security.tabs.lock')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.system.security.lock.enable')">
              <NSwitch v-model:value="model.lockEnable" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.lock.threshold')">
              <NInputNumber v-model:value="model.lockThreshold" :min="1" :max="20" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.lock.duration')">
              <NInputNumber v-model:value="model.lockDuration" :min="1" :max="1440" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="expire" :tab="$t('page.system.security.tabs.expire')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.system.security.expire.enable')">
              <NSwitch v-model:value="model.pwdExpireEnable" />
            </NFormItem>
            <NFormItem :label="$t('page.system.security.expire.days')">
              <NInputNumber v-model:value="model.pwdExpireDays" :min="1" :max="365" />
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="handleSave">{{ $t('page.system.security.save') }}</NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>
