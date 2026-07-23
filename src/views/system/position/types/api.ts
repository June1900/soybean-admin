// 岗位实体，ID 为主键
export interface Position {
  ID: number;
  name: string;
  code: string;
  sort: number;
  // 状态：true 启用，false 禁用
  status: boolean;
  remark: string;
}

// 新增 / 更新岗位的提交数据
export interface PositionForm {
  ID?: number;
  name: string;
  code: string;
  sort: number;
  // 状态：true 启用，false 禁用
  status: boolean;
  remark: string;
}

// 岗位列表查询参数
export interface PositionListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
}

// 岗位列表接口返回结构
export interface PositionListResponse {
  list: Position[];
  total: number;
  page?: number;
  pageSize?: number;
}

// 岗位列表前端搜索条件（对应 PositionListQuery）
export interface PositionSearchParams {
  name: string;
}
