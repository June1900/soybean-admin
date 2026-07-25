import type { OpsMonitorServerStatusLang } from '../types';

const lang: OpsMonitorServerStatusLang = {
  title: '服务器状态',
  card: {
    cpuAvg: 'CPU 平均',
    memory: '内存',
    disk: '磁盘',
    goroutines: 'Goroutines',
    logicalCore: '逻辑核',
    physicalCore: '物理核',
    mountPoints: '个挂载点'
  },
  cpuLoad: {
    title: 'CPU 核心负载',
    core: 'core'
  },
  diskSection: {
    title: '磁盘'
  },
  systemInfo: {
    os: 'OS',
    goVersion: 'Go',
    compiler: '编译器',
    logicalCores: '逻辑核'
  },
  footer: {
    autoRefresh: '秒自动刷新',
    lastUpdate: '最近更新'
  }
};

export default lang;
