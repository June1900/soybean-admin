/** System user (aligned with gin-vue-admin SysUser) */
export interface User {
  ID: number;
  uuid?: string;
  userName: string;
  nickName: string;
  phone?: string;
  email?: string;
  authorityIds?: number[];
  headerImg?: string;
  enable: number; // 1=启用 2=禁用
  createdAt?: string;
  updatedAt?: string;
}

/** Query params for getUserList (gin-vue-admin convention) */
export interface UserListQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  enable?: number | null;
}

/** Frontend search form model for user list (mapped to UserListQuery in index) */
export interface UserSearchParams {
  userName: string;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userStatus: Api.Common.EnableStatus | null;
}

/** User list response shape (gin-vue-admin convention) */
export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

/** Form payload for create / edit user */
export interface UserForm {
  ID?: number;
  userName: string;
  nickName: string;
  password?: string; // only required on create
  phone?: string;
  email?: string;
  authorityIds?: number[];
  headerImg?: string;
  enable: number;
}
