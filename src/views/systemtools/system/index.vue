<script setup lang="ts">
import { reactive } from 'vue';
import { NButton, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NTabPane, NTabs } from 'naive-ui';
import { $t } from '@/locales';
import { saveSystemConfig, type SystemConfig } from './api';

defineOptions({
  name: 'SystemToolsSystem'
});

const model = reactive<SystemConfig>({
  system: {
    addr: '127.0.0.1:8888',
    dbType: 'mysql',
    ossType: 'local',
    useMultipoint: true,
    useRedis: true,
    useMongo: false,
    limitCount: 10,
    limitTime: 10
  },
  jwt: {
    signingKey: 'qmPlus',
    expiresAt: 24,
    bufferTime: 1,
    issuer: 'gva'
  },
  zap: {
    level: 'info',
    format: 'console',
    prefix: '[GIN-VUE-ADMIN]',
    director: 'log',
    retentionDay: 7,
    showLine: true,
    logInConsole: true
  },
  redis: {
    db: 0,
    addr: '127.0.0.1:6379',
    password: ''
  },
  captcha: {
    keyLong: 6,
    imgWidth: 240,
    imgHeight: 80
  },
  email: {
    to: 'test@example.com',
    port: 465,
    from: 'test@example.com',
    host: 'smtp.example.com',
    isSsl: true,
    secret: ''
  }
});

async function handleSave() {
  const { error } = await saveSystemConfig({ ...model });
  if (!error) window.$message?.success($t('page.systemTools.system.saved'));
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="flex-1 flex-col-stretch sm:p-16px">
      <template #header>
        <span class="text-16px font-500">{{ $t('page.systemTools.system.title') }}</span>
      </template>

      <NTabs type="line" animated>
        <NTabPane name="system" :tab="$t('page.systemTools.system.tabs.system')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.system.addr')">
              <NInput v-model:value="model.system.addr" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.dbType')">
              <NSelect
                v-model:value="model.system.dbType"
                :options="[
                  { label: 'mysql', value: 'mysql' },
                  { label: 'sqlite', value: 'sqlite' },
                  { label: 'postgres', value: 'postgres' },
                  { label: 'sqlserver', value: 'sqlserver' },
                  { label: 'mariadb', value: 'mariadb' }
                ]"
              />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.ossType')">
              <NSelect
                v-model:value="model.system.ossType"
                :options="[
                  { label: 'local', value: 'local' },
                  { label: 'qiniu', value: 'qiniu' },
                  { label: 'aliyun', value: 'aliyun' },
                  { label: 'tencent', value: 'tencent' },
                  { label: 'aws', value: 'aws' },
                  { label: 'cloudflare', value: 'cloudflare' }
                ]"
              />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.useMultipoint')">
              <NSwitch v-model:value="model.system.useMultipoint" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.useRedis')">
              <NSwitch v-model:value="model.system.useRedis" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.useMongo')">
              <NSwitch v-model:value="model.system.useMongo" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.limitCount')">
              <NInputNumber v-model:value="model.system.limitCount" :min="1" :max="100" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.system.limitTime')">
              <NInputNumber v-model:value="model.system.limitTime" :min="1" :max="3600" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="jwt" :tab="$t('page.systemTools.system.tabs.jwt')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.jwt.signingKey')">
              <NInput v-model:value="model.jwt.signingKey" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.jwt.expiresAt')">
              <NInputNumber v-model:value="model.jwt.expiresAt" :min="1" :max="240" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.jwt.bufferTime')">
              <NInputNumber v-model:value="model.jwt.bufferTime" :min="0" :max="24" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.jwt.issuer')">
              <NInput v-model:value="model.jwt.issuer" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="zap" :tab="$t('page.systemTools.system.tabs.zap')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.zap.level')">
              <NSelect
                v-model:value="model.zap.level"
                :options="[
                  { label: 'info', value: 'info' },
                  { label: 'warn', value: 'warn' },
                  { label: 'error', value: 'error' },
                  { label: 'debug', value: 'debug' }
                ]"
              />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.format')">
              <NSelect
                v-model:value="model.zap.format"
                :options="[
                  { label: 'console', value: 'console' },
                  { label: 'json', value: 'json' }
                ]"
              />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.prefix')">
              <NInput v-model:value="model.zap.prefix" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.director')">
              <NInput v-model:value="model.zap.director" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.retentionDay')">
              <NInputNumber v-model:value="model.zap.retentionDay" :min="1" :max="365" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.showLine')">
              <NSwitch v-model:value="model.zap.showLine" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.zap.logInConsole')">
              <NSwitch v-model:value="model.zap.logInConsole" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="redis" :tab="$t('page.systemTools.system.tabs.redis')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.redis.db')">
              <NInputNumber v-model:value="model.redis.db" :min="0" :max="15" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.redis.addr')">
              <NInput v-model:value="model.redis.addr" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.redis.password')">
              <NInput v-model:value="model.redis.password" type="password" show-password-on="click" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="captcha" :tab="$t('page.systemTools.system.tabs.captcha')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.captcha.keyLong')">
              <NInputNumber v-model:value="model.captcha.keyLong" :min="3" :max="8" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.captcha.imgWidth')">
              <NInputNumber v-model:value="model.captcha.imgWidth" :min="100" :max="400" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.captcha.imgHeight')">
              <NInputNumber v-model:value="model.captcha.imgHeight" :min="40" :max="200" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="email" :tab="$t('page.systemTools.system.tabs.email')">
          <NForm label-placement="left" :label-width="160">
            <NFormItem :label="$t('page.systemTools.system.email.to')">
              <NInput v-model:value="model.email.to" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.email.port')">
              <NInputNumber v-model:value="model.email.port" :min="1" :max="65535" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.email.from')">
              <NInput v-model:value="model.email.from" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.email.host')">
              <NInput v-model:value="model.email.host" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.email.isSsl')">
              <NSwitch v-model:value="model.email.isSsl" />
            </NFormItem>
            <NFormItem :label="$t('page.systemTools.system.email.secret')">
              <NInput v-model:value="model.email.secret" type="password" show-password-on="click" />
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="handleSave">{{ $t('page.systemTools.system.save') }}</NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>
