<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  useDialog
} from 'naive-ui';
import { $t } from '@/locales';
import {
  fetchSystemConfig,
  reloadSystem,
  testSystemEmail,
  updateSystemConfig,
  type AliyunOssConfig,
  type AwsS3Config,
  type CloudflareR2Config,
  type DatabaseConfig,
  type LocalConfig,
  type DatabaseKey,
  type HuaweiObsConfig,
  type MinioConfig,
  type OssConfig,
  type OssKey,
  type QiniuConfig,
  type SystemConfig,
  type TencentCosConfig
} from './api';

defineOptions({
  name: 'SystemToolsSystem'
});

const dialog = useDialog();

const loading = ref(true);
const updating = ref(false);
const reloading = ref(false);
const testing = ref(false);

const activeKey = ref<
  'basic' | 'switches' | 'jwt' | 'zap' | 'redis' | 'email' | 'database' | 'oss' | 'mongo' | 'autocode'
>('basic');

const config = reactive<SystemConfig>(createDefaultSystemConfig());

/** 兜底默认值：保证接口未回填或回填缺字段时表单不会访问 undefined。 */
function createDefaultSystemConfig(): SystemConfig {
  return {
    jwt: { 'signing-key': '', 'expires-time': '', 'buffer-time': '', issuer: '' },
    zap: {
      level: 'info',
      prefix: '',
      format: 'console',
      director: '',
      'encode-level': '',
      'stacktrace-key': '',
      'show-line': true,
      'log-in-console': false,
      'retention-day': 0,
      'access-req-body': false,
      'access-resp-data': false,
      'access-req-headers': false,
      'access-log-max-bytes': 0,
      'file-only-modules': []
    },
    redis: { name: '', addr: '', password: '', db: 0, useCluster: false, clusterAddrs: [] },
    'redis-list': [],
    mongo: {
      coll: '',
      options: '',
      database: '',
      username: '',
      password: '',
      'auth-source': '',
      'min-pool-size': 0,
      'max-pool-size': 0,
      'socket-timeout-ms': 0,
      'connect-timeout-ms': 0,
      'is-zap': false,
      hosts: [{ host: '', port: '' }]
    },
    email: {
      to: '',
      from: '',
      host: '',
      secret: '',
      nickname: '',
      port: 0,
      'is-ssl': false,
      'is-loginauth': false
    },
    system: {
      'db-type': 'mysql',
      'oss-type': 'local',
      'router-prefix': '',
      addr: 0,
      'iplimit-count': 0,
      'iplimit-time': 0,
      'use-multipoint': false,
      'use-redis': false,
      'use-mongo': false,
      'use-strict-auth': false,
      'disable-auto-migrate': false
    },
    autocode: { web: '', root: '', server: '', module: '', 'ai-path': '' },
    mysql: {
      prefix: '',
      port: '',
      config: '',
      'db-name': '',
      username: '',
      password: '',
      path: '',
      engine: '',
      'log-mode': '',
      'max-idle-conns': 0,
      'max-open-conns': 0,
      'conn-max-lifetime': 0,
      singular: false
    },
    mssql: {
      prefix: '',
      port: '',
      config: '',
      'db-name': '',
      username: '',
      password: '',
      path: '',
      engine: '',
      'log-mode': '',
      'max-idle-conns': 0,
      'max-open-conns': 0,
      'conn-max-lifetime': 0,
      singular: false
    },
    pgsql: {
      prefix: '',
      port: '',
      config: '',
      'db-name': '',
      username: '',
      password: '',
      path: '',
      engine: '',
      'log-mode': '',
      'max-idle-conns': 0,
      'max-open-conns': 0,
      'conn-max-lifetime': 0,
      singular: false
    },
    oracle: {
      prefix: '',
      port: '',
      config: '',
      'db-name': '',
      username: '',
      password: '',
      path: '',
      engine: '',
      'log-mode': '',
      'max-idle-conns': 0,
      'max-open-conns': 0,
      'conn-max-lifetime': 0,
      singular: false
    },
    sqlite: {
      prefix: '',
      port: '',
      config: '',
      'db-name': '',
      username: '',
      password: '',
      path: '',
      engine: '',
      'log-mode': '',
      'max-idle-conns': 0,
      'max-open-conns': 0,
      'conn-max-lifetime': 0,
      singular: false
    },
    'db-list': [],
    local: { path: '', 'store-path': '' },
    qiniu: {
      zone: '',
      bucket: '',
      'img-path': '',
      'access-key': '',
      'secret-key': '',
      'use-https': false,
      'use-cdn-domains': false
    },
    'aliyun-oss': {
      endpoint: '',
      'access-key-id': '',
      'access-key-secret': '',
      'bucket-name': '',
      'bucket-url': '',
      'base-path': ''
    },
    'hua-wei-obs': { path: '', bucket: '', endpoint: '', 'access-key': '', 'secret-key': '' },
    'tencent-cos': {
      bucket: '',
      region: '',
      'secret-id': '',
      'secret-key': '',
      'base-url': '',
      'path-prefix': ''
    },
    'aws-s3': {
      bucket: '',
      region: '',
      endpoint: '',
      'secret-id': '',
      'secret-key': '',
      'base-url': '',
      'path-prefix': '',
      's3-force-path-style': false,
      'disable-ssl': false
    },
    'cloudflare-r2': {
      bucket: '',
      'base-url': '',
      path: '',
      'account-id': '',
      'access-key-id': '',
      'secret-access-key': ''
    },
    minio: {
      endpoint: '',
      'access-key-id': '',
      'access-key-secret': '',
      'bucket-name': '',
      'use-ssl': false,
      'base-path': '',
      'bucket-url': ''
    },
    media: { 'chunk-dir': '', 'max-file-size': 0, 'session-ttl': 0 },
    'disk-list': [{ 'mount-point': '' }],
    cors: {
      mode: '',
      whitelist: []
    },
    mcp: {
      name: '',
      version: '',
      path: '',
      addr: 0,
      base_url: '',
      upstream_base_url: '',
      auth_header: '',
      request_timeout: 0
    },
    'api-decrypt': {
      enabled: false,
      'header-flag': '',
      'public-key': '',
      'private-key': '',
      'always-encrypt-paths': null
    },
    app: { node: '', 'app-id': '', env: '' }
  };
}

const dbTypeOptions: { label: string; value: DatabaseKey }[] = [
  { label: 'mysql', value: 'mysql' },
  { label: 'mssql', value: 'mssql' },
  { label: 'pgsql', value: 'pgsql' },
  { label: 'oracle', value: 'oracle' },
  { label: 'sqlite', value: 'sqlite' }
];

const ossTypeOptions: { label: string; value: OssKey }[] = [
  { label: 'local', value: 'local' },
  { label: 'qiniu', value: 'qiniu' },
  { label: 'aliyun-oss', value: 'aliyun-oss' },
  { label: 'hua-wei-obs', value: 'hua-wei-obs' },
  { label: 'tencent-cos', value: 'tencent-cos' },
  { label: 'aws-s3', value: 'aws-s3' },
  { label: 'cloudflare-r2', value: 'cloudflare-r2' },
  { label: 'minio', value: 'minio' }
];

const zapLevelOptions = [
  { label: 'off', value: 'off' },
  { label: 'fatal', value: 'fatal' },
  { label: 'error', value: 'error' },
  { label: 'warn', value: 'warn' },
  { label: 'info', value: 'info' },
  { label: 'debug', value: 'debug' },
  { label: 'trace', value: 'trace' }
];

const zapFormatOptions = [
  { label: 'console', value: 'console' },
  { label: 'json', value: 'json' }
];

const activeDbKey = computed<DatabaseKey>(() => (config.system?.['db-type'] as DatabaseKey) || 'mysql');
const activeOssKey = computed<OssKey>(() => (config.system?.['oss-type'] as OssKey) || 'local');

function dbConfig(): DatabaseConfig {
  switch (activeDbKey.value) {
    case 'mysql':
      return config.mysql;
    case 'mssql':
      return config.mssql;
    case 'pgsql':
      return config.pgsql;
    case 'oracle':
      return config.oracle;
    case 'sqlite':
      return config.sqlite;
  }
}
function ossConfig(): OssConfig {
  return config[activeOssKey.value];
}

function commaToArray(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

async function initForm() {
  loading.value = true;
  const { data, error } = await fetchSystemConfig();
  if (!error && data) {
    Object.assign(config, data.config);
  }
  loading.value = false;
}

onMounted(initForm);

function handleReload() {
  dialog.warning({
    title: $t('page.systemTools.system.common.reloadConfirmTitle'),
    content: $t('page.systemTools.system.common.reloadConfirmContent'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      reloading.value = true;
      const { error } = await reloadSystem();
      reloading.value = false;
      if (!error) window.$message?.success($t('page.systemTools.system.action.reloaded'));
    }
  });
}

async function handleUpdate() {
  updating.value = true;
  const { error } = await updateSystemConfig({ ...config });
  updating.value = false;
  if (!error) window.$message?.success($t('page.systemTools.system.action.updated'));
}

async function handleTestEmail() {
  testing.value = true;
  const { error } = await testSystemEmail();
  testing.value = false;
  if (!error) window.$message?.success($t('page.systemTools.system.email.testSuccess'));
  else window.$message?.error($t('page.systemTools.system.common.emailTestFailed'));
}

function generateSigningKey() {
  const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  config.jwt['signing-key'] = uuid;
}

function switchMenu(key: typeof activeKey.value) {
  if (key === 'redis' && !config.system?.['use-redis']) return;
  if (key === 'mongo' && !config.system?.['use-mongo']) return;
  activeKey.value = key;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper flex-1 flex-col-stretch sm:p-16px">
      <template #header>
        <span class="text-16px font-500">{{ $t('page.systemTools.system.title') }}</span>
      </template>

      <div v-if="loading" class="py-80px text-center text-14px text-gray-400">Loading...</div>

      <div v-else class="config-layout">
        <aside class="config-menu">
          <div class="menu-group">
            <div class="menu-group-title">{{ $t('page.systemTools.system.menu.system') }}</div>
            <div class="menu-item" :class="{ on: activeKey === 'basic' }" @click="switchMenu('basic')">
              {{ $t('page.systemTools.system.menu.basic') }}
            </div>
            <div class="menu-item" :class="{ on: activeKey === 'switches' }" @click="switchMenu('switches')">
              {{ $t('page.systemTools.system.menu.switches') }}
            </div>
          </div>
          <div class="menu-group">
            <div class="menu-group-title">{{ $t('page.systemTools.system.menu.service') }}</div>
            <div class="menu-item" :class="{ on: activeKey === 'jwt' }" @click="switchMenu('jwt')">
              {{ $t('page.systemTools.system.menu.jwt') }}
            </div>
            <div class="menu-item" :class="{ on: activeKey === 'zap' }" @click="switchMenu('zap')">
              {{ $t('page.systemTools.system.menu.zap') }}
            </div>
            <div
              v-if="config.system?.['use-redis']"
              class="menu-item"
              :class="{ on: activeKey === 'redis' }"
              @click="switchMenu('redis')"
            >
              {{ $t('page.systemTools.system.menu.redis') }}
            </div>
            <div class="menu-item" :class="{ on: activeKey === 'email' }" @click="switchMenu('email')">
              {{ $t('page.systemTools.system.menu.email') }}
            </div>
          </div>
          <div class="menu-group">
            <div class="menu-group-title">{{ $t('page.systemTools.system.menu.storage') }}</div>
            <div class="menu-item" :class="{ on: activeKey === 'database' }" @click="switchMenu('database')">
              {{ $t('page.systemTools.system.menu.database') }}
            </div>
            <div class="menu-item" :class="{ on: activeKey === 'oss' }" @click="switchMenu('oss')">
              {{ $t('page.systemTools.system.menu.oss') }}
            </div>
            <div
              v-if="config.system?.['use-mongo']"
              class="menu-item"
              :class="{ on: activeKey === 'mongo' }"
              @click="switchMenu('mongo')"
            >
              {{ $t('page.systemTools.system.menu.mongo') }}
            </div>
          </div>
          <div class="menu-group">
            <div class="menu-group-title">{{ $t('page.systemTools.system.menu.other') }}</div>
            <div class="menu-item" :class="{ on: activeKey === 'autocode' }" @click="switchMenu('autocode')">
              {{ $t('page.systemTools.system.menu.autocode') }}
            </div>
          </div>
        </aside>

        <div class="config-content">
          <div class="action-bar">
            <NSpace :size="12">
              <NButton type="primary" :loading="updating" @click="handleUpdate">
                {{ $t('page.systemTools.system.action.update') }}
              </NButton>
              <NButton :loading="reloading" @click="handleReload">
                {{ $t('page.systemTools.system.action.reload') }}
              </NButton>
            </NSpace>
          </div>

          <NForm label-placement="left" :label-width="160">
            <!-- 基础设置 -->
            <section v-if="activeKey === 'basic'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.basic.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.basic.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.basic.port')">
                <NInputNumber v-model:value="config.system.addr" :min="1" :max="65535" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.basic.dbType')">
                <NSelect v-model:value="config.system['db-type']" :options="dbTypeOptions" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.basic.ossType')">
                <NSelect v-model:value="config.system['oss-type']" :options="ossTypeOptions" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.basic.limitCount')">
                <NInputNumber v-model:value="config.system['iplimit-count']" :min="0" :max="100000" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.basic.limitTime')">
                <NInputNumber v-model:value="config.system['iplimit-time']" :min="0" :max="86400" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.basic.routerPrefix')">
                <NInput v-model:value="config.system['router-prefix']" />
              </NFormItem>
            </section>

            <!-- 功能开关 -->
            <section v-if="activeKey === 'switches'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.switches.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.switches.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.switches.multipoint')">
                <NSwitch v-model:value="config.system['use-multipoint']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.switches.redis')">
                <NSwitch v-model:value="config.system['use-redis']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.switches.mongo')">
                <NSwitch v-model:value="config.system['use-mongo']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.switches.strictAuth')">
                <NSwitch v-model:value="config.system['use-strict-auth']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.switches.disableAutoMigrate')">
                <NSwitch v-model:value="config.system['disable-auto-migrate']" />
              </NFormItem>
            </section>

            <!-- JWT -->
            <section v-if="activeKey === 'jwt'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.jwt.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.jwt.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.jwt.signingKey')">
                <NInputGroup>
                  <NInput v-model:value="config.jwt['signing-key']" />
                  <NButton type="primary" ghost @click="generateSigningKey">
                    {{ $t('page.systemTools.system.jwt.generate') }}
                  </NButton>
                </NInputGroup>
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.jwt.expiresTime')">
                <NInput v-model:value="config.jwt['expires-time']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.jwt.bufferTime')">
                <NInput v-model:value="config.jwt['buffer-time']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.jwt.issuer')">
                <NInput v-model:value="config.jwt.issuer" />
              </NFormItem>
            </section>

            <!-- Zap -->
            <section v-if="activeKey === 'zap'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.zap.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.zap.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.zap.level')">
                <NSelect v-model:value="config.zap.level" :options="zapLevelOptions" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.format')">
                <NSelect v-model:value="config.zap.format" :options="zapFormatOptions" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.encodeLevel')">
                <NInput v-model:value="config.zap['encode-level']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.stacktraceKey')">
                <NInput v-model:value="config.zap['stacktrace-key']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.prefix')">
                <NInput v-model:value="config.zap.prefix" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.director')">
                <NInput v-model:value="config.zap.director" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.retentionDay')">
                <NInputNumber v-model:value="config.zap['retention-day']" :min="-1" :max="365" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.showLine')">
                <NSwitch v-model:value="config.zap['show-line']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.logInConsole')">
                <NSwitch v-model:value="config.zap['log-in-console']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.accessReqBody')">
                <NSwitch v-model:value="config.zap['access-req-body']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.accessRespData')">
                <NSwitch v-model:value="config.zap['access-resp-data']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.accessReqHeaders')">
                <NSwitch v-model:value="config.zap['access-req-headers']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.maxBytes')">
                <NInputNumber v-model:value="config.zap['access-log-max-bytes']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.zap.fileOnlyModules')">
                <NInput
                  :value="(config.zap['file-only-modules'] || []).join(', ')"
                  @update:value="val => (config.zap['file-only-modules'] = commaToArray(val || ''))"
                />
              </NFormItem>
            </section>

            <!-- Redis -->
            <section v-if="activeKey === 'redis'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.redis.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.redis.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.redis.name')">
                <NInput v-model:value="config.redis.name" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.redis.addr')">
                <NInput v-model:value="config.redis.addr" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.redis.password')">
                <NInput v-model:value="config.redis.password" type="password" show-password-on="click" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.redis.db')">
                <NInputNumber v-model:value="config.redis.db" :min="0" :max="15" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.redis.useCluster')">
                <NSwitch v-model:value="config.redis.useCluster" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.redis.clusterAddrs')">
                <NInput
                  :value="(config.redis.clusterAddrs || []).join(', ')"
                  @update:value="val => (config.redis.clusterAddrs = commaToArray(val || ''))"
                />
              </NFormItem>
            </section>

            <!-- Email -->
            <section v-if="activeKey === 'email'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.email.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.email.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.email.to')">
                <NInput v-model:value="config.email.to" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.from')">
                <NInput v-model:value="config.email.from" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.nickname')">
                <NInput v-model:value="config.email.nickname" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.host')">
                <NInput v-model:value="config.email.host" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.port')">
                <NInputNumber v-model:value="config.email.port" :min="1" :max="65535" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.secret')">
                <NInput v-model:value="config.email.secret" type="password" show-password-on="click" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.isSsl')">
                <NSwitch v-model:value="config.email['is-ssl']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.email.isLoginauth')">
                <NSwitch v-model:value="config.email['is-loginauth']" />
              </NFormItem>
              <NFormItem>
                <NButton :loading="testing" @click="handleTestEmail">
                  {{ $t('page.systemTools.system.email.test') }}
                </NButton>
              </NFormItem>
            </section>

            <!-- Database -->
            <section v-if="activeKey === 'database'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.database.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.database.desc') }}（{{ activeDbKey }}）</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.database.username')">
                <NInput v-model:value="dbConfig().username" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.password')">
                <NInput v-model:value="dbConfig().password" type="password" show-password-on="click" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.address')">
                <NInput v-model:value="dbConfig().path" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.port')">
                <NInput v-model:value="dbConfig().port" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.database')">
                <NInput v-model:value="dbConfig()['db-name']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.prefix')">
                <NInput v-model:value="dbConfig().prefix" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.config')">
                <NInput v-model:value="dbConfig().config" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.engine')">
                <NInput v-model:value="dbConfig().engine" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.logMode')">
                <NInput v-model:value="dbConfig()['log-mode']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.singular')">
                <NSwitch v-model:value="dbConfig().singular" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.maxIdleConns')">
                <NInputNumber v-model:value="dbConfig()['max-idle-conns']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.maxOpenConns')">
                <NInputNumber v-model:value="dbConfig()['max-open-conns']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.database.connMaxLifetime')">
                <NInputNumber v-model:value="dbConfig()['conn-max-lifetime']" :min="0" />
              </NFormItem>
            </section>

            <!-- OSS -->
            <section v-if="activeKey === 'oss'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.oss.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.oss.desc') }}（{{ activeOssKey }}）</p>
                </div>
              </div>

              <template v-if="activeOssKey === 'local'">
                <NFormItem :label="$t('page.systemTools.system.oss.localPath')">
                  <NInput v-model:value="(ossConfig() as LocalConfig).path" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.storePath')">
                  <NInput v-model:value="(ossConfig() as LocalConfig)['store-path']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'qiniu'">
                <NFormItem :label="$t('page.systemTools.system.oss.zone')">
                  <NInput v-model:value="(ossConfig() as QiniuConfig).zone" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucket')">
                  <NInput v-model:value="(ossConfig() as QiniuConfig).bucket" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.imgPath')">
                  <NInput v-model:value="(ossConfig() as QiniuConfig)['img-path']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKey')">
                  <NInput v-model:value="(ossConfig() as QiniuConfig)['access-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.secretKey')">
                  <NInput v-model:value="(ossConfig() as QiniuConfig)['secret-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.useHttps')">
                  <NSwitch v-model:value="(ossConfig() as QiniuConfig)['use-https']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.useCdnDomains')">
                  <NSwitch v-model:value="(ossConfig() as QiniuConfig)['use-cdn-domains']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'aliyun-oss'">
                <NFormItem :label="$t('page.systemTools.system.oss.endpoint')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig).endpoint" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeyId')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig)['access-key-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeySecret')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig)['access-key-secret']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucketName')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig)['bucket-name']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucketUrl')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig)['bucket-url']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.basePath')">
                  <NInput v-model:value="(ossConfig() as AliyunOssConfig)['base-path']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'hua-wei-obs'">
                <NFormItem :label="$t('page.systemTools.system.oss.path')">
                  <NInput v-model:value="(ossConfig() as HuaweiObsConfig).path" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucket')">
                  <NInput v-model:value="(ossConfig() as HuaweiObsConfig).bucket" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.endpoint')">
                  <NInput v-model:value="(ossConfig() as HuaweiObsConfig).endpoint" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKey')">
                  <NInput v-model:value="(ossConfig() as HuaweiObsConfig)['access-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.secretKey')">
                  <NInput v-model:value="(ossConfig() as HuaweiObsConfig)['secret-key']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'tencent-cos'">
                <NFormItem :label="$t('page.systemTools.system.oss.bucket')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig).bucket" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.region')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig).region" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.secretAccessKey')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig)['secret-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeyId')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig)['secret-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.baseUrl')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig)['base-url']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.pathPrefix')">
                  <NInput v-model:value="(ossConfig() as TencentCosConfig)['path-prefix']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'aws-s3'">
                <NFormItem :label="$t('page.systemTools.system.oss.bucket')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config).bucket" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.region')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config).region" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.endpoint')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config).endpoint" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeyId')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config)['secret-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeySecret')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config)['secret-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.baseUrl')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config)['base-url']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.pathPrefix')">
                  <NInput v-model:value="(ossConfig() as AwsS3Config)['path-prefix']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.forcePathStyle')">
                  <NSwitch v-model:value="(ossConfig() as AwsS3Config)['s3-force-path-style']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.disableSsl')">
                  <NSwitch v-model:value="(ossConfig() as AwsS3Config)['disable-ssl']" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'cloudflare-r2'">
                <NFormItem :label="$t('page.systemTools.system.oss.bucket')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config).bucket" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accountId')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config)['account-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeyId')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config)['access-key-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeySecret')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config)['secret-access-key']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.baseUrl')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config)['base-url']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.path')">
                  <NInput v-model:value="(ossConfig() as CloudflareR2Config).path" />
                </NFormItem>
              </template>

              <template v-else-if="activeOssKey === 'minio'">
                <NFormItem :label="$t('page.systemTools.system.oss.endpoint')">
                  <NInput v-model:value="(ossConfig() as MinioConfig).endpoint" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeyId')">
                  <NInput v-model:value="(ossConfig() as MinioConfig)['access-key-id']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.accessKeySecret')">
                  <NInput v-model:value="(ossConfig() as MinioConfig)['access-key-secret']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucketName')">
                  <NInput v-model:value="(ossConfig() as MinioConfig)['bucket-name']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.bucketUrl')">
                  <NInput v-model:value="(ossConfig() as MinioConfig)['bucket-url']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.basePath')">
                  <NInput v-model:value="(ossConfig() as MinioConfig)['base-path']" />
                </NFormItem>
                <NFormItem :label="$t('page.systemTools.system.oss.useSsl')">
                  <NSwitch v-model:value="(ossConfig() as MinioConfig)['use-ssl']" />
                </NFormItem>
              </template>
            </section>

            <!-- Mongo -->
            <section v-if="activeKey === 'mongo'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.mongo.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.mongo.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.mongo.database')">
                <NInput v-model:value="config.mongo.database" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.coll')">
                <NInput v-model:value="config.mongo.coll" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.options')">
                <NInput v-model:value="config.mongo.options" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.username')">
                <NInput v-model:value="config.mongo.username" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.password')">
                <NInput v-model:value="config.mongo.password" type="password" show-password-on="click" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.authSource')">
                <NInput v-model:value="config.mongo['auth-source']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.minPoolSize')">
                <NInputNumber v-model:value="config.mongo['min-pool-size']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.maxPoolSize')">
                <NInputNumber v-model:value="config.mongo['max-pool-size']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.socketTimeout')">
                <NInputNumber v-model:value="config.mongo['socket-timeout-ms']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.connectTimeout')">
                <NInputNumber v-model:value="config.mongo['connect-timeout-ms']" :min="0" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.isZap')">
                <NSwitch v-model:value="config.mongo['is-zap']" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.mongo.hosts')">
                <div class="w-full">
                  <div
                    v-for="(host, index) in config.mongo.hosts"
                    :key="index"
                    class="mb-8px flex items-center gap-8px"
                  >
                    <NInput v-model:value="host.host" placeholder="host" class="flex-1" />
                    <NInput v-model:value="host.port" placeholder="port" class="w-120px" />
                    <NButton
                      type="error"
                      size="small"
                      ghost
                      :disabled="config.mongo.hosts.length <= 1"
                      @click="config.mongo.hosts.splice(index, 1)"
                    >
                      -
                    </NButton>
                  </div>
                  <NButton size="small" dashed @click="config.mongo.hosts.push({ host: '', port: '' })">+</NButton>
                </div>
              </NFormItem>
            </section>

            <!-- AutoCode -->
            <section v-if="activeKey === 'autocode'" class="config-section">
              <div class="section-header">
                <span class="section-bar"></span>
                <div>
                  <h3 class="section-title">{{ $t('page.systemTools.system.autocode.title') }}</h3>
                  <p class="section-desc">{{ $t('page.systemTools.system.autocode.desc') }}</p>
                </div>
              </div>
              <NFormItem :label="$t('page.systemTools.system.autocode.root')">
                <NInput v-model:value="config.autocode.root" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.autocode.server')">
                <NInput v-model:value="config.autocode.server" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.autocode.web')">
                <NInput v-model:value="config.autocode.web" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.autocode.module')">
                <NInput v-model:value="config.autocode.module" />
              </NFormItem>
              <NFormItem :label="$t('page.systemTools.system.autocode.aiPath')">
                <NInput v-model:value="config.autocode['ai-path']" />
              </NFormItem>
            </section>
          </NForm>
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.config-layout {
  @apply flex flex-col gap-4 lg:flex-row lg:gap-0;
}

.config-menu {
  @apply w-full flex-none border-0 border-b border-solid border-[var(--n-border-color)] pb-3 lg:w-44 lg:flex-col lg:gap-0.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4;
}

.menu-group {
  @apply contents lg:block;
}

.menu-group-title {
  @apply hidden px-3 pb-1 pt-3 text-sm font-medium text-[var(--n-text-color-3)] lg:block;
}

.menu-item {
  @apply cursor-pointer select-none rounded-lg px-3 py-1.5 text-[13px] transition-colors hover:bg-[rgb(var(--n-primary-color-rgb)/0.08)] lg:py-2;
}

.menu-item.on {
  @apply bg-[rgb(var(--n-primary-color-rgb)/0.12)] font-medium text-[var(--n-color-target)];
}

.config-content {
  @apply min-w-0 flex-1 lg:overflow-y-auto lg:pl-5;
}

.action-bar {
  @apply mb-4 flex justify-end;
}

.config-section {
  @apply mb-6 last:mb-0;
}

.section-header {
  @apply mb-4 flex items-start gap-2.5;
}

.section-bar {
  @apply mt-1 h-4 w-1 rounded-full bg-[var(--n-color-target)];
}

.section-title {
  @apply m-0 text-[15px] font-semibold leading-5;
}

.section-desc {
  @apply m-0 mt-1 text-xs text-[var(--n-text-color-3)];
}
</style>
