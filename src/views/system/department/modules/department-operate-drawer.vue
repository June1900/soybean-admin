<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NSwitch,
  NSpace,
  NTreeSelect
} from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import type { User } from '../../user/api';
import {
  fetchCreateDepartment,
  fetchUpdateDepartment,
  type Department,
  type DepartmentForm,
  type DepartmentSubmitForm
} from '../api';
import LeaderSelectModal from './leader-select-modal.vue';

defineOptions({
  name: 'DepartmentOperateDrawer'
});

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: Department | null;
  parentOptions: TreeOption[];
  defaultParentId?: number | null;
}>();

const emit = defineEmits<{ close: []; submitted: [] }>();

const title = computed(() =>
  props.operateType === 'edit' ? $t('page.system.department.editDept') : $t('page.system.department.addDept')
);

const { loading, startLoading, endLoading } = useLoading();
const formRef = ref<FormInst | null>(null);
const model = ref<DepartmentForm>(createDefaultModel());

function createDefaultModel(): DepartmentForm {
  return {
    name: '',
    parentId: 0,
    leaderId: undefined,
    leader: '',
    phone: '',
    email: '',
    sort: 0,
    status: true
  };
}

const rules: FormRules = {
  name: [{ required: true, message: $t('page.system.department.namePlaceholder'), trigger: 'blur' }]
};

const parentTreeOptions = computed<TreeOption[]>(() => props.parentOptions);
const leaderModalVisible = ref(false);

function openLeaderModal() {
  leaderModalVisible.value = true;
}

function onLeaderSelected(user: User) {
  model.value.leaderId = user.ID;
  model.value.leader = user.nickName || user.userName;
  model.value.phone = user.phone ?? '';
  model.value.email = user.email ?? '';
}

function clearLeader() {
  model.value.leaderId = undefined;
  model.value.leader = '';
  model.value.phone = '';
  model.value.email = '';
}

watch(
  () => props.visible,
  val => {
    if (!val) {
      leaderModalVisible.value = false;
      return;
    }
    const editing = props.operateType === 'edit' && props.editingData;
    const leader = props.editingData?.leader ?? null;
    model.value = editing
      ? {
          ID: props.editingData!.ID,
          name: props.editingData!.name,
          parentId: props.editingData!.parentId,
          leaderId: props.editingData!.leaderId || undefined,
          leader: leader?.nickName || '',
          phone: leader?.phone ?? '',
          email: leader?.email ?? '',
          sort: props.editingData!.sort,
          status: props.editingData!.status
        }
      : { ...createDefaultModel(), parentId: props.defaultParentId ?? 0 };
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  startLoading();

  const isEdit = props.operateType === 'edit';
  const payload: DepartmentSubmitForm & { ID?: number } = {
    name: model.value.name,
    parentId: model.value.parentId,
    leaderId: model.value.leaderId,
    sort: model.value.sort,
    status: model.value.status
  };
  if (isEdit) (payload as DepartmentSubmitForm & { ID: number }).ID = props.editingData!.ID;

  try {
    const { error } = isEdit
      ? await fetchUpdateDepartment(payload as DepartmentSubmitForm & { ID: number })
      : await fetchCreateDepartment(payload);

    if (!error) {
      window.$message?.success(
        isEdit ? $t('page.system.department.editSuccess') : $t('page.system.department.addSuccess')
      );
      emit('submitted');
      emit('close');
    }
  } finally {
    endLoading();
  }
}
</script>

<template>
  <NDrawer :show="props.visible" display-directive="show" :width="640" @update:show="val => !val && emit('close')">
    <NDrawerContent :title="title" :native-scrollbar="false">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="90">
        <!-- 1. 上级部门 -->
        <NFormItem :label="$t('page.system.department.parentId')" path="parentId">
          <NTreeSelect
            v-model:value="model.parentId"
            :options="parentTreeOptions"
            :placeholder="$t('page.system.department.parentIdPlaceholder')"
            :default-expand-all="true"
          />
        </NFormItem>

        <!-- 2. 部门名称 -->
        <NFormItem :label="$t('page.system.department.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.department.namePlaceholder')" />
        </NFormItem>

        <!-- 3. 负责人 -->
        <NFormItem :label="$t('page.system.department.leader')" path="leader">
          <NInputGroup>
            <NInput v-model:value="model.leader" :placeholder="$t('page.system.department.leaderPlaceholder')" readonly>
              <template #suffix>
                <NButton v-if="model.leader" size="tiny" quaternary @click.stop="clearLeader">×</NButton>
              </template>
            </NInput>
            <NButton type="primary" ghost @click="openLeaderModal">
              <template #icon>
                <SvgIcon icon="material-symbols:person-search" />
              </template>
              {{ $t('page.system.department.selectLeaderBtn') }}
            </NButton>
          </NInputGroup>
        </NFormItem>

        <!-- 负责人 -->
        <LeaderSelectModal
          :visible="leaderModalVisible"
          :selected-id="model.leaderId || null"
          @close="leaderModalVisible = false"
          @selected="onLeaderSelected"
        />

        <!-- 4. 联系电话（选择负责人后自动带出，只读展示） -->
        <NFormItem :label="$t('page.system.department.phone')" path="phone">
          <NInput v-model:value="model.phone" :placeholder="$t('page.system.department.phonePlaceholder')" disabled />
        </NFormItem>

        <!-- 5. 邮箱（选择负责人后自动带出，只读展示） -->
        <NFormItem :label="$t('page.system.department.email')" path="email">
          <NInput v-model:value="model.email" :placeholder="$t('page.system.department.emailPlaceholder')" disabled />
        </NFormItem>

        <!-- 6. 排序 -->
        <NFormItem :label="$t('page.system.department.sort')" path="sort">
          <NInputNumber
            v-model:value="model.sort"
            :placeholder="$t('page.system.department.sortPlaceholder')"
            :min="0"
          />
        </NFormItem>

        <!-- 7. 状态 -->
        <NFormItem :label="$t('page.system.department.status')" path="status">
          <NSwitch v-model:value="model.status" :checked-value="true" :unchecked-value="false">
            <template #checked>{{ $t('page.system.department.enabled') }}</template>
            <template #unchecked>{{ $t('page.system.department.disabled') }}</template>
          </NSwitch>
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
