import { ref } from 'vue'

export function useTunnels() {
  const tunnels = ref([])
  const loading = ref(false)

  function load() {
    loading.value = true
    try {
      tunnels.value = window.services.getTunnels()
    } finally {
      loading.value = false
    }
  }

  function add(data) {
    const result = window.services.createTunnel(data)
    if (!result.ok) throw new Error(result.error || 'Failed to create tunnel')
    load()
    return result
  }

  function update(id, data) {
    const result = window.services.updateTunnel(id, data)
    if (!result.ok) throw new Error(result.error || 'Failed to update tunnel')
    load()
    return result
  }

  function remove(id) {
    const result = window.services.deleteTunnel(id)
    if (!result.ok) throw new Error(result.error || 'Failed to delete tunnel')
    load()
    return result
  }

  return { tunnels, loading, load, add, update, remove }
}
