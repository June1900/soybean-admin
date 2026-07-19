/** A department. `ID` is the primary key. */
export interface Department {
  ID: number;
  name: string;
  parentId: number;
  leader: string;
  sort: number;
  status: number;
  children?: Department[];
}

/** Payload for creating / updating a department. */
export interface DepartmentForm {
  ID?: number;
  name: string;
  parentId: number;
  leader: string;
  sort: number;
  status: number;
}

/** Query params for getDepartmentList */
export interface DepartmentListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
}

/** Response of getDepartmentList */
export interface DepartmentListResponse {
  list: Department[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Frontend search form model for department list (mapped to DepartmentListQuery in index) */
export interface DepartmentSearchParams {
  name: string;
}
