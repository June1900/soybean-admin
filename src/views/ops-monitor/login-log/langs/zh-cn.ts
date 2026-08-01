import type { OpsMonitorLoginLogLang } from '../types';

const lang: OpsMonitorLoginLogLang = {
  title: '登录日志',
  search: {
    username: '用户名',
    ip: 'IP',
    status: '状态',
    createdAtRange: '登录时间',
    search: '搜索',
    reset: '重置',
    success: '成功',
    fail: '失败'
  },
  columns: {
    index: '序号',
    id: 'ID',
    username: '用户名',
    ip: '登录IP',
    status: '状态',
    detail: '详情',
    agent: '浏览器/设备',
    createdAt: '登录时间',
    operations: '操作',
    view: '查看',
    delete: '删除'
  },
  detail: {
    title: '登录详情',
    id: '记录ID',
    username: '用户名',
    userId: '用户ID',
    status: '状态',
    ip: '登录IP',
    errorMessage: '详情',
    agent: '浏览器/设备',
    createdAt: '登录时间',
    updatedAt: '更新时间',
    close: '关闭'
  },
  placeholder: { none: '无' }
};

export default lang;
