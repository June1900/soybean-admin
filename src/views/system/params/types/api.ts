/** A system parameter. `ID` is the primary key. */
export interface Params {
  ID: number;
  name: string;
  key: string;
  value: string;
  desc: string;
}

/** Payload for creating / updating a parameter. */
export interface ParamsForm {
  ID?: number;
  name: string;
  key: string;
  value: string;
  desc: string;
}

/** Query params for getSysParamsList */
export interface ParamsListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  key?: string;
}

/** Response of getSysParamsList */
export interface ParamsListResponse {
  list: Params[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Frontend search form model for params list */
export interface ParamsSearchParams {
  name: string;
  key: string;
}
