<script setup>
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  host: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <n-card size="small" hoverable>
    <div class="host-card">
      <div class="host-info">
        <div class="host-name">{{ host.name }}</div>
        <div class="host-detail">
          <n-text depth="3">{{ host.username }}@{{ host.host }}:{{ host.port }}</n-text>
        </div>
      </div>
      <div class="host-actions">
        <n-button size="small" quaternary @click="emit('edit', host)">
          编辑
        </n-button>
        <n-button size="small" quaternary type="error" @click="emit('delete', host)">
          删除
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.host-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.host-name {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 4px;
}
.host-detail {
  font-size: 13px;
}
.host-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
