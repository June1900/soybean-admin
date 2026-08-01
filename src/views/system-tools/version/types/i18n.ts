export interface SystemToolsVersionLang {
  title: string;
  add: string;
  download: string;
  search: {
    versionName: string;
    versionCode: string;
    search: string;
    reset: string;
  };
  columns: {
    index: string;
    id: string;
    createdAt: string;
    versionName: string;
    versionCode: string;
    description: string;
    operations: string;
    view: string;
    download: string;
    delete: string;
  };
  detail: {
    title: string;
    versionName: string;
    versionCode: string;
    description: string;
    close: string;
  };
  drawer: {
    title: string;
    versionName: string;
    versionCode: string;
    description: string;
    cancel: string;
    submit: string;
  };
}
