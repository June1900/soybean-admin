import type { SystemToolsSysErrorLang } from '../types';

const lang: SystemToolsSysErrorLang = {
  title: '系统错误日志',
  search: {
    form: '错误来源',
    info: '错误内容',
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
    delete: '删除'
  },
  detail: {
    title: '错误详情',
    form: '错误来源',
    level: '错误等级',
    status: '处理状态',
    info: '错误内容',
    solution: '解决方案',
    close: '关闭'
  },
  level: { fatal: '致命', error: '错误' },
  status: { pending: '未处理', processing: '处理中', done: '处理完成', failed: '处理失败' }
};

export default lang;
