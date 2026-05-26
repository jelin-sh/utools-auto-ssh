const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const DATA_DIR = path.join(window.utools.getPath('userData'), '.autossh')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJsonFile(filename) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return []
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return []
  }
}

function writeJsonFile(filename, data) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function generateId(prefix) {
  return prefix + '_' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')
}

// ============ Host CRUD ============

function createHost(data) {
  const hosts = readJsonFile('hosts.json')
  const host = {
    id: generateId('h'),
    name: data.name,
    host: data.host,
    port: data.port || 22,
    username: data.username,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  hosts.push(host)
  writeJsonFile('hosts.json', hosts)
  if (data.password) savePassword(host.id, data.password)
  return { ok: true, id: host.id }
}

function getHosts() {
  return readJsonFile('hosts.json')
}

function getHost(id) {
  const hosts = readJsonFile('hosts.json')
  return hosts.find(h => h.id === id) || null
}

function updateHost(id, data) {
  const hosts = readJsonFile('hosts.json')
  const idx = hosts.findIndex(h => h.id === id)
  if (idx === -1) return { ok: false, error: 'Host not found' }
  hosts[idx] = { ...hosts[idx], ...data, id, updatedAt: Date.now() }
  writeJsonFile('hosts.json', hosts)
  if (data.password !== undefined) savePassword(id, data.password)
  return { ok: true }
}

function deleteHost(id) {
  const hosts = readJsonFile('hosts.json')
  const filtered = hosts.filter(h => h.id !== id)
  if (filtered.length === hosts.length) return { ok: false, error: 'Host not found' }
  writeJsonFile('hosts.json', filtered)
  deletePassword(id)
  return { ok: true }
}

// ============ Tunnel CRUD ============

function createTunnel(data) {
  const tunnels = readJsonFile('tunnels.json')
  const tunnel = {
    id: generateId('t'),
    name: data.name,
    hostId: data.hostId,
    remoteHost: data.remoteHost || '127.0.0.1',
    remotePort: data.remotePort,
    localPort: data.localPort,
    autoConnect: data.autoConnect || false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  tunnels.push(tunnel)
  writeJsonFile('tunnels.json', tunnels)
  return { ok: true, id: tunnel.id }
}

function getTunnels() {
  return readJsonFile('tunnels.json')
}

function getTunnel(id) {
  const tunnels = readJsonFile('tunnels.json')
  return tunnels.find(t => t.id === id) || null
}

function updateTunnel(id, data) {
  const tunnels = readJsonFile('tunnels.json')
  const idx = tunnels.findIndex(t => t.id === id)
  if (idx === -1) return { ok: false, error: 'Tunnel not found' }
  tunnels[idx] = { ...tunnels[idx], ...data, id, updatedAt: Date.now() }
  writeJsonFile('tunnels.json', tunnels)
  return { ok: true }
}

function deleteTunnel(id) {
  const tunnels = readJsonFile('tunnels.json')
  const filtered = tunnels.filter(t => t.id !== id)
  if (filtered.length === tunnels.length) return { ok: false, error: 'Tunnel not found' }
  writeJsonFile('tunnels.json', filtered)
  return { ok: true }
}

// ============ Password (utools.db) ============

function savePassword(hostId, password) {
  return window.utools.db.put({ _id: 'pwd/' + hostId, data: password })
}

function getPassword(hostId) {
  try {
    const doc = window.utools.db.get('pwd/' + hostId)
    return doc ? doc.data : null
  } catch {
    return null
  }
}

function deletePassword(hostId) {
  try {
    const doc = window.utools.db.get('pwd/' + hostId)
    if (doc) window.utools.db.remove('pwd/' + hostId)
  } catch { /* ignore */ }
}

module.exports = {
  createHost, getHosts, getHost, updateHost, deleteHost,
  createTunnel, getTunnels, getTunnel, updateTunnel, deleteTunnel,
  savePassword, getPassword, deletePassword
}
