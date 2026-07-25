/** 系统字典，ID 为主键 */
export interface Dictionary {
  ID: number;
  /** 字典名（中） */
  name: string;
  /** 字典名（英） */
  type: string;
  /** 开启 / 停用 */
  status: boolean;
  desc: string;
  parentID?: number | null;
}

/** 新增/修改字典的提交数据 */
export interface DictionaryForm {
  ID?: number;
  name: string;
  type: string;
  status?: boolean;
  desc: string;
  parentID?: number | null;
}

/** 字典分页查询参数（服务端分页） */
export interface DictionaryPageQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: string;
}

/** 字典分页查询返回 */
export interface DictionaryPageResponse {
  list: Dictionary[];
  total: number;
  page: number;
  pageSize: number;
}

/** 字典列表前端搜索表单 */
export interface DictionarySearchParams {
  name: string;
  type: string;
}

/** 字典项，ID 为主键 */
export interface DictionaryDetail {
  ID: number;
  label: string;
  value: string;
  extend?: string;
  status: boolean;
  sort: number;
  parentID?: number | null;
  sysDictionaryID?: number;
  level?: number;
  path?: string;
  disabled?: boolean;
  children?: DictionaryDetail[];
}

/** 新增/修改字典项的提交数据 */
export interface DictionaryDetailForm {
  ID?: number;
  label: string;
  value: string;
  extend?: string;
  status?: boolean;
  sort: number;
  parentID?: number | null;
  sysDictionaryID?: number;
}

/** 字典项树查询参数 */
export interface DictionaryDetailListQuery {
  sysDictionaryID?: number;
}

/** 字典项树查询返回 */
export interface DictionaryDetailTreeResponse {
  list: DictionaryDetail[];
}
