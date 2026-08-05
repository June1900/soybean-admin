<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { NButton, NUpload } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchUploadFile } from '@/service/api/file';
import { getUploadFileUrl } from '@/utils/service';
import defaultAvatar from '@/assets/imgs/soybean.jpg';

defineOptions({
  name: 'UserAvatarUpload'
});

const props = defineProps<{
  /** 当前头像（后端返回的相对路径，如 uploads/file/xxx.png） */
  headerImg?: string;
}>();

const emit = defineEmits<{
  'update:headerImg': [value: string];
}>();

const { loading, startLoading, endLoading } = useLoading();

const previewUrl = computed(() => getUploadFileUrl(props.headerImg) || defaultAvatar);

async function handleUpload(data: { file: UploadFileInfo }) {
  const file = data.file.file;
  if (!file) return false;

  if (!file.type.includes('image/')) {
    window.$message?.error('请上传图片类型文件（JPG、PNG等）');
    return false;
  }

  startLoading();
  try {
    const { data: uploadData, error } = await fetchUploadFile(file);
    if (error || !uploadData?.file?.url) {
      window.$message?.error('头像上传失败');
      return false;
    }
    // 仅发出后端返回的相对路径，由后端存储
    emit('update:headerImg', uploadData.file.url);
    window.$message?.success('头像上传成功');
  } finally {
    endLoading();
  }

  // 阻止 NUpload 默认上传，改用我们自己的接口
  return false;
}
</script>

<template>
  <div class="flex items-center gap-16px">
    <div class="h-80px w-80px overflow-hidden rounded-full border border-gray-200">
      <img :src="previewUrl" alt="avatar" class="h-full w-full object-cover" />
    </div>
    <NUpload
      accept=".jpg,.jpeg,.png,.gif"
      :max="1"
      :show-file-list="false"
      :disabled="loading"
      @before-upload="handleUpload"
    >
      <NButton :loading="loading">选择图片</NButton>
    </NUpload>
  </div>
</template>
