import type { FlatResponseData } from '@sa/axios';
import type { Customer, CustomerForm, CustomerListQuery, CustomerListResponse } from './types';

export type { Customer, CustomerForm, CustomerListQuery, CustomerListResponse, CustomerSearchParams } from './types';

/** UI-only：本地 mock 数据，不对接真实接口 */
const mockCustomers: Customer[] = Array.from({ length: 23 }).map((_, i) => ({
  ID: i + 1,
  customerName: `客户 ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  customerPhoneData: `138${String(10000000 + i * 137).slice(0, 8)}`,
  CreatedAt: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 19).replace('T', ' ')
}));

function resolve<T>(data: T): FlatResponseData<any, T> {
  return { data, error: null } as unknown as FlatResponseData<any, T>;
}

export async function fetchCustomerList(params: CustomerListQuery): Promise<FlatResponseData<any, CustomerListResponse>> {
  const filtered = mockCustomers.filter(c => {
    if (params.customerName && !c.customerName.includes(params.customerName)) return false;
    if (params.customerPhoneData && !c.customerPhoneData.includes(params.customerPhoneData)) return false;
    return true;
  });
  const start = (params.page - 1) * params.pageSize;
  const list = filtered.slice(start, start + params.pageSize);
  return resolve({ list, total: filtered.length, page: params.page, pageSize: params.pageSize });
}

export async function createCustomer(form: CustomerForm): Promise<FlatResponseData<any, Customer>> {
  const item: Customer = {
    ID: Math.max(0, ...mockCustomers.map(c => c.ID)) + 1,
    customerName: form.customerName,
    customerPhoneData: form.customerPhoneData,
    CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  mockCustomers.unshift(item);
  return resolve(item);
}

export async function updateCustomer(id: number, form: CustomerForm): Promise<FlatResponseData<any, Customer>> {
  const idx = mockCustomers.findIndex(c => c.ID === id);
  if (idx >= 0) {
    mockCustomers[idx] = { ...mockCustomers[idx], ...form };
  }
  return resolve(mockCustomers[idx]);
}

export async function deleteCustomer(id: number): Promise<FlatResponseData<any, null>> {
  const idx = mockCustomers.findIndex(c => c.ID === id);
  if (idx >= 0) mockCustomers.splice(idx, 1);
  return resolve(null);
}
