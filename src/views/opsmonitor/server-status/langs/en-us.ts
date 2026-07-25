import type { OpsMonitorServerStatusLang } from '../types';

const lang: OpsMonitorServerStatusLang = {
  title: 'Server Status',
  card: {
    cpuAvg: 'CPU Avg',
    memory: 'Memory',
    disk: 'Disk',
    goroutines: 'Goroutines',
    logicalCore: 'Logical Cores',
    physicalCore: 'Physical Cores',
    mountPoints: 'Mount Points'
  },
  cpuLoad: {
    title: 'CPU Core Load',
    core: 'core'
  },
  diskSection: {
    title: 'Disk'
  },
  systemInfo: {
    os: 'OS',
    goVersion: 'Go',
    compiler: 'Compiler',
    logicalCores: 'Logical Cores'
  },
  footer: {
    autoRefresh: 's auto refresh',
    lastUpdate: 'Last updated'
  }
};

export default lang;
