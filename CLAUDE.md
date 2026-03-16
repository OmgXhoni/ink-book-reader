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

### macOS: build, sign, and run

```bash
npm run build
codesign --force --deep --sign - "release/mac-arm64/Ink Book Reader.app"
pkill -f "Ink Book Reader" ; sleep 3 ; open "release/mac-arm64/Ink Book Reader.app"
```

Use `;` (not `&&`) between pkill and open so open always runs even if no process was found.

### macOS: prepare DMG for distribution

After building, strip extended attributes before repackaging the DMG — otherwise Gatekeeper marks the app as "damaged" for users who download it:

```bash
codesign --force --deep --sign - "release/mac-arm64/Ink Book Reader.app"
xattr -cr "release/mac-arm64/Ink Book Reader.app"
npx electron-builder --mac dmg
```

## Architecture

Two-process Electron app. The **main process** (`electron/`) handles all file I/O and persistence. The **renderer process** (`src/`) is a React SPA that communicates exclusively through `window.electronAPI`.

### App shell

`AppShell` (`src/components/layout/AppShell.tsx`) is the top-level component. It renders a resizable sidebar (`LibraryPanel`) alongside the main content area. When `readerStore.activeBook` is non-null the sidebar auto-collapses and `ReaderView` takes over; it reverts when the book is closed.

`ReaderView` dispatches to the correct reader component based on `activeBook.format`:

| Format | Component | Hook |
|--------|-----------|------|
| `epub` | `EpubReader` | `useEpub` (epubjs) |
| `pdf` | `PdfReader` | `usePdf` (pdfjs-dist) |
| `txt` | `TxtReader` | `useTxt` |
| `html` | `HtmlReader` | `useHtml` (DOMPurify) |

### IPC boundary

The full API contract lives in `electron/preload.ts` as the `ElectronAPI` type, mirrored in `src/global.d.ts`. Every renderer call goes through `window.electronAPI.<method>()` → `ipcRenderer.invoke(channel)` → a handler in `electron/ipc/<domain>.ipc.ts`. When adding a channel, update all three: handler file, `preload.ts`, and `src/global.d.ts`.

IPC channels follow `domain:action` (e.g. `library:add-book`, `progress:save`).

### Persistence

`electron/services/store.ts` — single `electron-store` instance typed with `StoreSchema`:
- `library: Book[]`
- `progress: Record<bookId, ReadingProgress>`
- `bookmarks: Record<bookId, Bookmark[]>`
- `highlights: Record<bookId, Highlight[]>`
- `settings: AppSettings`
- `fonts: CustomFont[]`

Data lives in `<userData>/store.json` (macOS: `~/Library/Application Support/ink-book-reader/`). Book files are never copied — only `filePath` is stored. Covers and fonts are copied into `<userData>/covers/` and `<userData>/fonts/` by `electron/utils/paths.ts`.

### Renderer state (Zustand stores)

- `libraryStore` — books + `filteredBooks` (always a derived copy, kept in sync with search/sort applied inside the store)
- `readerStore` — active book, progress, bookmarks, highlights, search results. Opening a book loads bookmarks and highlights via IPC; they are passed as props into the reader components.
- `settingsStore` — `AppSettings`. Theme written to `document.documentElement.dataset.theme` by `useTheme`.
- `fontStore` — custom fonts injected via `FontFace` API (base64 from main process).
- `quoteStore` — Quote Studio modal state and canvas config.

### Reader hooks

All reader hooks call `useProgress` internally (1-second debounced saves). Position strings in `ReadingProgress.position` are format-specific:

| Hook | Position type | Notes |
|------|--------------|-------|
| `useEpub` | CFI string | epubjs manages rendition inside an iframe |
| `usePdf` | Page number string | Continuous scroll; all pages rendered as stacked DOM nodes |
| `useTxt` / `useHtml` | Scroll fraction (0–1 string) | — |

### PDF renderer details

`usePdf` renders every page as a `div.pdf-page-wrapper[data-page="N"]` stacked inside the scroll container. Each wrapper holds:
1. A `<canvas>` (`pointer-events:none`) for the rendered page image
2. A `.pdf-text-layer` div (`pointer-events:auto`, `user-select:none`) with absolutely-positioned `<span>` elements (`user-select:text`) from pdfjs `TextLayer`
3. `.pdf-highlight-overlay` divs (absolutely positioned, `pointer-events:none`) for visual highlights

Current page is tracked by scroll overlap detection. `goToPage(n)` scrolls the wrapper into view.

**PDF highlights** store page-relative pixel rects (`HighlightRect[]` on the `Highlight` type). On selection, rects come from `range.getClientRects()` filtered to the anchor page wrapper's bounds and converted to page-relative coordinates. The page number is read from `pageWrapper.dataset.page` (not from scroll-tracked state). The re-apply effect clears all `.pdf-highlight-overlay` from all pages before re-rendering to keep overlays in sync with the store.

**pdfjs worker in packaged app**: the worker URL contains `app.asar/` which must be rewritten to `app.asar.unpacked/` at runtime — this is handled in `usePdf`'s `initPdf`.

### Toolbar layout

`ReaderToolbar` uses a three-section layout:
- Left (`flex:1`): back button + book title
- Center (`position:absolute; left:50%`): prev / page-X-of-Y / next — shown for all formats when `totalPages > 1`
- Right (`flex:1; justify-end`): TOC (EPUB only), search, annotations, bookmark, settings

### Build outputs

- `dist/` — Vite renderer bundle
- `dist-electron/` — compiled main + preload
- `release/` — electron-builder output (`.app` + `.dmg` on macOS)

Vite externalizes `electron`, `electron-store`, `epubjs`, `pdfjs-dist`, `adm-zip`, and Node built-ins from the main process build. These must never be imported in renderer code.

DevTools opens automatically in dev mode (`VITE_DEV_SERVER_URL` is set) and is intentionally disabled in production builds.

### Adding a new IPC feature

1. Add handler in `electron/ipc/<domain>.ipc.ts`, register in `electron/main.ts`
2. Expose in `electron/preload.ts` (`ElectronAPI` type + `api` object)
3. Mirror in `src/global.d.ts`
4. Call via `window.electronAPI.<method>()` from a store or hook

### Quote Studio

`useQuoteCanvas` renders to `<canvas>`. Preview scales to container; export uses full `canvasWidth × canvasHeight` from `QuoteConfig`. Export: `canvas.toDataURL()` → `quoteStore.exportImage()` → IPC `export:save-image` → `showSaveDialog` + `fs.writeFile`.
