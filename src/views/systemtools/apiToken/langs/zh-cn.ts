const apiTokenZhCN = {
  title: '接口凭证',
  search: {
    userId: '用户ID',
    status: '状态',
    valid: '有效',
    invalid: '已作废',
    search: '查询',
    reset: '重置'
  },
  issue: '签发',
  columns: {
    id: 'ID',
    user: '用户',
    authorityId: '角色ID',
    status: '状态',
    expiresAt: '过期时间',
    remark: '备注',
    operations: '操作',
    valid: '有效',
    invalid: '已作废',
    curl: 'Curl示例',
    invalidate: '作废'
  },
  drawer: {
    title: '签发 API Token',
    user: '用户',
    authority: '角色',
    days: '有效期',
    day1: '1天',
    day7: '7天',
    day30: '30天',
    day90: '90天',
    permanent: '永久',
    remark: '备注',
    submit: '签发JWT',
    cancel: '取消',
    selectUser: '请选择用户',
    selectAuthority: '请选择角色'
  },
  tokenDialog: {
    title: '签发成功',
    warning: '请立即复制保存，关闭后将无法再次查看完整Token',
    copy: '复制',
    close: '关闭'
  },
  curlDrawer: {
    title: 'Curl 示例',
    headerMode: 'Header 方式',
    cookieMode: 'Cookie 方式',
    copy: '复制'
  },
  invalidateConfirm: '确定要作废吗？',
  invalidateHint: '取消',
  invalidateSuccess: '作废成功',
  issueSuccess: '签发成功',
  copySuccess: '复制成功',
  pleaseSelectUserAndAuthority: '请选择用户和角色'
};

export default apiTokenZhCN;
