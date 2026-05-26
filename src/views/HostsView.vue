<script setup>
import { ref } from 'vue'
import { useHosts } from '@/composables/useHosts'
import { useMessage, useDialog } from 'naive-ui'
import HostCard from '@/components/HostCard.vue'
import HostForm from '@/components/HostForm.vue'

const { hosts, loading, load, add, update, remove } = useHosts()
const message = useMessage()
const dialog = useDialog()

const showForm = ref(false)
const editingHost = ref(null)

load()

function handleEdit(host) {
  editingHost.value = host
  showForm.value = true
}

function handleDelete(host) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除主机「${host.name}」吗？关联的隧道配置不会被删除，但将无法连接。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      try {
        // Disconnect any active tunnels using this host
        const tunnels = window.services.getTunnels()
        tunnels.filter(t => t.hostId === host.id).forEach(t => {
          const status = window.services.getTunnelStatus(t.id)
          if (status === 'connected' || status === 'connecting') {
            window.services.disconnectTunnel(t.id)
          }
        })
        remove(host.id)
        message.success('主机已删除')
      } catch (e) {
        message.error(e.message)
      }
    }
  })
}

function handleSave(data, editId) {
  try {
    if (editId) {
      if (!data.password) delete data.password
      update(editId, data)
      message.success('主机已更新')
    } else {
      add(data)
      message.success('主机已添加')
    }
  } catch (e) {
    message.error(e.message)
  }
}

function openAddForm() {
  editingHost.value = null
  showForm.value = true
}
</script>

<template>
  <div class="hosts-view">
    <div class="view-header">
      <h3>主机列表</h3>
      <n-button type="primary" size="small" @click="openAddForm">添加主机</n-button>
    </div>
    <n-spin :show="loading">
      <div v-if="hosts.length === 0" class="empty-state">
        <n-empty description="暂无主机配置，点击上方按钮添加" />
      </div>
      <div v-else class="card-grid">
        <HostCard
          v-for="host in hosts"
          :key="host.id"
          :host="host"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </n-spin>
    <HostForm
      v-model:show="showForm"
      :host="editingHost"
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
