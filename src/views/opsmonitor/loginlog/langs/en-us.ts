import type { SystemToolsLoginLogLang } from '../types';

const lang: SystemToolsLoginLogLang = {
  title: 'Login Logs',
  search: {
    username: 'Username',
    ip: 'IP',
    status: 'Status',
    createdAtRange: 'Login Time',
    search: 'Search',
    reset: 'Reset',
    success: 'Success',
    fail: 'Failed'
  },
  columns: {
    index: '#',
    id: 'ID',
    username: 'Username',
    ip: 'Login IP',
    status: 'Status',
    detail: 'Detail',
    agent: 'Browser / Device',
    createdAt: 'Login Time',
    operations: 'Actions',
    view: 'View',
    delete: 'Delete'
  },
  detail: {
    title: 'Login Detail',
    id: 'Record ID',
    username: 'Username',
    userId: 'User ID',
    status: 'Status',
    ip: 'Login IP',
    errorMessage: 'Detail',
    agent: 'Browser / Device',
    createdAt: 'Login Time',
    updatedAt: 'Updated At',
    close: 'Close'
  },
  placeholder: { none: 'None' }
};

export default lang;
