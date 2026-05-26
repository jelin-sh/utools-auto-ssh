# 部署指南

## 开发环境

```bash
# 1. 安装根项目依赖
npm install

# 2. 安装 preload 依赖
cd public/preload && npm install && cd ../..

# 3. 启动开发服务器
npm run dev
```

在 uTools 开发者工具中导入项目根目录，`plugin.json` 中的 `development.main` 指向 `http://localhost:5173`。

## 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录。需要确保 `dist/preload/` 目录包含 `node_modules/`（ssh2 依赖）。

## 打包发布

1. 执行 `npm run build`
2. 确保 `dist/` 包含：
   - `index.html`
   - `assets/`（JS/CSS）
   - `plugin.json`
   - `preload/`（含 services.js, data-store.js, ssh-manager.js, node_modules/）
   - `logo.png`
3. 使用 uTools 打包工具生成 `.upx` 文件

## 注意事项

- `preload/` 目录下的 `node_modules` 需要手动安装（`cd public/preload && npm install`）
- 生产环境需移除 `plugin.json` 中的 `development` 字段
- 密码存储使用 `utools.db`，卸载插件后数据会被清除
