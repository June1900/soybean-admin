/** An API resource managed by the system. `ID` is the primary key. */
export interface Api {
  ID: number;
  path: string;
  apiGroup: string;
  description: string;
  method: string;
  createdAt?: string;
}

/** Payload for creating / updating an API. */
export interface ApiForm {
  ID?: number;
  path: string;
  apiGroup: string;
  description: string;
  method: string;
}

/** Query params for getApiList */
export interface ApiListQuery {
  page?: number;
  pageSize?: number;
  path?: string;
  apiGroup?: string;
  method?: string;
}

/** Response of getApiList */
export interface ApiListResponse {
  list: Api[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Frontend search form model for api list */
export interface ApiSearchParams {
  path: string;
  apiGroup: string;
  method: string;
}
