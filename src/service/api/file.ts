import { request } from '@/service/request';

/** 文件上传后返回的文件详情（gin-vue-admin /fileUploadAndDownload/upload） */
export interface UploadFileDetail {
  ID: number;
  classId: number;
  createdAt: string;
  key: string;
  md5: string;
  mime: string;
  name: string;
  size: number;
  tag: string;
  updatedAt: string;
  url: string;
  userId: number;
}

export interface UploadFileResponse {
  file: UploadFileDetail;
}

/**
 * 文件上传（gin-vue-admin：POST /fileUploadAndDownload/upload）
 *
 * 注意：
 * - 用 FormData 提交，字段名 `file`（与后端 c.FormFile("file") 对应）；
 * - 不设置 isEncrypt，也不手动设置 Content-Type，交由 axios 自动使用 multipart/form-data。
 */
export function fetchUploadFile(file: Blob | File) {
  const formData = new FormData();
  formData.append('file', file, file instanceof File ? file.name : 'file');
  return request<UploadFileResponse>({
    url: '/fileUploadAndDownload/upload',
    method: 'post',
    data: formData
  });
}
