/** 系统参数实体 */
export interface Params {
  ID: number;
  name: string;
  key: string;
  value: string;
  desc: string;
}

/** 新增/编辑提交体 */
export interface ParamsForm {
  ID?: number;
  name: string;
  key: string;
  value: string;
  desc: string;
}

/** 列表查询参数 */
export interface ParamsListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  key?: string;
}

/** 列表响应 */
export interface ParamsListResponse {
  list: Params[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** 搜索表单 */
export interface ParamsSearchParams {
  name: string;
  key: string;
}
