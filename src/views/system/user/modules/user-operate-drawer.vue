<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import { $t } from '@/locales';
import { fetchCreateUser, fetchUpdateUser, fetchSetUserAuthorities, type User } from '../api';
import { fetchGetAuthorityList, type Authority } from '../../authority/api';

defineOptions({
  name: 'UserOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: User | null;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);

const roleOptions = ref<TreeOption[]>([]);

function toTreeOptions(list: Authority[]): TreeOption[] {
  return list.map(a => ({
    key: Number(a.authorityId),
    label: a.authorityName,
    children: a.children?.length ? toTreeOptions(a.children) : undefined
  }));
}

async function loadRoleOptions() {
  const { data, error } = await fetchGetAuthorityList();
  if (!error && data) {
    roleOptions.value = toTreeOptions(data);
  }
}

const model = reactive({
  ID: null as number | null,
  userName: '',
  password: '',
  nickName: '',
  phone: '',
  email: '',
  authorityIds: [] as number[],
  enable: 1 as number,
  headerImg: ''
});

const rules: FormRules = {
  userName: [
    { required: true, message: $t('page.system.user.userNamePlaceholder'), trigger: 'blur' },
    { min: 5, message: $t('page.system.user.userNameMinLength'), trigger: 'blur' }
  ],
  password: [{ required: true, message: $t('page.system.user.passwordRequired'), trigger: 'blur' }],
  nickName: [{ required: true, message: $t('page.system.user.nickNamePlaceholder'), trigger: 'blur' }],
  authorityIds: [
    { required: true, type: 'array', min: 1, message: $t('page.system.user.rolePlaceholder'), trigger: 'change' }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: $t('page.system.user.phoneInvalid'), trigger: 'blur' }],
  email: [{ type: 'email', message: $t('page.system.user.emailInvalid'), trigger: 'blur' }]
};

/** 编辑模式下密码非必填且隐藏 */
const dynamicRules = computed(() => {
  if (props.operateType === 'edit') {
    const { password: _, ...rest } = rules;
    return rest as FormRules;
  }
  return rules;
});

const title = computed(() =>
  props.operateType === 'add' ? $t('page.system.user.addUser') : $t('page.system.user.editUser')
);

watch(
  () => props.visible,
  visible => {
    if (!visible) return;

    if (props.operateType === 'edit' && props.editingData) {
      const d = props.editingData;
      model.ID = d.ID;
      model.userName = d.userName ?? '';
      model.password = '';
      model.nickName = d.nickName ?? '';
      model.phone = d.phone ?? '';
      model.email = d.email ?? '';
      const ids = (d.authorities ?? []).map(a => Number(a.authorityId)).filter(n => !Number.isNaN(n));
      if (ids.length === 0) {
        ids.push(...(d.authorityIds ?? []).map(Number).filter(n => !Number.isNaN(n)));
        if (ids.length === 0 && d.authorityId != null) ids.push(Number(d.authorityId));
      }
      model.authorityIds = ids;
      model.enable = d.enable ?? 1;
      model.headerImg = d.headerImg ?? '';
    } else {
      model.ID = null;
      model.userName = '';
      model.password = '';
      model.nickName = '';
      model.phone = '';
      model.email = '';
      model.authorityIds = [];
      model.enable = 1;
      model.headerImg = '';
    }
  },
  { immediate: true }
);

onMounted(loadRoleOptions);

async function handleSubmit() {
  await formRef.value?.validate();

  startLoading();

  try {
    if (props.operateType === 'add') {
      const { error } = await fetchCreateUser({
        userName: model.userName,
        password: model.password,
        nickName: model.nickName,
        phone: model.phone || undefined,
        email: model.email || undefined,
        authorityId: model.authorityIds[0],
        authorityIds: model.authorityIds,
        enable: model.enable,
        headerImg: model.headerImg || undefined
      });

      if (!error) window.$message?.success($t('page.system.user.addSuccess'));
    } else {
      const { error } = await fetchUpdateUser({
        ID: model.ID!,
        userName: model.userName,
        nickName: model.nickName,
        phone: model.phone || undefined,
        email: model.email || undefined,
        enable: model.enable,
        headerImg: model.headerImg || undefined
      });

      if (!error) {
        const { error: roleError } = await fetchSetUserAuthorities({
          ID: model.ID!,
          authorityIds: model.authorityIds
        });
        if (!roleError) window.$message?.success($t('page.system.user.editSuccess'));
      }
    }

    emit('submitted');
    emit('close');
  } finally {
    endLoading();
  }
}
</script>

<template>
  <NDrawer :show="visible" display-directive="show" :width="600" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="dynamicRules" label-placement="top">
        <NFormItem :label="$t('page.system.user.userName')" path="userName">
          <NInput
            v-model:value="model.userName"
            :placeholder="$t('page.system.user.userNamePlaceholder')"
            :disabled="operateType === 'edit'"
          />
        </NFormItem>
        <!-- 密码仅新增时显示 -->
        <NFormItem v-if="operateType === 'add'" :label="$t('page.system.user.password')" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="mousedown"
            :placeholder="$t('page.system.user.passwordPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.user.nickName')" path="nickName">
          <NInput v-model:value="model.nickName" :placeholder="$t('page.system.user.nickNamePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.user.phone')" path="phone">
          <NInput v-model:value="model.phone" :placeholder="$t('page.system.user.phonePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.user.email')" path="email">
          <NInput v-model:value="model.email" :placeholder="$t('page.system.user.emailPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.user.role')" path="authorityIds">
          <NTreeSelect
            v-model:value="model.authorityIds"
            multiple
            checkable
            :options="roleOptions"
            :placeholder="$t('page.system.user.rolePlaceholder')"
            :default-expand-all="true"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.user.status')" path="enable">
          <NRadioGroup v-model:value="model.enable">
            <NRadio :value="1">{{ $t('page.system.user.enable') }}</NRadio>
            <NRadio :value="2">{{ $t('page.system.user.disable') }}</NRadio>
          </NRadioGroup>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
