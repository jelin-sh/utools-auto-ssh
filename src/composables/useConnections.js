import { ref, onMounted, onUnmounted } from 'vue'

export function useConnections() {
  const statuses = ref({})

  let unsubscribe = null

  onMounted(() => {
    if (window.services) {
      statuses.value = window.services.getAllStatuses()
      window.services.onStatusChange((tunnelId, status, error) => {
        statuses.value[tunnelId] = { status, error }
        statuses.value = { ...statuses.value }
      })
    }
  })

  function getStatus(tunnelId) {
    return statuses.value[tunnelId]?.status || 'disconnected'
  }

  function getError(tunnelId) {
    return statuses.value[tunnelId]?.error || null
  }

  async function connect(tunnelId) {
    return window.services.connectTunnel(tunnelId)
  }

  function disconnect(tunnelId) {
    return window.services.disconnectTunnel(tunnelId)
  }

  return { statuses, getStatus, getError, connect, disconnect }
}
