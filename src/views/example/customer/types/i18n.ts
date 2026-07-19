export interface ExampleCustomerLang {
  title: string;
  add: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  search: {
    customerName: string;
    customerPhoneData: string;
    search: string;
    reset: string;
  };
  columns: {
    index: string;
    id: string;
    customerName: string;
    customerPhoneData: string;
    createdAt: string;
    operations: string;
    edit: string;
    delete: string;
  };
  drawer: {
    title: string;
    customerName: string;
    customerPhoneData: string;
    cancel: string;
    submit: string;
  };
}
