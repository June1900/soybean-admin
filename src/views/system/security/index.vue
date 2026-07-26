<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NForm, NFormItem, NInputNumber, NSpace, NSpin, NSwitch, NTabPane, NTabs } from 'naive-ui';
import { $t } from '@/locales';
import { fetchGetSecurityConfig, saveSecurityConfig, type SecurityConfig } from './api';

defineOptions({
  name: 'SystemSecurity'
});

const model = ref<SecurityConfig | null>(null);

async function init() {
  const { data, error } = await fetchGetSecurityConfig();
  if (!error && data) {
    model.value = data;
  }
}

async function handleSave() {
  if (!model.value) return;
  const { error } = await saveSecurityConfig({ ...model.value });
  if (!error) window.$message?.success($t('page.system.security.saved'));
}

onMounted(() => {
  void init();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="flex-1 flex-col-stretch sm:p-16px">
      <template #header>
        <span class="text-16px font-500">{{ $t('page.system.security.title') }}</span>
      </template>

      <NSpin :show="!model">
        <template v-if="model">
          <NTabs type="line" animated>
            <NTabPane name="captcha" :tab="$t('page.system.security.tabs.captcha')">
              <NForm label-placement="left" :label-width="160">
                <NFormItem :label="$t('page.system.security.captcha.open')">
                  <div class="flex-y-center gap-12px">
                    <NInputNumber v-model:value="model.captchaOpen" :min="0" :max="10" :show-button="true" />
                    <span class="text-14px text-[#999]">{{ $t('page.system.security.captcha.openTip') }}</span>
                  </div>
                </NFormItem>
                <NFormItem :label="$t('page.system.security.captcha.timeout')">
                  <NInputNumber v-model:value="model.captchaTimeout" :min="30" :max="3600" :show-button="true" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.captcha.keyLong')">
                  <NInputNumber v-model:value="model.keyLong" :min="3" :max="8" :show-button="true" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.captcha.imgWidth')">
                  <NInputNumber v-model:value="model.imgWidth" :min="100" :max="400" :show-button="true" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.captcha.imgHeight')">
                  <NInputNumber v-model:value="model.imgHeight" :min="40" :max="200" :show-button="true" />
                </NFormItem>
              </NForm>
            </NTabPane>

            <NTabPane name="password" :tab="$t('page.system.security.tabs.password')">
              <NForm label-placement="left" :label-width="160">
                <NFormItem :label="$t('page.system.security.password.minLength')">
                  <NInputNumber v-model:value="model.pwdMinLength" :min="6" :max="32" :show-button="true" />
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
                  <NInputNumber v-model:value="model.limitWindow" :min="10" :max="3600" :show-button="true" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.rateLimit.count')">
                  <NInputNumber v-model:value="model.limitCount" :min="1" :max="100" :show-button="true" />
                </NFormItem>
              </NForm>
            </NTabPane>

            <NTabPane name="lock" :tab="$t('page.system.security.tabs.lock')">
              <NForm label-placement="left" :label-width="160">
                <NFormItem :label="$t('page.system.security.lock.enable')">
                  <NSwitch v-model:value="model.lockEnable" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.lock.threshold')">
                  <NInputNumber v-model:value="model.lockThreshold" :min="1" :max="20" :show-button="true" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.lock.duration')">
                  <NInputNumber v-model:value="model.lockDuration" :min="1" :max="1440" :show-button="true" />
                </NFormItem>
              </NForm>
            </NTabPane>

            <NTabPane name="expire" :tab="$t('page.system.security.tabs.expire')">
              <NForm label-placement="left" :label-width="160">
                <NFormItem :label="$t('page.system.security.expire.enable')">
                  <NSwitch v-model:value="model.pwdExpireEnable" />
                </NFormItem>
                <NFormItem :label="$t('page.system.security.expire.days')">
                  <NInputNumber v-model:value="model.pwdExpireDays" :min="1" :max="365" :show-button="true" />
                </NFormItem>
              </NForm>
            </NTabPane>
          </NTabs>
        </template>
      </NSpin>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" :disabled="!model" @click="handleSave">{{ $t('page.system.security.save') }}</NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>
