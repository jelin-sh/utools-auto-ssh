<script setup>
import { ref, computed } from 'vue'
import { useTunnels } from '@/composables/useTunnels'
import { useHosts } from '@/composables/useHosts'
import { useConnections } from '@/composables/useConnections'
import { useMessage, useDialog } from 'naive-ui'
import TunnelCard from '@/components/TunnelCard.vue'
import TunnelForm from '@/components/TunnelForm.vue'

const { tunnels, loading, load, add, update, remove } = useTunnels()
const { hosts, load: loadHosts } = useHosts()
const { getStatus, getError, connect, disconnect } = useConnections()
const message = useMessage()
const dialog = useDialog()

const showForm = ref(false)
const editingTunnel = ref(null)

load()
loadHosts()

const hostNameMap = computed(() => {
  const map = {}
  hosts.value.forEach(h => { map[h.id] = h.name })
  return map
})

function handleEdit(tunnel) {
  editingTunnel.value = tunnel
  showForm.value = true
}

function handleDelete(tunnel) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除隧道「${tunnel.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      const status = getStatus(tunnel.id)
      if (status === 'connected' || status === 'connecting') {
        disconnect(tunnel.id)
      }
      try {
        remove(tunnel.id)
        message.success('隧道已删除')
      } catch (e) {
        message.error(e.message)
      }
    }
  })
}

async function handleConnect(tunnel) {
  try {
    const result = await connect(tunnel.id)
    if (result.ok) {
      message.success(`隧道「${tunnel.name}」已连接`)
    } else {
      message.error(result.error || '连接失败')
    }
  } catch (e) {
    message.error(e.message)
  }
}

function handleDisconnect(tunnel) {
  disconnect(tunnel.id)
  message.info(`隧道「${tunnel.name}」已断开`)
}

function handleSave(data, editId) {
  try {
    if (editId) {
      update(editId, data)
      message.success('隧道已更新')
    } else {
      add(data)
      message.success('隧道已添加')
    }
  } catch (e) {
    message.error(e.message)
  }
}

function openAddForm() {
  editingTunnel.value = null
  showForm.value = true
}
</script>

<template>
  <div class="tunnels-view">
    <div class="view-header">
      <h3>隧道列表</h3>
      <n-button type="primary" size="small" @click="openAddForm">添加隧道</n-button>
    </div>
    <n-spin :show="loading">
      <div v-if="tunnels.length === 0" class="empty-state">
        <n-empty description="暂无隧道配置，点击上方按钮添加" />
      </div>
      <div v-else class="card-grid">
        <TunnelCard
          v-for="tunnel in tunnels"
          :key="tunnel.id"
          :tunnel="tunnel"
          :host-name="hostNameMap[tunnel.hostId] || '未知主机'"
          :status="getStatus(tunnel.id)"
          :error="getError(tunnel.id)"
          @edit="handleEdit"
          @delete="handleDelete"
          @connect="handleConnect"
          @disconnect="handleDisconnect"
        />
      </div>
    </n-spin>
    <TunnelForm
      v-model:show="showForm"
      :tunnel="editingTunnel"
      :hosts="hosts"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.view-header h3 { margin: 0; }
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.empty-state { padding: 40px 0; }
</style>
