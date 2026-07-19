import type { SystemToolsSysErrorLang } from '../types';

const lang: SystemToolsSysErrorLang = {
  title: 'System Error Logs',
  search: {
    form: 'Source',
    info: 'Content',
    search: 'Search',
    reset: 'Reset'
  },
  columns: {
    index: '#',
    id: 'ID',
    createdAt: 'Date',
    form: 'Source',
    level: 'Level',
    status: 'Status',
    info: 'Content',
    solution: 'Solution',
    operations: 'Actions',
    view: 'View',
    delete: 'Delete'
  },
  detail: {
    title: 'Error Detail',
    form: 'Source',
    level: 'Level',
    status: 'Status',
    info: 'Content',
    solution: 'Solution',
    close: 'Close'
  },
  level: { fatal: 'Fatal', error: 'Error' },
  status: { pending: 'Pending', processing: 'Processing', done: 'Done', failed: 'Failed' }
};

export default lang;
