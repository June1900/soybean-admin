import type { OpsMonitorSysErrorLang } from '../types';

const lang: OpsMonitorSysErrorLang = {
  title: '系统错误日志',
  search: {
    form: '错误来源',
    info: '错误内容',
    createdAtRange: '创建日期',
    search: '搜索',
    reset: '重置'
  },
  columns: {
    index: '序号',
    id: 'ID',
    createdAt: '日期',
    form: '错误来源',
    level: '错误等级',
    status: '处理状态',
    info: '错误内容',
    solution: '解决方案',
    operations: '操作',
    view: '查看',
    delete: '删除',
    solutionBtn: '方案'
  },
  detail: {
    title: '错误详情',
    form: '错误来源',
    level: '错误等级',
    status: '处理状态',
    info: '错误内容',
    solution: '解决方案',
    requestId: '请求 ID',
    traceId: '链路 ID',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    copy: '复制',
    copied: '已复制到剪贴板',
    close: '关闭'
  },
  level: { fatal: '致命错误', error: '一般错误' },
  status: { 未处理: '未处理', 处理中: '处理中', 处理完成: '处理完成', 处理失败: '处理失败' },
  solution: {
    confirmTitle: '提示(Beta)',
    confirmContent:
      '日志将通过 AI-PATH 传输至 GVA AI 用于错误分析，并在 GVA 官方平台短暂存储作为 AI 上下文。是否确认进行 AI 处理？（此功能仅向授权用户开放）',
    confirm: '确认',
    cancel: '取消',
    success: '处理已提交，1 分钟后完成'
  }
};

export default lang;
