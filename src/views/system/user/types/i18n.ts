/**
 * i18n schema for the "system user" feature.
 *
 * Field keys MUST stay in sync with `../langs/zh-cn.ts` and `../langs/en-us.ts`.
 * This type is the single source of truth for `App.I18n.Schema['page']['system']['user']`,
 * which `src/typings/app.d.ts` references via an `import()` type.
 */
export interface SystemUserLang {
  title: string;
  userName: string;
  nickName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  operation: string;
  search: string;
  searchTitle: string;
  reset: string;
  addUser: string;
  editUser: string;
  deleteUser: string;
  batchDelete: string;
  enable: string;
  disable: string;
  confirmDelete: string;
  confirmBatchDelete: string;
  index: string;
  selectAll: string;
  colSetting: string;
  refresh: string;
  userNamePlaceholder: string;
  userNameMinLength: string;
  nickNamePlaceholder: string;
  phonePlaceholder: string;
  phoneInvalid: string;
  emailPlaceholder: string;
  emailInvalid: string;
  rolePlaceholder: string;
  statusPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  passwordRequired: string;
  addSuccess: string;
  editSuccess: string;
  deleteSuccess: string;
}
