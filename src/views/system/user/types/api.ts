/** 系统用户（与 gin-vue-admin 的 SysUser 对齐） */
export interface User {
  ID: number;
  uuid?: string;
  userName: string;
  nickName: string;
  phone?: string;
  email?: string;
  authorityId?: number;
  authorityIds?: number[];
  /** getUserList 返回的角色列表，每项含 authorityId */
  authorities?: { authorityId?: number | string; authorityName?: string }[];
  /** getUserList 返回的部门列表，每项含 ID 与 name */
  departments?: { ID?: number; name?: string }[];
  /** getUserList 返回的岗位列表，每项含 ID 与 name */
  positions?: { ID?: number; name?: string }[];
  headerImg?: string;
  enable: number; // 1=启用 2=禁用
  createdAt?: string;
  updatedAt?: string;
}

/** getUserList 查询参数（gin-vue-admin 约定） */
export interface UserListQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  enable?: number | null;
}

/** 用户列表前端搜索表单模型（在 index 中映射为 UserListQuery） */
export interface UserSearchParams {
  userName: string;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userStatus: Api.Common.EnableStatus | null;
}

/** 用户列表响应结构（gin-vue-admin 约定） */
export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

/** 新增/编辑用户的表单数据 */
export interface UserForm {
  ID?: number;
  userName: string;
  nickName: string;
  password?: string; // 仅新增时必填
  phone?: string;
  email?: string;
  authorityId?: number;
  authorityIds?: number[];
  headerImg?: string;
  enable: number;
}
