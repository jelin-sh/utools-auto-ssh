<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  host: { type: Object, default: null }
})

const emit = defineEmits(['update:show', 'save'])

const form = ref({
  name: '',
  host: '',
  port: 22,
  username: '',
  password: ''
})

const rules = {
  name: { required: true, message: '请输入主机名称', trigger: 'blur' },
  host: { required: true, message: '请输入主机地址', trigger: 'blur' },
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' }
}

const formRef = ref(null)
const isEdit = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    if (props.host) {
      isEdit.value = true
      form.value = {
        name: props.host.name,
        host: props.host.host,
        port: props.host.port,
        username: props.host.username,
        password: ''
      }
    } else {
      isEdit.value = false
      form.value = { name: '', host: '', port: 22, username: '', password: '' }
    }
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
    emit('save', { ...form.value }, isEdit.value ? props.host?.id : null)
    emit('update:show', false)
  } catch { /* validation failed */ }
}
</script>

<template>
  <n-modal :show="show" @update:show="emit('update:show', $event)" preset="card" :title="isEdit ? '编辑主机' : '添加主机'" style="max-width: 480px;">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
      <n-form-item label="名称" path="name">
        <n-input v-model:value="form.name" placeholder="如：生产服务器" />
      </n-form-item>
      <n-form-item label="地址" path="host">
        <n-input v-model:value="form.host" placeholder="IP 或域名" />
      </n-form-item>
      <n-form-item label="SSH端口" path="port">
        <n-input-number v-model:value="form.port" :min="1" :max="65535" style="width: 100%" />
      </n-form-item>
      <n-form-item label="用户名" path="username">
        <n-input v-model:value="form.username" placeholder="root" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input v-model:value="form.password" type="password" show-password-on="click" :placeholder="isEdit ? '留空则不修改' : '请输入密码'" />
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
