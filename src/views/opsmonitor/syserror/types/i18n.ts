export interface SystemToolsSysErrorLang {
  title: string;
  search: {
    form: string;
    info: string;
    search: string;
    reset: string;
  };
  columns: {
    index: string;
    id: string;
    createdAt: string;
    form: string;
    level: string;
    status: string;
    info: string;
    solution: string;
    operations: string;
    view: string;
    delete: string;
  };
  detail: {
    title: string;
    form: string;
    level: string;
    status: string;
    info: string;
    solution: string;
    close: string;
  };
  level: { fatal: string; error: string };
  status: { pending: string; processing: string; done: string; failed: string };
}
