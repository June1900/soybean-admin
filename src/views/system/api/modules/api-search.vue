<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchGetApiGroups } from '../api';
import type { ApiSearchParams } from '../api';

defineOptions({
  name: 'ApiSearch'
});

interface Emits {
  (e: 'search'): void;
  (e: 'reset'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<ApiSearchParams>('model', { required: true });

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
];

const apiGroupMap = ref<Record<string, string>>({});
const groupOptions = ref<{ label: string; value: string }[]>([]);
const { loading, startLoading, endLoading } = useLoading();

async function loadApiGroups() {
  startLoading();
  const { data, error } = await fetchGetApiGroups();
  endLoading();
  if (!error && data) {
    apiGroupMap.value = data.apiGroupMap ?? {};
    groupOptions.value = (data.groups ?? []).map(group => ({
      label: data.apiGroupMap?.[group] ?? group,
      value: group
    }));
  }
}

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

onMounted(() => {
  loadApiGroups();
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="api-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.api.path')" path="path" class="pr-24px">
              <NInput v-model:value="model.path" :placeholder="$t('page.system.api.pathSearchPlaceholder')" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.system.api.descriptionSearch')"
              path="description"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.description"
                :placeholder="$t('page.system.api.descriptionSearchPlaceholder')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.api.apiGroup')" path="apiGroup" class="pr-24px">
              <NSelect
                v-model:value="model.apiGroup"
                :placeholder="$t('page.system.api.apiGroupSearchPlaceholder')"
                :options="groupOptions"
                :loading="loading"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.api.method')" path="method" class="pr-24px">
              <NSelect
                v-model:value="model.method"
                :placeholder="$t('page.system.api.methodPlaceholder')"
                :options="methodOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-mdi-refresh class="text-16px" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-mdi-magnify class="text-16px" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
