import type { SystemToolsLoginLogLang } from '../types';

const lang: SystemToolsLoginLogLang = {
  title: 'Login Logs',
  search: {
    username: 'Username',
    status: 'Status',
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
    delete: 'Delete'
  }
};

export default lang;
