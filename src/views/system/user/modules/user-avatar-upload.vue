<script setup lang="ts">
import { computed } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { NButton, NUpload } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchUploadFile } from '@/service/api/file';
import { getUploadFileUrl } from '@/utils/service';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'UserAvatarUpload'
});

const props = defineProps<{
  headerImg?: string;
}>();

const emit = defineEmits<{
  'update:headerImg': [value: string];
}>();

const { loading, startLoading, endLoading } = useLoading();

const previewUrl = computed(() => (props.headerImg ? getUploadFileUrl(props.headerImg) : ''));

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
    emit('update:headerImg', uploadData.file.url);
    window.$message?.success('头像上传成功');
  } finally {
    endLoading();
  }

  // 阻止 NUpload 默认上传
  return false;
}

function handleRemove() {
  emit('update:headerImg', '');
}
</script>

<template>
  <div class="flex items-center gap-16px">
    <div
      class="h-80px w-80px overflow-hidden rounded-full border border-gray-200 box-border flex-shrink-0 relative group"
    >
      <template v-if="previewUrl">
        <img :src="previewUrl" alt="avatar" class="h-full w-full object-cover block" />
        <div
          class="absolute inset-0 flex-center bg-black/50 text-white opacity-0 transition-opacity duration-300 cursor-pointer group-hover:opacity-100"
          title="删除头像"
          @click="handleRemove"
        >
          <SvgIcon icon="ri:delete-bin-line" class="text-24px" />
        </div>
      </template>
      <div v-else class="h-full w-full flex-center bg-gray-50 text-gray-300">
        <SvgIcon icon="ri:user-add-line" class="text-40px" />
      </div>
    </div>
    <NUpload
      accept=".jpg,.jpeg,.png,.gif"
      :max="1"
      :show-file-list="false"
      :disabled="loading"
      @before-upload="handleUpload"
    >
      <NButton :loading="loading">{{ previewUrl ? '重新选择' : '选择图片' }}</NButton>
    </NUpload>
  </div>
</template>
