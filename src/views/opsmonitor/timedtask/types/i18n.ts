/** i18n schema for the timedTask feature */
export interface OpsMonitorTimedTaskLang {
  title: string;
  search: {
    name: string;
    executorType: string;
    enabled: string;
    method: string;
    http: string;
    search: string;
    reset: string;
  };
  add: string;
  columns: {
    id: string;
    name: string;
    description: string;
    spec: string;
    executorType: string;
    methodExecutor: string;
    httpExecutor: string;
    enabled: string;
    nextRunAt: string;
    operations: string;
    trigger: string;
    logs: string;
    edit: string;
    delete: string;
    cannotDeleteEnabled: string;
  };
  form: {
    title: string;
    editTitle: string;
    name: string;
    description: string;
    spec: string;
    cronTemplate: string;
    withSeconds: string;
    withSecondsHint: string;
    executor: string;
    methodExecutor: string;
    httpExecutor: string;
    method: string;
    params: string;
    url: string;
    httpMethod: string;
    header: string;
    body: string;
    allowPrivate: string;
    allowPrivateHint: string;
    enabled: string;
    submit: string;
    cancel: string;
    nameRequired: string;
    cronRequired: string;
    jsonError: string;
    createSuccess: string;
    updateSuccess: string;
    getMethodsFailed: string;
  };
  enable: string;
  disable: string;
  triggerSuccess: string;
  deleteConfirm: string;
  deleteSuccess: string;
  log: {
    title: string;
    search: {
      triggerType: string;
      status: string;
      timeRange: string;
      search: string;
      reset: string;
      manual: string;
      auto: string;
      success: string;
      failed: string;
    };
    columns: {
      triggerType: string;
      status: string;
      startedAt: string;
      finishedAt: string;
      duration: string;
      createdAt: string;
      view: string;
    };
    detail: {
      title: string;
      triggerType: string;
      status: string;
      startedAt: string;
      finishedAt: string;
      duration: string;
      createdAt: string;
      error: string;
      output: string;
      close: string;
    };
  };
}
