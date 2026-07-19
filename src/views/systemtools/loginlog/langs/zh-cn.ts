import type { SystemToolsLoginLogLang } from '../types';

const lang: SystemToolsLoginLogLang = {
  title: '登录日志',
  search: {
    username: '用户名',
    status: '状态',
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
    delete: '删除'
  }
};

export default lang;
