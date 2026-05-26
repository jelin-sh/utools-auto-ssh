const net = require('net')
const { Client } = require('ssh2')
const dataStore = require('./data-store')

const connections = new Map()
const statusListeners = []
const retryCounters = new Map()

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const KEEPALIVE_INTERVAL = 10000
const READY_TIMEOUT = 20000

function updateStatus(tunnelId, status, error) {
  const conn = connections.get(tunnelId)
  if (conn) {
    conn.status = status
    conn.error = error || null
  }
  statusListeners.forEach(cb => {
    try { cb(tunnelId, status, error) } catch { /* ignore */ }
  })
}

async function connectTunnel(tunnelId) {
  if (connections.has(tunnelId)) {
    return { ok: false, error: 'Tunnel already connected' }
  }

  const tunnel = dataStore.getTunnel(tunnelId)
  if (!tunnel) return { ok: false, error: 'Tunnel not found' }

  const host = dataStore.getHost(tunnel.hostId)
  if (!host) return { ok: false, error: 'Host not found' }

  const password = dataStore.getPassword(tunnel.hostId)
  if (!password) return { ok: false, error: 'Password not found' }

  // Check port availability
  const available = await isPortAvailable(tunnel.localPort)
  if (!available) {
    return { ok: false, error: `Local port ${tunnel.localPort} is already in use` }
  }

  const conn = {
    client: null,
    server: null,
    status: 'connecting',
    error: null,
    intentionalClose: false
  }
  connections.set(tunnelId, conn)
  updateStatus(tunnelId, 'connecting')

  return new Promise((resolve) => {
    const client = new Client()
    conn.client = client

    client.on('ready', () => {
      const server = net.createServer((socket) => {
        client.forwardOut(
          socket.remoteAddress,
          socket.remotePort,
          tunnel.remoteHost,
          tunnel.remotePort,
          (err, stream) => {
            if (err) {
              socket.end()
              return
            }
            stream.on('close', () => socket.end())
            socket.on('close', () => stream.end())
            socket.pipe(stream)
            stream.pipe(socket)
          }
        )
      })

      server.on('error', (err) => {
        updateStatus(tunnelId, 'error', `Local server error: ${err.message}`)
        client.end()
      })

      server.listen(tunnel.localPort, '127.0.0.1', () => {
        conn.server = server
        retryCounters.delete(tunnelId)
        updateStatus(tunnelId, 'connected')
        resolve({ ok: true })
      })

      conn.server = server
    })

    client.on('error', (err) => {
      updateStatus(tunnelId, 'error', err.message)
      cleanup(tunnelId)
      resolve({ ok: false, error: err.message })
    })

    client.on('close', () => {
      if (!conn.intentionalClose) {
        handleConnectionLoss(tunnelId)
      }
    })

    client.connect({
      host: host.host,
      port: host.port,
      username: host.username,
      password: password,
      keepaliveInterval: KEEPALIVE_INTERVAL,
      keepaliveCountMax: 3,
      readyTimeout: READY_TIMEOUT
    })
  })
}

function disconnectTunnel(tunnelId) {
  const conn = connections.get(tunnelId)
  if (!conn) return { ok: true }

  conn.intentionalClose = true
  retryCounters.delete(tunnelId)
  cleanup(tunnelId)
  updateStatus(tunnelId, 'disconnected')
  return { ok: true }
}

function disconnectAll() {
  const ids = [...connections.keys()]
  ids.forEach(id => disconnectTunnel(id))
  return { ok: true }
}

function cleanup(tunnelId) {
  const conn = connections.get(tunnelId)
  if (!conn) return
  if (conn.server) {
    try { conn.server.close() } catch { /* ignore */ }
  }
  if (conn.client) {
    try { conn.client.end() } catch { /* ignore */ }
  }
  connections.delete(tunnelId)
}

function handleConnectionLoss(tunnelId) {
  const retries = retryCounters.get(tunnelId) || 0
  if (retries >= MAX_RETRIES) {
    updateStatus(tunnelId, 'error', `Connection lost. Max retries (${MAX_RETRIES}) exceeded.`)
    return
  }
  retryCounters.set(tunnelId, retries + 1)
  const delay = RETRY_DELAY_MS * Math.pow(2, retries)
  updateStatus(tunnelId, 'error', `Connection lost. Retrying in ${delay / 1000}s (${retries + 1}/${MAX_RETRIES})`)
  setTimeout(() => {
    cleanup(tunnelId)
    connectTunnel(tunnelId)
  }, delay)
}

function getTunnelStatus(tunnelId) {
  const conn = connections.get(tunnelId)
  return conn ? conn.status : 'disconnected'
}

function getAllStatuses() {
  const statuses = {}
  connections.forEach((conn, id) => {
    statuses[id] = { status: conn.status, error: conn.error }
  })
  return statuses
}

function onStatusChange(callback) {
  statusListeners.push(callback)
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const testServer = net.createServer()
    testServer.once('error', () => resolve(false))
    testServer.once('listening', () => {
      testServer.close()
      resolve(true)
    })
    testServer.listen(port, '127.0.0.1')
  })
}

function autoConnectAll() {
  const tunnels = dataStore.getTunnels()
  tunnels.filter(t => t.autoConnect).forEach(t => {
    const status = getTunnelStatus(t.id)
    if (status === 'disconnected' || status === 'error') {
      connectTunnel(t.id)
    }
  })
}

module.exports = {
  connectTunnel, disconnectTunnel, disconnectAll,
  getTunnelStatus, getAllStatuses, onStatusChange,
  autoConnectAll
}
