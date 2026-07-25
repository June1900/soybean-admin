/**
 * 角色（权限）功能的 i18n 类型声明。
 * 键名必须与 langs/zh-cn.ts、langs/en-us.ts 保持一致；
 * 由 src/typings/app.d.ts 通过 import() 类型引用。
 */
export interface AuthorityLang {
  title: string;
  authorityId: string;
  authorityName: string;
  parentRole: string;
  rootRole: string;
  dataScope: string;
  allData: string;
  deptAndBelow: string;
  deptOnly: string;
  selfOnly: string;
  customDept: string;
  operation: string;
  search: string;
  reset: string;
  addRole: string;
  editRole: string;
  addChildRole: string;
  deleteRole: string;
  setPermission: string;
  assignUser: string;
  permissionTitle: string;
  assignUserTitle: string;
  assignUserNotice: string;
  permissionSuccess: string;
  assignSuccess: string;
  roleMenu: string;
  roleApi: string;
  filterMenu: string;
  filterApiName: string;
  filterApiPath: string;
  defaultHomepage: string;
  groupSuffix: string;
  otherGroup: string;
  assignBtn: string;
  assignBtnTitle: string;
  assignBtnSuccess: string;
  btnName: string;
  btnDesc: string;
  userSearchPlaceholder: string;
  confirmDelete: string;
  selectAll: string;
  colSetting: string;
  refresh: string;
  addSuccess: string;
  editSuccess: string;
  deleteSuccess: string;
  authorityIdPlaceholder: string;
  authorityIdPositiveInt: string;
  authorityNamePlaceholder: string;
  parentRolePlaceholder: string;
}
