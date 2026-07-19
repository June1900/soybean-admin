/** 客户实体（example 模块，UI-only mock） */
export interface Customer {
  ID: number;
  customerName: string;
  customerPhoneData: string;
  CreatedAt?: string;
}

export interface CustomerListQuery {
  page: number;
  pageSize: number;
  customerName?: string;
  customerPhoneData?: string;
}

export interface CustomerListResponse {
  list: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerForm {
  customerName: string;
  customerPhoneData: string;
}

/** Frontend search form model for customer list (mapped to CustomerListQuery in index) */
export interface CustomerSearchParams {
  customerName: string;
  customerPhoneData: string;
}
