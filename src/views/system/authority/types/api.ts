/** 角色（权限）实体，对应 gin-vue-admin 的 SysAuthority */
export interface Authority {
  authorityId: number;
  authorityName: string;
  parentId: number;
  /** 数据权限范围：1=全部 2=部门及下级 3=部门 4=仅本人 5=自定义部门 */
  dataScope: number;
  /** 默认首页路由名（对应 gin-vue-admin 的 defaultRouter） */
  defaultRouter?: string;
  children?: Authority[];
  createdAt?: string;
  updatedAt?: string;
}

/** 角色列表查询参数（后端返回完整树，分页参数被忽略） */
export interface AuthorityListQuery {
  page?: number;
  pageSize?: number;
}

/** 角色列表直接返回角色数组（树结构） */
export type AuthorityListResponse = Authority[];

/** 新增 / 编辑角色的表单数据 */
export interface AuthorityForm {
  authorityId: number;
  authorityName: string;
  parentId: number;
  dataScope: number;
  /** 默认首页路由名（对应 gin-vue-admin 的 defaultRouter） */
  defaultRouter?: string;
}

/** API 接口项（来自 /api/getAllApis） */
export interface AuthorityApi {
  ID: number;
  path: string;
  description: string;
  apiGroup: string;
  method: string;
}

/** Casbin 权限策略项（path + method） */
export interface AuthorityApiPolicy {
  path: string;
  method: string;
}
