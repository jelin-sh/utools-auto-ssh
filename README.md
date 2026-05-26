# AutoSSH - SSH 隧道管理器

uTools 插件，用于管理 SSH 隧道连接，将服务器端口映射到本地端口。

## 功能

- **主机管理**：配置 SSH 服务器（地址、端口、用户名、密码）
- **隧道管理**：配置本地端口转发规则
- **自动连接**：支持插件启动时自动建立指定隧道
- **实时状态**：连接状态实时显示，断线自动重连

## 技术栈

- Vue 3 + Vite
- Naive UI（组件库）
- ssh2（SSH 客户端）
- uTools Plugin API

## 开发

```bash
# 安装依赖
npm install
cd public/preload && npm install && cd ../..

# 开发模式
npm run dev

# 生产构建
npm run build
```

在 uTools 开发者工具中导入项目目录即可调试。

## 文档

- [架构设计](architecture.md)
- [数据模型](data-model.md)
- [Preload API](preload-api.md)
- [部署指南](deployment.md)
