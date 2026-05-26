# Preload API 参考

## 主机 CRUD

### `createHost(data)` → `{ ok, id }`
创建主机。`data: { name, host, port, username, password }`

### `getHosts()` → `Host[]`
获取所有主机列表。

### `getHost(id)` → `Host | null`
获取单个主机。

### `updateHost(id, data)` → `{ ok }`
更新主机。`data` 中包含 `password` 则更新密码，不包含则保持不变。

### `deleteHost(id)` → `{ ok }`
删除主机。同时删除存储的密码。

## 隧道 CRUD

### `createTunnel(data)` → `{ ok, id }`
创建隧道。`data: { name, hostId, remoteHost, remotePort, localPort, autoConnect }`

### `getTunnels()` → `Tunnel[]`
获取所有隧道列表。

### `getTunnel(id)` → `Tunnel | null`
获取单个隧道。

### `updateTunnel(id, data)` → `{ ok }`
更新隧道。

### `deleteTunnel(id)` → `{ ok }`
删除隧道。

## 密码

### `getPassword(hostId)` → `string | null`
获取主机密码。

## SSH 连接管理

### `connectTunnel(tunnelId)` → `Promise<{ ok, error? }`
建立 SSH 隧道。检查端口可用性、创建 SSH 连接、启动本地端口监听。

### `disconnectTunnel(tunnelId)` → `{ ok }`
断开隧道连接，释放端口。

### `disconnectAll()` → `{ ok }`
断开所有活跃连接。

### `getTunnelStatus(tunnelId)` → `'disconnected' | 'connecting' | 'connected' | 'error'`
获取隧道连接状态。

### `getAllStatuses()` → `{ [tunnelId]: { status, error } }`
获取所有隧道状态。

### `onStatusChange(callback)` → `void`
注册状态变更回调。`callback(tunnelId, status, error?)`

### `autoConnectAll()` → `void`
自动连接所有标记为 `autoConnect: true` 且当前未连接的隧道。

## 错误处理

所有函数返回 `{ ok: false, error: string }` 表示失败。SSH 连接错误通过 `onStatusChange` 回调传递。
