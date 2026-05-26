<script setup>
import { ref, onMounted, computed } from 'vue'
import { darkTheme } from 'naive-ui'
import HostsView from './views/HostsView.vue'
import TunnelsView from './views/TunnelsView.vue'

const activeTab = ref('hosts')
const route = ref('')

const isDark = computed(() => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

const currentView = computed(() => {
  return activeTab.value
})

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    if (action.code === 'autossh') {
      window.services.autoConnectAll()
    }
  })

  window.utools.onPluginOut(() => {
    route.value = ''
  })
})
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-message-provider>
      <n-dialog-provider>
        <div class="app-container" v-if="route === 'autossh'">
          <n-tabs v-model:value="activeTab" type="line" animated>
            <n-tab-pane name="hosts" tab="主机管理">
              <HostsView />
            </n-tab-pane>
            <n-tab-pane name="tunnels" tab="隧道管理">
              <TunnelsView />
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
