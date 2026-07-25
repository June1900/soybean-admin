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
    delete: string;
  };
}
