import type { SystemToolsVersionLang } from '../types';

const lang: SystemToolsVersionLang = {
  title: '版本信息',
  add: '创建发版',
  download: '下载发版包',
  search: {
    versionName: '版本名称',
    versionCode: '版本号',
    search: '搜索',
    reset: '重置'
  },
  columns: {
    index: '序号',
    id: 'ID',
    createdAt: '日期',
    versionName: '版本名称',
    versionCode: '版本号',
    description: '描述',
    operations: '操作',
    view: '查看',
    download: '下载',
    delete: '删除'
  },
  detail: {
    title: '版本详情',
    versionName: '版本名称',
    versionCode: '版本号',
    description: '描述',
    close: '关闭'
  },
  drawer: {
    title: '创建发版',
    versionName: '版本名称',
    versionCode: '版本号',
    description: '版本描述',
    cancel: '取消',
    submit: '提交'
  }
};

export default lang;
