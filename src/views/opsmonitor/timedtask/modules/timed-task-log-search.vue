<script setup lang="ts">
import { computed, toRaw } from 'vue';
import dayjs from 'dayjs';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import type { TimedTaskLogSearchParams } from '../api';

defineOptions({ name: 'TimedTaskLogSearch' });

interface Emits {
  (e: 'search'): void;
  (e: 'reset'): void;
}
const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<TimedTaskLogSearchParams>('model', { required: true });

const triggerOptions = computed(() => [
  { label: $t('page.opsMonitor.timedTask.log.search.manual'), value: 'manual' },
  { label: $t('page.opsMonitor.timedTask.log.search.auto'), value: 'auto' }
]);

const statusOptions = computed(() => [
  { label: $t('page.opsMonitor.timedTask.log.search.success'), value: 'success' },
  { label: $t('page.opsMonitor.timedTask.log.search.failed'), value: 'failed' }
]);

const timeRange = computed<[number, number] | null>({
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
      <NCollapseItem :title="$t('common.search')" name="timed-task-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.timedTask.log.search.triggerType')"
              path="triggerType"
              class="pr-24px"
            >
              <NSelect v-model:value="model.triggerType" clearable :options="triggerOptions" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.timedTask.log.search.status')"
              path="status"
              class="pr-24px"
            >
              <NSelect v-model:value="model.status" clearable :options="statusOptions" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.opsMonitor.timedTask.log.search.timeRange')"
              path="timeRange"
              class="pr-24px"
            >
              <NDatePicker v-model:value="timeRange" type="datetimerange" clearable class="w-full" />
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
