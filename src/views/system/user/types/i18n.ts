/**
 * 用户管理模块的 i18n 文案类型定义。
 *
 * 字段 key 必须与 `../langs/zh-cn.ts` 和 `../langs/en-us.ts` 保持一致。
 * 该类型作为 `App.I18n.Schema['page']['system']['user']` 的唯一来源，
 * `src/typings/app.d.ts` 通过 `import()` 类型引用它。
 */
export interface SystemUserLang {
  title: string;
  userName: string;
  nickName: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  position: string;
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
