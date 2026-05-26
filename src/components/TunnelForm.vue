<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  tunnel: { type: Object, default: null },
  hosts: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:show', 'save'])

const form = ref({
  name: '',
  hostId: null,
  remoteHost: '127.0.0.1',
  remotePort: null,
  localPort: null,
  autoConnect: false
})

const rules = {
  name: { required: true, message: '请输入隧道名称', trigger: 'blur' },
  hostId: { required: true, message: '请选择主机', trigger: 'change' },
  remotePort: { required: true, type: 'number', message: '请输入远程端口', trigger: 'blur' },
  localPort: { required: true, type: 'number', message: '请输入本地端口', trigger: 'blur' }
}

const formRef = ref(null)
const isEdit = ref(false)

const hostOptions = computed(() =>
  props.hosts.map(h => ({ label: h.name, value: h.id }))
)

watch(() => props.show, (val) => {
  if (val) {
    if (props.tunnel) {
      isEdit.value = true
      form.value = {
        name: props.tunnel.name,
        hostId: props.tunnel.hostId,
        remoteHost: props.tunnel.remoteHost,
        remotePort: props.tunnel.remotePort,
        localPort: props.tunnel.localPort,
        autoConnect: props.tunnel.autoConnect
      }
    } else {
      isEdit.value = false
      form.value = { name: '', hostId: null, remoteHost: '127.0.0.1', remotePort: null, localPort: null, autoConnect: false }
    }
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
    emit('save', { ...form.value }, isEdit.value ? props.tunnel?.id : null)
    emit('update:show', false)
  } catch { /* validation failed */ }
}
</script>

<template>
  <n-modal :show="show" @update:show="emit('update:show', $event)" preset="card" :title="isEdit ? '编辑隧道' : '添加隧道'" style="max-width: 480px;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
      <n-form-item label="名称" path="name">
        <n-input v-model:value="form.name" placeholder="如：MySQL隧道" />
      </n-form-item>
      <n-form-item label="绑定主机" path="hostId">
        <n-select v-model:value="form.hostId" :options="hostOptions" placeholder="选择主机" />
      </n-form-item>
      <n-form-item label="远程地址" path="remoteHost">
        <n-input v-model:value="form.remoteHost" placeholder="默认 127.0.0.1" />
      </n-form-item>
      <n-form-item label="远程端口" path="remotePort">
        <n-input-number v-model:value="form.remotePort" :min="1" :max="65535" placeholder="服务器端口" style="width: 100%" />
      </n-form-item>
      <n-form-item label="本地端口" path="localPort">
        <n-input-number v-model:value="form.localPort" :min="1" :max="65535" placeholder="本地映射端口" style="width: 100%" />
      </n-form-item>
      <n-form-item label="自动连接">
        <n-switch v-model:value="form.autoConnect" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="handleSave">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
