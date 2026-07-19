/** System authority / role (aligned with gin-vue-admin SysAuthority) */
export interface Authority {
  authorityId: string;
  authorityName: string;
  parentId: number;
  /** data scope: 1=all 2=dept&below 3=dept 4=self 5=custom dept */
  dataScope: number;
  children?: Authority[];
  createdAt?: string;
  updatedAt?: string;
}

/** Query params for getAuthorityList (backend returns the full tree, pagination ignored) */
export interface AuthorityListQuery {
  page?: number;
  pageSize?: number;
}

/** getAuthorityList returns the role array (tree) directly */
export type AuthorityListResponse = Authority[];

/** Form payload for create / edit / copy role */
export interface AuthorityForm {
  authorityId: string;
  authorityName: string;
  parentId: number;
  dataScope: number;
}
