/** A job position. `ID` is the primary key. */
export interface Position {
  ID: number;
  name: string;
  code: string;
  sort: number;
  status: number;
  remark: string;
}

/** Payload for creating / updating a position. */
export interface PositionForm {
  ID?: number;
  name: string;
  code: string;
  sort: number;
  status: number;
  remark: string;
}

/** Query params for getPositionList */
export interface PositionListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
}

/** Response of getPositionList */
export interface PositionListResponse {
  list: Position[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Frontend search form model for position list (mapped to PositionListQuery in index) */
export interface PositionSearchParams {
  name: string;
}
