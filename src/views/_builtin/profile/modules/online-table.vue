<script setup lang="tsx">
import { computed } from 'vue';
import { NButton, NPopconfirm, NTime } from 'naive-ui';
import type { AxiosResponse } from 'axios';
import type { FlatResponseData } from '@sa/axios';
import { useLoading } from '@sa/hooks';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'OnlineTable'
});

const appStore = useAppStore();
const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading(false);

interface OnlineDevice {
  tokenId: string;
  deviceType: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: string;
}

// 模拟在线设备列表（替代后端 monitor 接口）
const mockOnlineDevices: OnlineDevice[] = [
  {
    tokenId: 't-1001',
    deviceType: 'PC',
    ipaddr: '192.168.1.101',
    loginLocation: '广东省深圳市',
    browser: 'Chrome',
    os: 'Windows 11',
    loginTime: '2024-08-01 09:12:33'
  },
  {
    tokenId: 't-1002',
    deviceType: 'MOBILE',
    ipaddr: '192.168.1.102',
    loginLocation: '广东省深圳市',
    browser: 'Safari',
    os: 'iOS 17',
    loginTime: '2024-08-02 20:45:10'
  }
];

/** 模拟在线设备列表接口 */
function fetchMockOnlineDeviceList(): Promise<
  FlatResponseData<any, Api.Common.PaginatingQueryRecord<OnlineDevice>>
> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: {
          records: mockOnlineDevices,
          current: 1,
          size: 10,
          total: mockOnlineDevices.length
        },
        error: null,
        response: {} as AxiosResponse
      });
    }, 500);
  });
}

const { columns, data, getData, loading } = useNaivePaginatedTable({
  api: () => fetchMockOnlineDeviceList(),
  transform: response => defaultTransform(response),
  columns: () => [
    {
      title: '设备类型',
      key: 'deviceType',
      align: 'center',
      minWidth: 120,
      render: row => row.deviceType
    },
    { title: 'IP地址', key: 'ipaddr', align: 'center', minWidth: 120 },
    { title: '登录地点', key: 'loginLocation', align: 'center', minWidth: 120 },
    { title: '浏览器', key: 'browser', align: 'center', minWidth: 120, render: row => row.browser },
    { title: '操作系统', key: 'os', align: 'center', minWidth: 120, render: row => row.os },
    {
      title: '登录时间',
      key: 'loginTime',
      align: 'center',
      minWidth: 180,
      render: row => <NTime time={row.loginTime ? new Date(row.loginTime) : undefined} format="yyyy-MM-dd HH:mm:ss" />
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      minWidth: 80,
      render: row => (
        <NPopconfirm onPositiveClick={() => forceLogout(row.tokenId)}>
          {{
            trigger: () => (
              <NButton text type="error" class="text-18px" loading={btnLoading.value}>
                <SvgIcon icon="material-symbols:delete-outline" />
              </NButton>
            ),
            default: () => '确定强制下线吗？'
          }}
        </NPopconfirm>
      )
    }
  ]
});

// useNaivePaginatedTable 不返回 scrollX，这里手动计算（与 useNaiveTable 保持一致）
const scrollX = computed(() => {
  return columns.value.reduce((acc, column) => {
    return acc + Number(column.width ?? column.minWidth ?? 120);
  }, 0);
});

/** 强制下线（模拟接口：从本地列表移除） */
async function forceLogout(tokenId: string) {
  startBtnLoading();
  // 模拟强制下线接口
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockOnlineDevices.findIndex(device => device.tokenId === tokenId);
  if (index > -1) {
    mockOnlineDevices.splice(index, 1);
  }
  window.$message?.success('强制下线成功');
  await getData();
  endBtnLoading();
}
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="data"
    size="small"
    :flex-height="!appStore.isMobile"
    :scroll-x="scrollX"
    :loading="loading"
    remote
    :row-key="row => row.tokenId"
    class="h-full"
  />
</template>

<style scoped></style>
