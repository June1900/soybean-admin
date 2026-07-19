<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { $t } from '@/locales';
import { fetchRegisteredMethods, fetchCreateTimedTask, fetchUpdateTimedTask } from '../api';
import type { TimedTask, TimedTaskForm, RegisteredMethod } from '../types';

defineOptions({ name: 'TimedTaskOperateDrawer' });

const props = defineProps<{
  visible: boolean;
  operateType: NaiveUI.TableOperateType;
  editingData: TimedTask | null;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

function emptyForm(): TimedTaskForm {
  return {
    ID: 0,
    name: '',
    description: '',
    spec: '',
    withSeconds: false,
    executorType: 'method',
    methodName: '',
    params: null,
    httpUrl: '',
    httpMethod: 'GET',
    httpHeader: null,
    httpBody: '',
    httpAllowPrivate: false,
    enabled: true
  };
}

const model = reactive<TimedTaskForm>(emptyForm());
const paramsText = ref('');
const headerText = ref('');
const methodOptions = ref<RegisteredMethod[]>([]);
const loading = ref(false);

watch(
  () => props.visible,
  val => {
    if (val) {
      const row = props.editingData;
      Object.assign(model, emptyForm(), row ?? {});
      paramsText.value = row?.params ? JSON.stringify(row.params, null, 2) : '';
      headerText.value = row?.httpHeader ? JSON.stringify(row.httpHeader, null, 2) : '';
      loadMethods();
    }
  }
);

async function loadMethods() {
  if (methodOptions.value.length === 0) {
    methodOptions.value = await fetchRegisteredMethods();
  }
}

function parseJsonField(text: string, label: string): { ok: boolean; value: unknown } {
  if (!text || !text.trim()) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    window.$message?.error(`${label} ${$t('page.systemTools.timedTask.form.jsonError')}`);
    return { ok: false, value: null };
  }
}

async function handleSubmit() {
  if (!model.name) {
    window.$message?.warning($t('page.systemTools.timedTask.form.nameRequired'));
    return;
  }
  if (!model.spec) {
    window.$message?.warning($t('page.systemTools.timedTask.form.cronRequired'));
    return;
  }
  const p = parseJsonField(paramsText.value, $t('page.systemTools.timedTask.form.params'));
  if (!p.ok) return;
  const h = parseJsonField(headerText.value, $t('page.systemTools.timedTask.form.header'));
  if (!h.ok) return;

  const payload: TimedTaskForm = { ...model, params: p.value, httpHeader: h.value };
  loading.value = true;
  const { error } = model.ID
    ? await fetchUpdateTimedTask(payload)
    : await fetchCreateTimedTask(payload);
  loading.value = false;
  if (error) return;

  window.$message?.success(
    model.ID ? $t('page.systemTools.timedTask.form.updateSuccess') : $t('page.systemTools.timedTask.form.createSuccess')
  );
  emit('submitted');
  closeDrawer();
}

function closeDrawer() {
  emit('close');
}
</script>

<template>
  <NDrawer
    :show="visible"
    display-directive="show"
    :width="520"
    @mask-click="closeDrawer"
    @close="closeDrawer"
  >
    <NDrawerContent :title="$t(operateType === 'edit' ? 'page.systemTools.timedTask.form.editTitle' : 'page.systemTools.timedTask.form.title')" :native-scrollbar="false">
      <NForm label-placement="top">
        <NFormItem :label="$t('page.systemTools.timedTask.form.name')" required>
          <NInput v-model:value="model.name" :placeholder="$t('page.systemTools.timedTask.form.name')" />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.timedTask.form.description')">
          <NInput v-model:value="model.description" type="textarea" :rows="2" />
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.timedTask.form.spec')" required>
          <div class="flex w-full gap-8px">
            <NInput v-model:value="model.spec" placeholder="如 @daily 或 */30 * * * *" class="flex-1" />
            <NSelect
              :placeholder="$t('page.systemTools.timedTask.form.cronTemplate')"
              style="width: 170px"
              clearable
              :options="[
                { label: '每天零点 @daily', value: '@daily' },
                { label: '每小时 @hourly', value: '@hourly' },
                { label: '每周 @weekly', value: '@weekly' },
                { label: '每30分钟', value: '*/30 * * * *' },
                { label: '每分钟', value: '* * * * *' },
                { label: '工作日9点', value: '0 9 * * 1-5' }
              ]"
              @update:value="v => (model.spec = (v as string) || model.spec)"
            />
          </div>
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.timedTask.form.withSeconds')">
          <NSwitch v-model:value="model.withSeconds" />
          <span class="ml-2 text-12px text-gray-400">{{ $t('page.systemTools.timedTask.form.withSecondsHint') }}</span>
        </NFormItem>
        <NFormItem :label="$t('page.systemTools.timedTask.form.executor')" required>
          <NRadioGroup v-model:value="model.executorType">
            <NRadio value="method">{{ $t('page.systemTools.timedTask.form.methodExecutor') }}</NRadio>
            <NRadio value="http">{{ $t('page.systemTools.timedTask.form.httpExecutor') }}</NRadio>
          </NRadioGroup>
        </NFormItem>

        <template v-if="model.executorType === 'method'">
          <NFormItem :label="$t('page.systemTools.timedTask.form.method')" required>
            <NSelect
              v-model:value="model.methodName"
              :placeholder="$t('page.systemTools.timedTask.form.method')"
              filterable
              :options="methodOptions.map(m => ({ label: `${m.name} — ${m.description}`, value: m.name }))"
            />
          </NFormItem>
          <NFormItem :label="$t('page.systemTools.timedTask.form.params')">
            <NInput v-model:value="paramsText" type="textarea" :rows="4" placeholder="{&quot;days&quot;: 30}" />
          </NFormItem>
        </template>

        <template v-else>
          <NFormItem :label="$t('page.systemTools.timedTask.form.url')" required>
            <NInput v-model:value="model.httpUrl" placeholder="https://example.com/hook" />
          </NFormItem>
          <NFormItem :label="$t('page.systemTools.timedTask.form.httpMethod')">
            <NSelect
              v-model:value="model.httpMethod"
              style="width: 140px"
              :options="['GET', 'POST', 'PUT', 'DELETE'].map(m => ({ label: m, value: m }))"
            />
          </NFormItem>
          <NFormItem :label="$t('page.systemTools.timedTask.form.header')">
            <NInput v-model:value="headerText" type="textarea" :rows="2" placeholder="{&quot;Authorization&quot;:&quot;Bearer xxx&quot;}" />
          </NFormItem>
          <NFormItem :label="$t('page.systemTools.timedTask.form.body')">
            <NInput v-model:value="model.httpBody" type="textarea" :rows="3" />
          </NFormItem>
          <NFormItem :label="$t('page.systemTools.timedTask.form.allowPrivate')">
            <NSwitch v-model:value="model.httpAllowPrivate" />
            <span class="ml-2 text-12px text-gray-400">{{ $t('page.systemTools.timedTask.form.allowPrivateHint') }}</span>
          </NFormItem>
        </template>

        <NFormItem :label="$t('page.systemTools.timedTask.form.enabled')">
          <NSwitch v-model:value="model.enabled" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('page.systemTools.timedTask.form.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('page.systemTools.timedTask.form.submit') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
