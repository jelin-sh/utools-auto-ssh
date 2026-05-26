# 架构设计

## 整体架构

```
┌─────────────────────────────────────────┐
│             uTools Plugin               │
├──────────────────┬──────────────────────┤
│   Renderer (Vue) │   Preload (Node.js)  │
│                  │                      │
│  App.vue         │  services.js (入口)  │
│  ├─ HostsView    │  ├─ data-store.js    │
│  └─ TunnelsView  │  └─ ssh-manager.js   │
│                  │                      │
│  Naive UI        │  ssh2 + net          │
├──────────────────┴──────────────────────┤
│            window.services              │
└─────────────────────────────────────────┘
```

## Renderer-Preload 通信

所有通信通过 `window.services` 对象。Renderer（Vue 应用）不直接导入 Node.js 模块。

- **数据操作**：`window.services.getHosts()`, `createHost()` 等
- **SSH 操作**：`window.services.connectTunnel()`, `disconnectTunnel()` 等
- **状态订阅**：`window.services.onStatusChange(callback)` 异步通知

## 数据流

```
用户操作 → Vue 组件 → composable → window.services → data-store.js (JSON 文件)
                                                    → ssh-manager.js (SSH 连接)
```

## SSH 隧道连接流程

```
1. connectTunnel(tunnelId) 被调用
2. 从 data-store 读取隧道配置和主机信息
3. 从 utools.db 读取密码
4. 检查本地端口可用性
5. 创建 ssh2.Client 连接到远程主机
6. client.on('ready') 后创建 net.createServer 监听本地端口
7. 每个本地连接 → client.forwardOut() → SSH 通道
8. socket.pipe(stream).pipe(socket) 双向数据流
```

## 连接状态

```
disconnected → connecting → connected
                  ↓              ↓
                error ← ← ← ← ←
                  ↓
            (重连/放弃)
```

## 生命周期

- `onPluginEnter`：加载数据，自动连接标记为 autoConnect 的隧道
- `onPluginOut`：UI 隐藏，SSH 连接在 preload Node.js 上下文中保持活跃
- uTools 退出时所有连接自动终止
