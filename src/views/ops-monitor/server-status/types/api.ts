/** 服务器状态接口类型（POST /system/getServerInfo） */

export interface ServerOSInfo {
  goos: string;
  numCpu: number;
  compiler: string;
  goVersion: string;
  numGoroutine: number;
}

export interface ServerCpuInfo {
  cpus: number[];
  cores: number;
}

export interface ServerRamInfo {
  usedMb: number;
  totalMb: number;
  usedPercent: number;
}

export interface ServerDiskItem {
  mountPoint: string;
  usedMb: number;
  usedGb: number;
  totalMb: number;
  totalGb: number;
  usedPercent: number;
}

export interface ServerInfo {
  os: ServerOSInfo;
  cpu: ServerCpuInfo;
  ram: ServerRamInfo;
  disk: ServerDiskItem[];
}

export interface ServerInfoResponse {
  server: ServerInfo;
}
