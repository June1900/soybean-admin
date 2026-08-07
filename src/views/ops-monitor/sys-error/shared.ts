import { SysErrorLevel, SysErrorStatus } from './types';

export const levelTagType: Record<SysErrorLevel, 'error' | 'warning'> = {
  fatal: 'error',
  error: 'warning'
};

export const statusTagType: Record<SysErrorStatus, 'warning' | 'info' | 'success' | 'error'> = {
  未处理: 'info',
  处理中: 'warning',
  处理完成: 'success',
  处理失败: 'error'
};
