# 数据模型

## 存储方式

- **主机和隧道配置**：JSON 文件，存储在 `utools.getPath('userData')/.autossh/` 目录
  - `hosts.json`：主机列表
  - `tunnels.json`：隧道列表
- **密码**：`utools.db` 明文存储，key 为 `pwd/<hostId>`

## 主机（Host）

```json
{
  "id": "h_xxxxxx",
  "name": "生产服务器",
  "host": "192.168.1.100",
  "port": 22,
  "username": "root",
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 自动 | 格式 `h_<timestamp36><random>` |
| name | string | 是 | 主机显示名称 |
| host | string | 是 | IP 地址或域名 |
| port | number | 否 | SSH 端口，默认 22 |
| username | string | 是 | SSH 用户名 |
| createdAt | number | 自动 | 创建时间戳 |
| updatedAt | number | 自动 | 更新时间戳 |

## 隧道（Tunnel）

```json
{
  "id": "t_xxxxxx",
  "name": "MySQL隧道",
  "hostId": "h_xxxxxx",
  "remoteHost": "127.0.0.1",
  "remotePort": 3306,
  "localPort": 33060,
  "autoConnect": true,
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 自动 | 格式 `t_<timestamp36><random>` |
| name | string | 是 | 隧道显示名称 |
| hostId | string | 是 | 关联的主机 ID |
| remoteHost | string | 否 | 远程目标地址，默认 127.0.0.1 |
| remotePort | number | 是 | 远程目标端口 (1-65535) |
| localPort | number | 是 | 本地监听端口 (1-65535) |
| autoConnect | boolean | 否 | 是否在插件启动时自动连接 |
| createdAt | number | 自动 | 创建时间戳 |
| updatedAt | number | 自动 | 更新时间戳 |

## 关系

- 一个主机可被多个隧道引用
- 删除主机时需先断开所有关联隧道的连接
