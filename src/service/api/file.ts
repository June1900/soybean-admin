import { request } from '@/service/request';

// 文件上传后返回的文件详情
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
 * 文件上传
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
