export interface OpsMonitorServerStatusLang {
  title: string;
  /** 顶部指标卡片 */
  card: {
    cpuAvg: string;
    memory: string;
    disk: string;
    goroutines: string;
    logicalCore: string;
    physicalCore: string;
    mountPoints: string;
  };
  /** CPU 核心负载 */
  cpuLoad: {
    title: string;
    core: string;
  };
  /** 磁盘 */
  diskSection: {
    title: string;
  };
  /** 底部系统信息 */
  systemInfo: {
    os: string;
    goVersion: string;
    compiler: string;
    logicalCores: string;
  };
  /** 底部刷新提示 */
  footer: {
    autoRefresh: string;
    lastUpdate: string;
  };
}
