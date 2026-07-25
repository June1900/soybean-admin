import type { OpsMonitorOperationHistoryLang } from '../types';

const lang: OpsMonitorOperationHistoryLang = {
  title: 'Operation History',
  search: {
    method: 'Method',
    path: 'Path',
    status: 'Status Code',
    createdAtRange: 'Created At',
    search: 'Search',
    reset: 'Reset'
  },
  columns: {
    index: '#',
    operator: 'Operator',
    createdAt: 'Date',
    statusCode: 'Status',
    ip: 'IP',
    requestId: 'Request ID',
    traceId: 'Trace ID',
    deviceId: 'Device ID',
    method: 'Method',
    path: 'Path',
    body: 'Request',
    resp: 'Response',
    operations: 'Actions',
    view: 'View',
    delete: 'Delete'
  },
  detail: {
    title: 'Operation Detail',
    id: 'Record ID',
    operator: 'Operator',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    statusCode: 'Status Code',
    ip: 'IP',
    method: 'Method',
    path: 'Path',
    latency: 'Latency (ms)',
    agent: 'User-Agent',
    errorMessage: 'Error Message',
    body: 'Request Body',
    resp: 'Response Body',
    requestId: 'Request ID',
    traceId: 'Trace ID',
    deviceId: 'Device ID',
    userId: 'User ID',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    close: 'Close'
  },
  statusText: {
    none: '-',
    success: 'Success',
    redirect: 'Redirect',
    clientError: 'Client Error',
    serverError: 'Server Error'
  },
  placeholder: { none: 'None' }
};

export default lang;
