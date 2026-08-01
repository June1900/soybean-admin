import type { OpsMonitorSysErrorLang } from '../types';

const lang: OpsMonitorSysErrorLang = {
  title: 'System Error Logs',
  search: {
    form: 'Source',
    info: 'Content',
    createdAtRange: 'Created At',
    search: 'Search',
    reset: 'Reset'
  },
  columns: {
    index: '#',
    id: 'ID',
    createdAt: 'Date',
    form: 'Source',
    level: 'Level',
    status: 'Status',
    info: 'Content',
    solution: 'Solution',
    operations: 'Actions',
    view: 'View',
    delete: 'Delete',
    solutionBtn: 'AI Solve'
  },
  detail: {
    title: 'Error Detail',
    form: 'Source',
    level: 'Level',
    status: 'Status',
    info: 'Content',
    solution: 'Solution',
    requestId: 'Request ID',
    traceId: 'Trace ID',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    close: 'Close'
  },
  level: { fatal: 'Fatal', error: 'Error' },
  status: { 未处理: 'Pending', 处理中: 'Processing', 处理完成: 'Done', 处理失败: 'Failed' },
  solution: {
    confirmTitle: 'Tip (Beta)',
    confirmContent:
      'The log will be sent to GVA AI via AI-PATH for error analysis and briefly stored on the official GVA platform as AI context. Confirm AI processing? (Only available to authorized users)',
    confirm: 'Confirm',
    cancel: 'Cancel',
    success: 'Processing submitted, will complete in 1 minute'
  }
};

export default lang;
