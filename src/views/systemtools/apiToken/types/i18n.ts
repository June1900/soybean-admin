/** i18n schema for the apiToken feature */
export interface SystemToolsApiTokenLang {
  title: string;
  search: {
    userId: string;
    status: string;
    valid: string;
    invalid: string;
    search: string;
    reset: string;
  };
  issue: string;
  columns: {
    id: string;
    user: string;
    authorityId: string;
    status: string;
    expiresAt: string;
    remark: string;
    operations: string;
    valid: string;
    invalid: string;
    curl: string;
    invalidate: string;
  };
  drawer: {
    title: string;
    user: string;
    authority: string;
    days: string;
    day1: string;
    day7: string;
    day30: string;
    day90: string;
    permanent: string;
    remark: string;
    submit: string;
    cancel: string;
    selectUser: string;
    selectAuthority: string;
  };
  tokenDialog: {
    title: string;
    warning: string;
    copy: string;
    close: string;
  };
  curlDrawer: {
    title: string;
    headerMode: string;
    cookieMode: string;
    copy: string;
  };
  invalidateConfirm: string;
  invalidateHint: string;
  invalidateSuccess: string;
  issueSuccess: string;
  copySuccess: string;
  pleaseSelectUserAndAuthority: string;
}
