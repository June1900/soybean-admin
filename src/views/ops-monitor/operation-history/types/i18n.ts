export interface OpsMonitorOperationHistoryLang {
  title: string;
  search: {
    method: string;
    path: string;
    status: string;
    createdAtRange: string;
    search: string;
    reset: string;
  };
  columns: {
    index: string;
    operator: string;
    createdAt: string;
    statusCode: string;
    ip: string;
    requestId: string;
    traceId: string;
    deviceId: string;
    method: string;
    path: string;
    body: string;
    resp: string;
    operations: string;
    view: string;
    delete: string;
  };
  detail: {
    title: string;
    id: string;
    operator: string;
    createdAt: string;
    updatedAt: string;
    statusCode: string;
    ip: string;
    method: string;
    path: string;
    latency: string;
    agent: string;
    errorMessage: string;
    body: string;
    resp: string;
    requestId: string;
    traceId: string;
    deviceId: string;
    userId: string;
    copy: string;
    copied: string;
    close: string;
  };
  /** 状态码显示文案映射 */
  statusText: { none: string; success: string; redirect: string; clientError: string; serverError: string };
  /** 设备ID为空时的占位 */
  placeholder: { none: string };
}
