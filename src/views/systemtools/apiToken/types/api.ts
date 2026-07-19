/** API Token (aligned with gin-vue-admin SysApiToken) */
export interface ApiToken {
  ID: number;
  user?: { nickName: string; userName: string };
  authorityId?: number;
  status?: boolean;
  expiresAt?: string;
  remark?: string;
  token?: string;
}

/** User option for the issue drawer (user + its authorities) */
export interface ApiTokenUserOption {
  ID: number;
  nickName: string;
  userName: string;
  authorities?: { authorityId: number; authorityName: string }[];
}

/** Query params for getApiTokenList */
export interface ApiTokenListQuery {
  page?: number;
  pageSize?: number;
  userId?: number;
  status?: boolean;
}

/** List response shape (gin-vue-admin convention) */
export interface ApiTokenListResponse {
  list: ApiToken[];
  total: number;
  page: number;
  pageSize: number;
}

/** Form payload for issuing (create) an API token */
export interface ApiTokenForm {
  userId: number;
  authorityId: number;
  days: number;
  remark?: string;
}

/** Frontend search form model for API token list (mapped to ApiTokenListQuery in index) */
export interface ApiTokenSearchParams {
  userId: number | null;
  status: string | null;
}

/** Create response shape (returns the issued JWT) */
export interface ApiTokenCreateResponse {
  token: string;
}
