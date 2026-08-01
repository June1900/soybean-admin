<script setup lang="ts">
import { computed, toRaw } from 'vue';
import dayjs from 'dayjs';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import type { OperationRecordSearchParams } from '../api';

defineOptions({ name: 'OperationHistorySearch' });

interface Emits {
  (e: 'search'): void;
  (e: 'reset'): void;
}
const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<OperationRecordSearchParams>('model', { required: true });

const createdAtRange = computed<[number, number] | null>({
  get() {
    const { startCreatedAt, endCreatedAt } = model.value;
    if (startCreatedAt && endCreatedAt) {
      return [dayjs(startCreatedAt).valueOf(), dayjs(endCreatedAt).valueOf()] as [number, number];
    }
    return null;
  },
  set(val: [number, number] | null) {
    if (val && val.length === 2) {
      model.value.startCreatedAt = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss');
      model.value.endCreatedAt = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss');
    } else {
      model.value.startCreatedAt = '';
      model.value.endCreatedAt = '';
    }
  }
});

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
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="operation-history-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="120">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.operationHistory.search.createdAtRange')"
              path="createdAtRange"
              class="pr-24px"
            >
              <NDatePicker v-model:value="createdAtRange" type="datetimerange" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.operationHistory.search.method')"
              path="method"
              class="pr-24px"
            >
              <NInput v-model:value="model.method" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.operationHistory.search.path')"
              path="path"
              class="pr-24px"
            >
              <NInput v-model:value="model.path" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.operationHistory.search.status')"
              path="status"
              class="pr-24px"
            >
              <NInput v-model:value="model.status" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 m:24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ri-refresh-line class="text-16px" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ri-search-line class="text-16px" />
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
