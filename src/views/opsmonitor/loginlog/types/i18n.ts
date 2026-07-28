export interface SystemToolsLoginLogLang {
  title: string;
  search: {
    username: string;
    ip: string;
    status: string;
    createdAtRange: string;
    search: string;
    reset: string;
    success: string;
    fail: string;
  };
  columns: {
    index: string;
    id: string;
    username: string;
    ip: string;
    status: string;
    detail: string;
    agent: string;
    createdAt: string;
    operations: string;
    view: string;
    delete: string;
  };
  detail: {
    title: string;
    id: string;
    username: string;
    userId: string;
    status: string;
    ip: string;
    errorMessage: string;
    agent: string;
    createdAt: string;
    updatedAt: string;
    close: string;
  };
  /** 字段为空时的占位 */
  placeholder: { none: string };
}
