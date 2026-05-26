<script setup>
const props = defineProps({
  status: { type: String, default: 'disconnected' }
})

const statusMap = {
  connected: { type: 'success', text: '已连接' },
  connecting: { type: 'warning', text: '连接中' },
  disconnected: { type: 'default', text: '未连接' },
  error: { type: 'error', text: '错误' }
}
</script>

<template>
  <n-tag :type="statusMap[status]?.type || 'default'" size="small" round>
    {{ statusMap[status]?.text || status }}
  </n-tag>
</template>
