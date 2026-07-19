import type { ExampleCustomerLang } from '../types';

const lang: ExampleCustomerLang = {
  title: 'Customer Management',
  add: 'Add Customer',
  edit: 'Edit Customer',
  delete: 'Delete',
  deleteConfirm: 'Confirm to delete this customer?',
  search: {
    customerName: 'Customer Name',
    customerPhoneData: 'Phone',
    search: 'Search',
    reset: 'Reset'
  },
  columns: {
    index: '#',
    id: 'ID',
    customerName: 'Customer Name',
    customerPhoneData: 'Phone',
    createdAt: 'Created At',
    operations: 'Actions',
    edit: 'Edit',
    delete: 'Delete'
  },
  drawer: {
    title: 'Customer Info',
    customerName: 'Customer Name',
    customerPhoneData: 'Phone',
    cancel: 'Cancel',
    submit: 'Submit'
  }
};

export default lang;
