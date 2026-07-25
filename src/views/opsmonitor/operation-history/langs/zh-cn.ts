import type { OpsMonitorOperationHistoryLang } from '../types';

const lang: OpsMonitorOperationHistoryLang = {
  title: '操作历史',
  search: {
    method: '请求方法',
    path: '请求路径',
    status: '结果状态码',
    createdAtRange: '创建日期',
    search: '搜索',
    reset: '重置'
  },
  columns: {
    index: '序号',
    operator: '操作人',
    createdAt: '日期',
    statusCode: '状态码',
    ip: '请求IP',
    requestId: '请求ID',
    traceId: '链路ID',
    deviceId: '设备ID',
    method: '请求方法',
    path: '请求路径',
    body: '请求',
    resp: '响应',
    operations: '操作',
    view: '查看',
    delete: '删除'
  },
  detail: {
    title: '操作详情',
    id: '记录ID',
    operator: '操作人',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    statusCode: '状态码',
    ip: '请求IP',
    method: '请求方法',
    path: '请求路径',
    latency: '耗时(ms)',
    agent: 'User-Agent',
    errorMessage: '错误信息',
    body: '请求体',
    resp: '响应体',
    requestId: '请求ID',
    traceId: '链路ID',
    deviceId: '设备ID',
    userId: '用户ID',
    copy: '复制',
    copied: '已复制到剪贴板',
    close: '关闭'
  },
  statusText: { none: '-', success: '成功', redirect: '重定向', clientError: '客户端错误', serverError: '服务端错误' },
  placeholder: { none: '无' }
};

export default lang;
