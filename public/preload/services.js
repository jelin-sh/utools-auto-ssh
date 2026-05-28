const dataStore = require('./data-store')
const sshManager = require('./ssh-manager')

window.services = {
  // Host CRUD
  createHost: dataStore.createHost,
  getHosts: dataStore.getHosts,
  getHost: dataStore.getHost,
  updateHost: dataStore.updateHost,
  deleteHost: dataStore.deleteHost,

  // Tunnel CRUD
  createTunnel: dataStore.createTunnel,
  getTunnels: dataStore.getTunnels,
  getTunnel: dataStore.getTunnel,
  updateTunnel: dataStore.updateTunnel,
  deleteTunnel: dataStore.deleteTunnel,

  // Password
  getPassword: dataStore.getPassword,

  // SSH Manager
  connectTunnel: sshManager.connectTunnel,
  disconnectTunnel: sshManager.disconnectTunnel,
  disconnectAll: sshManager.disconnectAll,
  getTunnelStatus: sshManager.getTunnelStatus,
  getAllStatuses: sshManager.getAllStatuses,
  onStatusChange: sshManager.onStatusChange,
  autoConnectAll: sshManager.autoConnectAll
}

// Auto-connect on plugin startup (preload runs before renderer mounts).
// This handles "跟随主程序自动运行" — tunnels connect when uTools starts,
// not only when the user opens the plugin UI.
sshManager.autoConnectAll()
