<script setup lang="ts">
import { computed, reactive } from 'vue';
import { NButton, NCard, NDivider, NTag, NTooltip } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { formatDateTime } from '@/utils/date';
import SvgIcon from '@/components/custom/svg-icon.vue';
import UserAvatar from './modules/user-avatar.vue';

defineOptions({
  name: 'UserCenter'
});

const authStore = useAuthStore();
const { userInfo } = authStore;

const themeStore = useThemeStore();
const primaryColor = computed(() => themeStore.themeColors.primary);

/** 账号状态 */
const accountStatus = computed(() => (userInfo.enable === 1 ? '启用' : '禁用'));

/** 所属部门（空时显示占位） */
const deptName = computed(() => userInfo.dept?.name || '-');

/** 复制到剪贴板 */
async function copyText(text: string, label: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    window.$message?.success(`${label}已复制`);
  } catch {
    window.$message?.error('复制失败');
  }
}

const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading();

const {
  formRef: profileFormRef,
  validate: profileValidate,
  restoreValidation: profileRestoreValidation
} = useNaiveForm();
const {
  formRef: passwordFormRef,
  validate: passwordValidate,
  restoreValidation: passwordRestoreValidation
} = useNaiveForm();
const { createRequiredRule, patternRules } = useFormRules();

interface ProfileModel {
  nickName: string;
  email: string;
  phone: string;
}

interface PasswordModel {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const profileModel: ProfileModel = reactive(createDefaultProfileModel());
const passwordModel: PasswordModel = reactive(createDefaultPasswordModel());

function createDefaultProfileModel(): ProfileModel {
  return {
    nickName: userInfo.nickName,
    email: userInfo.email,
    phone: userInfo.phone
  };
}

function createDefaultPasswordModel(): PasswordModel {
  return {
    oldPassword: '',
    confirmPassword: '',
    newPassword: ''
  };
}

type ProfileRuleKey = Extract<keyof ProfileModel, 'nickName' | 'email' | 'phone'>;
type PasswordRuleKey = Extract<keyof PasswordModel, 'oldPassword' | 'newPassword' | 'confirmPassword'>;

const profileRules: Record<ProfileRuleKey, App.Global.FormRule> = {
  nickName: createRequiredRule('昵称不能为空'),
  email: { ...patternRules.email, required: true },
  phone: { ...patternRules.phone, required: true }
};

const passwordRules: Record<PasswordRuleKey, App.Global.FormRule> = {
  oldPassword: createRequiredRule('旧密码不能为空'),
  confirmPassword: createRequiredRule('确认密码不能为空'),
  newPassword: createRequiredRule('新密码不能为空')
};

/** 模拟接口请求（替代真实后端调用） */
function mockRequest(delay = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function updateProfile() {
  await profileValidate();
  startBtnLoading();
  // 模拟保存个人资料接口
  await mockRequest();
  window.$message?.success('更新成功');
  Object.assign(userInfo, profileModel);
  profileRestoreValidation();
  endBtnLoading();
}

async function updatePassword() {
  await passwordValidate();
  if (passwordModel.newPassword !== passwordModel.confirmPassword) {
    window.$message?.error('两次输入的密码不一致');
    return;
  }
  startBtnLoading();
  // 模拟修改密码接口
  await mockRequest();
  window.$message?.success('密码修改成功');
  Object.assign(passwordModel, createDefaultPasswordModel());
  passwordRestoreValidation();
  endBtnLoading();
}
</script>

<template>
  <div class="flex gap-16px">
    <!-- 个人信息卡片 -->
    <NCard :bordered="false" class="profile-card w-440px shadow-sm" :content-style="{ padding: '0' }">
      <!-- 渐变封面 -->
      <div class="cover-banner">
        <div class="cover-pattern" />
      </div>

      <div class="card-body">
        <div class="avatar-wrap">
          <div class="avatar-ring">
            <UserAvatar />
          </div>
        </div>

        <div class="text-center">
          <div class="flex-center justify-center gap-8px">
            <span class="nickname">{{ userInfo.nickName }}</span>
          </div>
          <div class="username">{{ userInfo.userName }}</div>
          <div class="mt-10px flex-center flex-wrap justify-center gap-6px">
            <NTag
              v-for="role in userInfo.authorities"
              :key="role.authorityId"
              :bordered="false"
              type="primary"
              size="small"
              round
            >
              {{ role.authorityName }}
            </NTag>
            <NTag v-if="!userInfo.authorities.length" :bordered="false" size="small" round>暂无角色</NTag>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.authorities.length }}</div>
            <div class="stat-label">角色数</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value" :class="userInfo.enable === 1 ? 'text-success' : 'text-error'">
              {{ accountStatus }}
            </div>
            <div class="stat-label">账号状态</div>
          </div>
        </div>

        <NDivider class="my-16px" />

        <!-- 信息列表（带图标 + 复制） -->
        <div class="info-list">
          <div class="info-item">
            <span class="info-icon"><SvgIcon icon="material-symbols:call" /></span>
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userInfo.phone || '-' }}</span>
            <NTooltip trigger="hover">
              <template #trigger>
                <button class="copy-btn" @click="copyText(userInfo.phone, '手机号')">
                  <SvgIcon icon="material-symbols:content-copy" />
                </button>
              </template>
              复制手机号
            </NTooltip>
          </div>

          <div class="info-item">
            <span class="info-icon"><SvgIcon icon="material-symbols:mail" /></span>
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userInfo.email || '-' }}</span>
            <NTooltip trigger="hover">
              <template #trigger>
                <button class="copy-btn" @click="copyText(userInfo.email, '邮箱')">
                  <SvgIcon icon="material-symbols:content-copy" />
                </button>
              </template>
              复制邮箱
            </NTooltip>
          </div>

          <div class="info-item">
            <span class="info-icon"><SvgIcon icon="material-symbols:apartment" /></span>
            <span class="info-label">部门</span>
            <span class="info-value">{{ deptName }}</span>
          </div>

          <div class="info-item">
            <span class="info-icon"><SvgIcon icon="material-symbols:calendar-month" /></span>
            <span class="info-label">注册于</span>
            <span class="info-value">{{ formatDateTime(userInfo.CreatedAt) }}</span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 基本资料卡片 -->
    <NCard title="基本资料" :bordered="false" class="w-full overflow-x-auto shadow-sm">
      <NTabs type="line" animated class="h-full">
        <NTabPane name="userInfo" tab="基本资料">
          <NForm
            ref="profileFormRef"
            :model="profileModel"
            :rules="profileRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem label="昵称" path="nickName">
              <NInput v-model:value="profileModel.nickName" placeholder="请输入昵称" />
            </NFormItem>
            <NFormItem label="邮箱" path="email">
              <NInput v-model:value="profileModel.email" placeholder="请输入邮箱" />
            </NFormItem>
            <NFormItem label="手机号" path="phone">
              <NInput v-model:value="profileModel.phone" placeholder="请输入手机号" />
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-80px" type="primary" :loading="btnLoading" @click="updateProfile">
                <template #icon>
                  <SvgIcon icon="ic:outline-save" class="size-24px" />
                </template>
                保存
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane name="updatePwd" tab="修改密码">
          <NForm
            ref="passwordFormRef"
            :model="passwordModel"
            :rules="passwordRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem label="旧密码" path="oldPassword">
              <NInput
                v-model:value="passwordModel.oldPassword"
                type="password"
                placeholder="请输入旧密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="新密码" path="newPassword">
              <NInput
                v-model:value="passwordModel.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="确认密码" path="confirmPassword">
              <NInput
                v-model:value="passwordModel.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-120px" type="primary" :loading="btnLoading" @click="updatePassword">
                <template #icon>
                  <SvgIcon icon="ic:outline-key" class="size-24px" />
                </template>
                修改密码
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* 卡片：静态展示 */
.profile-card {
  overflow: hidden;
  border-radius: 12px;
}

/* 渐变封面 */
.cover-banner {
  position: relative;
  height: 116px;
  overflow: hidden;
}

.card-body {
  padding: 0 18px 18px;
}

.cover-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 22%, rgb(255 255 255 / 0.28), transparent 42%),
    radial-gradient(circle at 82% 8%, rgb(255 255 255 / 0.2), transparent 38%),
    radial-gradient(circle at 60% 90%, rgb(255 255 255 / 0.16), transparent 40%);
}

/* 头像浮起 */
.avatar-wrap {
  display: flex;
  justify-content: center;
  margin-top: -56px;
}

.avatar-ring {
  position: relative;
  width: 128px;
  height: 128px;
  padding: 4px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.avatar-ring :deep(img) {
  border-radius: 50%;
}

.nickname {
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
}

.username {
  margin-top: 2px;
  font-size: 13px;
  color: #86909c;
}

.text-primary {
  color: v-bind(primaryColor);
}

.text-success {
  color: #18c964;
}

.text-error {
  color: #f53f3f;
}

/* 关键指标 */
.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 18px;
  padding: 12px 0;
  background: rgb(0 0 0 / 0.02);
  border-radius: 10px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: v-bind(primaryColor);
}

.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: #86909c;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgb(0 0 0 / 0.08);
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.info-item:hover {
  background: rgb(0 0 0 / 0.03);
}

.info-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 17px;
  color: v-bind(primaryColor);
  background: color-mix(in srgb, v-bind(primaryColor) 12%, #fff);
}

.info-label {
  flex-shrink: 0;
  width: 56px;
  font-size: 13px;
  color: #86909c;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #1f2329;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.info-value.uuid {
  font-size: 12px;
  color: #4e5969;
}

.copy-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #a9b0bd;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.copy-btn:hover {
  color: v-bind(primaryColor);
  background: color-mix(in srgb, v-bind(primaryColor) 12%, #fff);
}

/* 更多信息折叠 */
.more-collapse {
  border: none;
}

:deep(.more-collapse .n-collapse-item) {
  border: none;
}

:deep(.more-collapse .n-collapse-item__header) {
  font-size: 13px;
  color: #86909c;
}
</style>
