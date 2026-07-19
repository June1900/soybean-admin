import type { ExampleCustomerLang } from '../types';

const lang: ExampleCustomerLang = {
  title: '客户管理',
  add: '新增客户',
  edit: '编辑客户',
  delete: '删除',
  deleteConfirm: '确认删除该客户吗？',
  search: {
    customerName: '客户名称',
    customerPhoneData: '联系电话',
    search: '搜索',
    reset: '重置'
  },
  columns: {
    index: '序号',
    id: 'ID',
    customerName: '客户名称',
    customerPhoneData: '联系电话',
    createdAt: '接入日期',
    operations: '操作',
    edit: '编辑',
    delete: '删除'
  },
  drawer: {
    title: '客户信息',
    customerName: '客户名称',
    customerPhoneData: '联系电话',
    cancel: '取消',
    submit: '提交'
  }
};

export default lang;
