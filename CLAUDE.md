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

Must follow this exact sequence. Two rules that must both be satisfied:
1. Sign each component **inside-out** (helpers → framework → main app) **without** `--deep` and **without** `--options runtime`. Using `--deep` leaves generic `Electron Helper` identifiers; using `--options runtime` (hardened runtime) triggers "damaged" without notarization.
2. Strip xattr from the `.app` before DMG packaging and from the `.dmg` after.

```bash
npm run build:vite
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir
# Sign inside-out, no hardened runtime:
find "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks" \( -name "*.dylib" -o -name "*.so" \) -exec codesign --force --sign - {} \;
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks/Ink Book Reader Helper (Renderer).app"
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks/Ink Book Reader Helper (Plugin).app"
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks/Ink Book Reader Helper (GPU).app"
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks/Ink Book Reader Helper.app"
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app/Contents/Frameworks/Electron Framework.framework"
codesign --force --sign - "release/mac-arm64/Ink Book Reader.app"
xattr -cr "release/mac-arm64/Ink Book Reader.app"
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dmg
xattr -cr "release/Ink Book Reader-1.0.0-arm64.dmg"
```

Result: `flags=0x2(adhoc)` on all components, `com.ink.bookreader.*` identifiers, sealed resources — Gatekeeper shows "unverified" warning (bypassable) instead of "damaged" (not bypassable).

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

`usePdf` renders every page as a `div.pdf-page-wrapper[data-page="N"]` stacked inside the scroll container. Each wrapper holds a `<canvas>` (`pointer-events:none`) for the rendered page image. Pages are fit-to-page scaled (`Math.min(scaleW, scaleH) * zoomLevel`). Current page is tracked by scroll overlap detection. `goToPage(n)` scrolls the wrapper into view.

**PDF text selection and highlighting are currently disabled.** No text layer or highlight overlays are rendered. EPUB highlighting remains fully functional. A backup of the removed PDF highlight code is saved at `ink-book-reader-pdf-highlight-backup.txt` (local + Google Drive).

**PDF zoom**: `zoomLevel` state (default 1.0) with `zoomIn`/`zoomOut` callbacks (±0.15, range 0.3–3.0). Toolbar shows zoom controls (vertical-stem magnifying glass icons) for PDF only.

**pdfjs worker in packaged app**: the worker URL contains `app.asar/` which must be rewritten to `app.asar.unpacked/` at runtime — this is handled in `usePdf`'s `initPdf`.

### Toolbar layout

`ReaderToolbar` uses a three-section layout:
- Left (`flex:1`): back button + book title
- Center (`position:absolute; left:50%`): prev / page-X-of-Y / next — shown for all formats when `totalPages > 1`
- Right (`flex:1; justify-end`): TOC (EPUB only), zoom (PDF only), search, annotations, bookmark, settings

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
