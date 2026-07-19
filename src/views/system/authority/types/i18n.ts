/**
 * i18n schema for the "system authority" (role) feature.
 * Keys MUST match langs/zh-cn.ts & langs/en-us.ts.
 * Referenced from src/typings/app.d.ts via import() type.
 */
export interface AuthorityLang {
  title: string;
  authorityId: string;
  authorityName: string;
  parentRole: string;
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
  copyRole: string;
  addChildRole: string;
  deleteRole: string;
  confirmDelete: string;
  confirmCopy: string;
  selectAll: string;
  colSetting: string;
  refresh: string;
  addSuccess: string;
  editSuccess: string;
  copySuccess: string;
  deleteSuccess: string;
  authorityIdPlaceholder: string;
  authorityNamePlaceholder: string;
}
