# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies (requires Node.js 20+)
npm run dev          # Start Vite dev server (renderer only, no Electron)
npm run electron:dev # Start full Electron dev mode with hot reload
npm run build:vite   # TypeScript check + Vite build only (no packaging)
npm run build        # Full production build + electron-builder installer → release/
npm run lint         # ESLint across all .ts/.tsx files, zero warnings allowed
```

> Node.js is not in the default PATH on this machine. The system Node is bundled inside Cursor at `C:\Users\Xhoni\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe`. Install Node.js LTS from nodejs.org before running any npm commands.

## Architecture

This is a two-process Electron app. The **main process** (`electron/`) handles all file I/O and persistence. The **renderer process** (`src/`) is a React SPA that never touches the filesystem directly — it communicates exclusively through `window.electronAPI`.

### IPC boundary

The full API contract lives in `electron/preload.ts` as the `ElectronAPI` type, mirrored in `src/global.d.ts`. Every renderer call goes through `window.electronAPI.<method>()` → `ipcRenderer.invoke(channel)` → a handler registered in `electron/ipc/<domain>.ipc.ts`. When adding a new IPC channel, you must update all three: the handler file, `preload.ts`, and `src/global.d.ts`.

IPC channels follow the `domain:action` naming convention (e.g. `library:add-book`, `progress:save`).

### Persistence

`electron/services/store.ts` is a single `electron-store` instance with a typed schema (`StoreSchema`). All data lives in `%APPDATA%/ink-book-reader/store.json`. Book files are never copied — only their path is stored. Covers and custom fonts are copied into `%APPDATA%/ink-book-reader/covers/` and `fonts/` respectively (managed by `electron/utils/paths.ts` and `electron/services/fontManager.ts`).

### Renderer state

Five Zustand stores manage all UI state:

- `libraryStore` — books array + `filteredBooks` (always a derived copy kept in sync, not computed lazily). Search and sort are applied inside the store, so components read `filteredBooks` directly.
- `readerStore` — the currently open book, reading progress, bookmarks, and search results. Opening a book calls `window.electronAPI.updateLastOpened` and loads progress/bookmarks from IPC.
- `settingsStore` — `AppSettings` with `isDark` derived field. Theme is applied by `useTheme` writing to `document.documentElement.dataset.theme`.
- `fontStore` — custom fonts list. `useFonts` hook injects them into the document via the `FontFace` API using base64 data URLs fetched from the main process.
- `quoteStore` — Quote Studio modal state and canvas config.

### Reader hooks

Each format has a dedicated hook that owns the format-specific library instance:

| Hook | Library | Position type |
|------|---------|---------------|
| `useEpub` | epubjs | CFI string |
| `usePdf` | pdfjs-dist | Page number (string) |
| `useTxt` | — | Scroll fraction (string, 0–1) |
| `useHtml` | DOMPurify | Scroll fraction (string, 0–1) |

All hooks call `useProgress` internally, which debounces saves by 1 second. Position strings stored in `ReadingProgress.position` are format-specific — cast appropriately when restoring.

### Build outputs

- `dist/` — Vite renderer bundle (HTML/JS/CSS)
- `dist-electron/` — compiled main process (`main.js`, `preload.js`)
- `release/` — electron-builder packaged installer

Vite builds main and preload as separate entry points (see `vite.config.ts`). Both output to `dist-electron/`. Node built-ins (`fs`, `path`, `crypto`) and Electron-only packages (`electron-store`, `epubjs`, `pdfjs-dist`) are externalized in the main process build and must never be imported in renderer code.

### Adding a new IPC feature

1. Add handler in `electron/ipc/<domain>.ipc.ts` and register it in `electron/main.ts`
2. Expose the method in `electron/preload.ts` (`ElectronAPI` type + `api` object)
3. Mirror the type in `src/global.d.ts`
4. Call from a Zustand store or hook via `window.electronAPI.<method>()`

### Quote Studio canvas pipeline

`useQuoteCanvas` (`src/hooks/useQuoteCanvas.ts`) renders directly to a `<canvas>` element. The preview canvas scales to fit its container; the export always renders at the full configured resolution (`canvasWidth × canvasHeight` from `QuoteConfig`). Export flow: `canvas.toDataURL()` → `quoteStore.exportImage()` → IPC `export:save-image` → `showSaveDialog` + `fs.writeFile`.
