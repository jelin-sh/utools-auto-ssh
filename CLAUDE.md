# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install                          # Install renderer dependencies
cd public/preload && npm install     # Install preload Node.js dependencies (ssh2)
npm run dev                          # Start Vite dev server (localhost:5173)
npm run build                        # Production build to dist/
```

uTools development: import project root in uTools developer tools. `plugin.json` has `development.main` pointing to dev server.

## Architecture

This is a **uTools plugin** with a two-process architecture:

### Renderer (Vue 3 + Naive UI) — `src/`
SPA with tab-based navigation (no vue-router). `App.vue` switches between `HostsView` and `TunnelsView` via `n-tabs`. Naive UI components are auto-imported via `unplugin-vue-components`.

### Preload (Node.js / CommonJS) — `public/preload/`
Runs in Node.js context with full system access. Exposes `window.services` to renderer.

- **services.js** — Aggregation entry point, re-exports all API functions
- **data-store.js** — CRUD for hosts/tunnels stored as JSON files in `utools.getPath('userData')/.autossh/`. Passwords stored separately in `utools.db` with key `pwd/<hostId>`
- **ssh-manager.js** — SSH connection lifecycle using `ssh2` + `net.createServer` for local port forwarding (`ssh -L` equivalent). Handles reconnection with exponential backoff (max 3 retries)

### Communication Boundary

All renderer→preload calls go through `window.services`. The renderer never imports Node.js modules. Async status updates flow from preload to renderer via `onStatusChange(callback)` callback pattern.

### SSH Tunnel Core Pattern

Each tunnel = one `ssh2.Client` connection + one `net.Server` listening on local port. Incoming local connections trigger `client.forwardOut()` to create an SSH stream. Multiple tunnels can reference the same host (each gets its own SSH connection).

## Key Constraints

- **Preload uses CommonJS** (`require`/`module.exports`) — the renderer uses ESM
- **uTools DB API is synchronous** — all data-store CRUD returns values directly, not Promises
- **SSH operations are async** — `connectTunnel()` returns a Promise
- **Plugin lifecycle**: `onPluginEnter` fires when user opens plugin, `onPluginOut` when hidden. SSH connections persist in preload context when UI is hidden
- **No `development` block** in production `plugin.json` — remove before publishing
- **Preload `node_modules/`** must be included in distribution package (contains ssh2 native bindings)
