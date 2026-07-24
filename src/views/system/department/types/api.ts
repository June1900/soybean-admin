/** 部门负责人（gin-vue-admin SysUser 精简字段） */
export interface DepartmentLeader {
  ID: number;
  nickName: string;
  userName: string;
  phone?: string;
  email?: string;
}

/** 部门树节点（与 gin-vue-admin SysDepartment 对齐） */
export interface Department {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  name: string;
  parentId: number;
  ancestors: string;
  sort: number;
  leaderId: number;
  /** 列表接口会联表返回负责人对象，新建/编辑时由 form 提交；无负责人时为 null */
  leader: DepartmentLeader | null;
  /** 启用状态：true=启用，false=禁用 */
  status: boolean;
  children?: Department[];
  namePath: string;
}

/** 部门列表响应：gin-vue-admin getDepartmentList 直接返回树形数组 */
export type DepartmentListResponse = Department[];

/** 新增 / 编辑部门的表单数据（leader 以字符串提交，leaderId 为负责人用户 ID） */
export interface DepartmentForm {
  ID?: number;
  name: string;
  parentId: number;
  /** 负责人用户 ID，未选择时为 undefined */
  leaderId?: number;
  /** 负责人昵称（展示用），未选择时为空字符串 */
  leader?: string;
  phone: string;
  email: string;
  sort: number;
  status: boolean;
}

/** 实际提交到后端的数据：仅含后端需要的字段，剔除 leader / phone / email 等联表展示字段 */
export type DepartmentSubmitForm = Pick<DepartmentForm, 'name' | 'parentId' | 'leaderId' | 'sort' | 'status'> & {
  ID?: number;
};

/** 状态筛选枚举：all=全部，enabled=启用，disabled=禁用 */
export type DepartmentStatusFilter = 'all' | 'enabled' | 'disabled';

/** 前端搜索表单模型（在 index 中用于客户端过滤树） */
export interface DepartmentSearchParams {
  name: string;
  /** 状态筛选，默认 all=全部 */
  status: DepartmentStatusFilter;
}
