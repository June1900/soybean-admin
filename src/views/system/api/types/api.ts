/** 接口资源，ID 为主键 */
export interface Api {
  ID: number;
  path: string;
  apiGroup: string;
  description: string;
  method: string;
  createdAt?: string;
}

/** 新增/编辑接口参数 */
export interface ApiForm {
  ID?: number;
  path: string;
  apiGroup: string;
  description: string;
  method: string;
}

/** 接口列表查询参数 */
export interface ApiListQuery {
  page?: number;
  pageSize?: number;
  path?: string;
  description?: string;
  apiGroup?: string;
  method?: string;
}

/** 接口列表返回结构 */
export interface ApiListResponse {
  list: Api[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** 列表搜索表单模型 */
export interface ApiSearchParams {
  path: string;
  description: string;
  apiGroup: string;
  method: string;
}

/** 接口分组返回结构 */
export interface ApiGroupResponse {
  apiGroupMap: Record<string, string>;
  groups: string[];
}
