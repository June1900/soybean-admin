export interface SystemToolsSysErrorLang {
  title: string;
  search: {
    form: string;
    info: string;
    createdAtRange: string;
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
    solutionBtn: string;
  };
  detail: {
    title: string;
    form: string;
    level: string;
    status: string;
    info: string;
    solution: string;
    requestId: string;
    traceId: string;
    createdAt: string;
    updatedAt: string;
    copy: string;
    copied: string;
    close: string;
  };
  /** level key 映射到中文 tag 标签（fatal / error） */
  level: { fatal: string; error: string };
  /** status 后端字符串直接作为 key，value 是 tag 标签（一般与 key 相同） */
  status: { 未处理: string; 处理中: string; 处理完成: string; 处理失败: string };
  /** AI 方案弹窗文案 */
  solution: {
    confirmTitle: string;
    confirmContent: string;
    confirm: string;
    cancel: string;
    success: string;
  };
}
