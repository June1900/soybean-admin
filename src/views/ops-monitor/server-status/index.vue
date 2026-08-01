<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import { createReusableTemplate } from '@vueuse/core';
import { NCard, NGrid, NGi, NProgress, NSpin, useThemeVars } from 'naive-ui';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import { fetchServerInfo, type ServerInfo } from './api';

defineOptions({
  name: 'OpsMonitorServerStatus'
});

const themeVars = useThemeVars();
const themeStore = useThemeStore();

const loading = ref(false);
const serverInfo = ref<ServerInfo | null>(null);
const lastUpdateTime = ref('');
const refreshInterval = 30; // seconds

/** 计算平均 CPU 使用率 */
function calcCpuAvg(info: ServerInfo): number {
  if (!info.cpu.cpus.length) return 0;
  const sum = info.cpu.cpus.reduce((a, b) => a + b, 0);
  return Math.round((sum / info.cpu.cpus.length) * 10) / 10;
}

async function loadData() {
  loading.value = true;
  try {
    const { data, error } = await fetchServerInfo();
    if (!error && data?.server) {
      serverInfo.value = data.server;
      lastUpdateTime.value = dayjs().format('HH:mm:ss');
    }
  } finally {
    loading.value = false;
  }
}

/* ---------- 自动刷新 ---------- */
let timer: ReturnType<typeof setInterval> | null = null;

function startAutoRefresh() {
  timer = setInterval(() => {
    void loadData();
  }, refreshInterval * 1000);
}

onMounted(() => {
  void loadData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

/* ---------- CPU 进度条颜色 ---------- */
function cpuBarColor(percentage: number): string {
  if (percentage >= 80) return themeVars.value.errorColor;
  if (percentage >= 50) return themeVars.value.warningColor;
  return themeVars.value.primaryColor;
}

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: { start: string; end: string }) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}

interface StatCard {
  key: string;
  title: string;
  value: number;
  decimals: number;
  unit: string;
  sub?: string;
  icon: string;
  gradientColor: string;
}

const cardData = computed<StatCard[]>(() => {
  if (!serverInfo.value) return [];
  const s = serverInfo.value;
  return [
    {
      key: 'cpu',
      title: $t('page.opsMonitor.serverStatus.card.cpuAvg'),
      value: calcCpuAvg(s),
      decimals: 1,
      unit: '%',
      icon: 'ri:line-chart-line',
      gradientColor: getGradientColor({ start: '#56cdf3', end: '#719de3' })
    },
    {
      key: 'mem',
      title: $t('page.opsMonitor.serverStatus.card.memory'),
      value: s.ram.usedPercent,
      decimals: 0,
      unit: '%',
      sub: `${(s.ram.usedMb / 1024).toFixed(1)} / ${(s.ram.totalMb / 1024).toFixed(1)} GB`,
      icon: 'ri:cpu-line',
      gradientColor: getGradientColor({ start: '#7be495', end: '#3bac6e' })
    },
    {
      key: 'disk',
      title: $t('page.opsMonitor.serverStatus.card.disk'),
      value: s.disk[0]?.usedPercent ?? 0,
      decimals: 0,
      unit: '%',
      sub: s.disk[0]?.mountPoint,
      icon: 'ri:database-2-line',
      gradientColor: getGradientColor({ start: '#fcbc25', end: '#f68057' })
    },
    {
      key: 'goroutine',
      title: 'Goroutines',
      value: s.os.numGoroutine,
      decimals: 0,
      unit: '',
      icon: 'logos:go',
      gradientColor: getGradientColor({ start: '#865ec0', end: '#5144b4' })
    }
  ];
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div
        class="h-full px-16px py-14px text-white"
        :style="{ backgroundImage: gradientColor, borderRadius: themeStore.themeRadius + 'px' }"
      >
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>

    <NSpin :show="loading">
      <NCard v-if="serverInfo" :bordered="false" class="card-wrapper">
        <NGrid cols="s:1 m:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
          <NGi v-for="item in cardData" :key="item.key" class="h-full">
            <GradientBg :gradient-color="item.gradientColor" class="flex-1">
              <div class="flex h-full min-h-88px flex-col justify-between">
                <div class="flex items-center justify-between">
                  <h3 class="text-14px font-medium op-80">{{ item.title }}</h3>
                  <SvgIcon :icon="item.icon" class="text-22px op-80" />
                </div>
                <div class="flex flex-col">
                  <div class="flex items-baseline gap-4px">
                    <CountTo :end-value="item.value" :decimals="item.decimals" class="text-30px font-bold text-white" />
                    <span v-if="item.unit" class="text-14px op-80">{{ item.unit }}</span>
                  </div>
                  <div v-if="item.sub" class="pt-2px text-12px op-70">{{ item.sub }}</div>
                </div>
              </div>
            </GradientBg>
          </NGi>
        </NGrid>
      </NCard>
      <div v-else class="h-200px flex-center text-14px c-gray-400"></div>
    </NSpin>

    <!-- ========== CPU + 磁盘 ========== -->
    <div v-if="serverInfo" class="grid grid-cols-[1fr_450px] gap-16px lt-xl:grid-cols-1">
      <NCard
        :title="$t('page.opsMonitor.serverStatus.cpuLoad.title')"
        :bordered="false"
        size="small"
        class="card-wrapper"
      >
        <template #header-extra>
          <span class="text-12px c-gray-400">
            {{ serverInfo.os.numCpu }} {{ $t('page.opsMonitor.serverStatus.card.logicalCore') }} ·
            {{ serverInfo.cpu.cores }} {{ $t('page.opsMonitor.serverStatus.card.physicalCore') }}
          </span>
        </template>

        <div class="grid grid-cols-2 gap-x-24px gap-y-12px">
          <template v-for="(usage, idx) in serverInfo.cpu.cpus" :key="idx">
            <div class="flex items-center gap-8px">
              <span class="w-50px text-12px c-gray-450 shrink-0">
                {{ $t('page.opsMonitor.serverStatus.cpuLoad.core') }} {{ idx }}
              </span>
              <NProgress
                type="line"
                :percentage="Math.round(usage)"
                :show-indicator="false"
                :height="6"
                :border-radius="3"
                :fill="cpuBarColor(usage)"
                rail-color="#eee"
                class="flex-1"
              />
              <span class="w-50px text-right text-12px c-gray-500">{{ Math.round(usage) }}%</span>
            </div>
          </template>
        </div>
      </NCard>

      <!-- 磁盘使用 -->
      <NCard
        :title="$t('page.opsMonitor.serverStatus.diskSection.title')"
        :bordered="false"
        size="small"
        class="card-wrapper"
      >
        <template #header-extra>
          <span class="text-12px c-gray-400">
            {{ serverInfo.disk.length }} {{ $t('page.opsMonitor.serverStatus.card.mountPoints') }}
          </span>
        </template>

        <div v-for="d in serverInfo.disk" :key="d.mountPoint" class="flex flex-col gap-6px">
          <div class="flex items-center gap-8px">
            <span class="w-20px text-12px c-gray-500 shrink-0">{{ d.mountPoint }}</span>
            <NProgress
              type="line"
              :percentage="d.usedPercent"
              :show-indicator="false"
              :height="10"
              :border-radius="5"
              :fill="d.usedPercent >= 80 ? themeVars.errorColor : themeVars.primaryColor"
              rail-color="#eee"
              class="flex-1"
            />
          </div>
          <div class="pl-28px text-12px c-gray-400">{{ d.usedGb }} / {{ d.totalGb }} GB · {{ d.usedPercent }}%</div>
        </div>
      </NCard>
    </div>

    <!--  系统信息  -->
    <div v-if="serverInfo" class="flex items-center gap-24px text-13px c-gray-500 lt-sm:flex-wrap">
      <span>{{ $t('page.opsMonitor.serverStatus.systemInfo.os') }} {{ serverInfo.os.goos }}</span>
      <span>{{ $t('page.opsMonitor.serverStatus.systemInfo.goVersion') }} {{ serverInfo.os.goVersion }}</span>
      <span>{{ $t('page.opsMonitor.serverStatus.systemInfo.compiler') }} {{ serverInfo.os.compiler }}</span>
      <span>{{ $t('page.opsMonitor.serverStatus.systemInfo.logicalCores') }} {{ serverInfo.os.numCpu }}</span>
    </div>

    <!--  刷新提示  -->
    <div v-if="lastUpdateTime" class="text-right text-12px c-gray-350">
      {{ refreshInterval }} {{ $t('page.opsMonitor.serverStatus.footer.autoRefresh') }} ·
      {{ $t('page.opsMonitor.serverStatus.footer.lastUpdate') }} {{ lastUpdateTime }}
    </div>
  </div>
</template>
