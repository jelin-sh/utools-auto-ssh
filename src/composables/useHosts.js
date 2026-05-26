import { ref } from 'vue'

export function useHosts() {
  const hosts = ref([])
  const loading = ref(false)

  function load() {
    loading.value = true
    try {
      hosts.value = window.services.getHosts()
    } finally {
      loading.value = false
    }
  }

  function add(data) {
    const result = window.services.createHost(data)
    if (!result.ok) throw new Error(result.error || 'Failed to create host')
    load()
    return result
  }

  function update(id, data) {
    const result = window.services.updateHost(id, data)
    if (!result.ok) throw new Error(result.error || 'Failed to update host')
    load()
    return result
  }

  function remove(id) {
    const result = window.services.deleteHost(id)
    if (!result.ok) throw new Error(result.error || 'Failed to delete host')
    load()
    return result
  }

  return { hosts, loading, load, add, update, remove }
}
