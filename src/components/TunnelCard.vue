<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  tunnel: { type: Object, required: true },
  hostName: { type: String, default: '' },
  status: { type: String, default: 'disconnected' },
  error: { type: String, default: null }
})

const emit = defineEmits(['edit', 'delete', 'connect', 'disconnect'])

const isConnected = computed(() => props.status === 'connected')
const isConnecting = computed(() => props.status === 'connecting')

function toggleConnection() {
  if (isConnected.value) {
    emit('disconnect', props.tunnel)
  } else if (!isConnecting.value) {
    emit('connect', props.tunnel)
  }
}
</script>

<template>
  <n-card size="small" hoverable>
    <div class="tunnel-card">
      <div class="tunnel-info">
        <div class="tunnel-header">
          <span class="tunnel-name">{{ tunnel.name }}</span>
          <StatusBadge :status="status" />
        </div>
        <div class="tunnel-detail">
          <n-text depth="3">
            {{ hostName }} | {{ tunnel.remoteHost }}:{{ tunnel.remotePort }} → localhost:{{ tunnel.localPort }}
          </n-text>
        </div>
        <div v-if="tunnel.autoConnect" class="tunnel-auto">
          <n-tag size="tiny" :bordered="false" type="info">自动连接</n-tag>
        </div>
        <div v-if="error" class="tunnel-error">
          <n-text type="error" style="font-size: 12px;">{{ error }}</n-text>
        </div>
      </div>
      <div class="tunnel-actions">
        <n-button
          size="small"
          :type="isConnected ? 'warning' : 'success'"
          :loading="isConnecting"
          @click="toggleConnection"
        >
          {{ isConnected ? '断开' : '连接' }}
        </n-button>
        <n-button size="small" quaternary @click="emit('edit', tunnel)">编辑</n-button>
        <n-button size="small" quaternary type="error" @click="emit('delete', tunnel)">删除</n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.tunnel-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.tunnel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.tunnel-name {
  font-weight: 500;
  font-size: 15px;
}
.tunnel-detail {
  font-size: 13px;
}
.tunnel-auto {
  margin-top: 4px;
}
.tunnel-error {
  margin-top: 4px;
}
.tunnel-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: center;
}
</style>
