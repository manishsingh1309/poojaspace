# Poojaspace — Quality Assurance, Security & Release Checklist

**App Version:** 1.0.0  
**Target Device:** Oppo Android Phone (Chrome PWA)  
**Evaluation Date:** October 2026  
**Status Legend:**
- ✅ **Pass**: Implemented and verified via automated tests or code inspection.
- 📱 **Manual Test on Real Device Required**: Requires physical Oppo phone with live Google account.
- ⚠️ **Config Required**: Requires adding live `VITE_GOOGLE_CLIENT_ID` in `.env.local`.

---

## 1. Product & UX Verification

| Item | Requirement | Status | Notes |
| :--- | :--- | :---: | :--- |
| 1.1 | App name reads **Poojaspace** consistently | ✅ Pass | Verified in manifest, index.html, header, and all components |
| 1.2 | Warm, loving welcome banner for Pooja didi | ✅ Pass | Features Pooja's personal photograph from assets (`hero.jpg`) |
| 1.3 | Reassuring brotherly note ("Made with love") | ✅ Pass | Highlighted in Home view with festive photo (`special one.jpg`) |
| 1.4 | Dominant Quick Add floating action | ✅ Pass | Central elevated rose pill in bottom navigation bar |
| 1.5 | Direct shortcuts to Photos, Videos, Docs, Albums | ✅ Pass | Implemented on Home and in navigation bar/drawer |
| 1.6 | Storage meter accurately labeled | ✅ Pass | Labeled as "Poojaspace files", with link to Google One |
| 1.7 | Touch targets ≥ 44px for one-handed mobile use | ✅ Pass | Verified with `min-touch-target` CSS class (44px min height/width) |
| 1.8 | Safe-area padding for Android gesture navigation | ✅ Pass | CSS `max(env(safe-area-inset-bottom), 16px)` implemented |
| 1.9 | Responsive layouts tested across viewports | ✅ Pass | Mobile (320px–420px), tablet, and desktop grids |
| 1.10 | Accessible contrast and reduced-motion support | ✅ Pass | WCAG compliant palette + `prefers-reduced-motion` media queries |

---

## 2. Authentication & Privacy Verification

| Item | Requirement | Status | Notes |
| :--- | :--- | :---: | :--- |
| 2.1 | Narrow OAuth scope (`drive.file`) only | ✅ Pass | Verified in `googleAuthService.ts` and automated test suite |
| 2.2 | No broad `drive` or `drive.readonly` requested | ✅ Pass | Verified via code audit and Vitest test |
| 2.3 | Memory-only access token storage | ✅ Pass | Never stored in `localStorage` or `sessionStorage` |
| 2.4 | Zero client secrets in frontend code | ✅ Pass | Only public Client ID (`VITE_GOOGLE_CLIENT_ID`) allowed |
| 2.5 | Zero third-party storage or telemetry | ✅ Pass | Direct-to-Drive only, no Supabase/S3/analytics |
| 2.6 | User can see connected Google email | ✅ Pass | Displayed in header pill, drawer, and settings |
| 2.7 | Graceful unconfigured / preview state | ✅ Pass | When Client ID is absent, shows clear "Demo Preview Mode" |
| 2.8 | Disconnecting Drive wipes memory session safely | ✅ Pass | Tested: files in Drive are completely untouched |
| 2.9 | Plain-language Privacy page | ✅ Pass | Six clear principles documented in `PrivacyView.tsx` |

---

## 3. Google Drive Integration Verification

| Item | Requirement | Status | Notes |
| :--- | :--- | :---: | :--- |
| 3.1 | Idempotent folder tree discovery and creation | ✅ Pass | Verified in `driveApiClient.test.ts` unit tests |
| 3.2 | Standard categories: Photos, Videos, Documents | ✅ Pass | Subfolders created idempotently under `My Drive/Poojaspace/` |
| 3.3 | Custom albums created under `Poojaspace/Albums/` | ✅ Pass | `createAlbum()` creates real subfolder under `Albums/` |
| 3.4 | Files listed with pagination & Poojaspace filter | ✅ Pass | Scoped strictly to parent IDs within Poojaspace tree |
| 3.5 | File rename & move between albums | ✅ Pass | `renameFile()` and `moveFile()` update Drive metadata |
| 3.6 | Favourites flag in `appProperties.favourite` | ✅ Pass | Verified in automated test suite |
| 3.7 | Soft-delete to `Poojaspace/Recently Deleted/` | ✅ Pass | Preserves `originalParentId` in `appProperties` |
| 3.8 | One-tap restore to original folder | ✅ Pass | Verified in `driveApiClient.test.ts` |
| 3.9 | Two-step confirmation for permanent delete | ✅ Pass | `ConfirmDialog` with destructive red warning |
| 3.10 | Truthful storage calculation | ✅ Pass | Sums bytes of visible Poojaspace files |

---

## 4. Upload Engine & Mobile Resilience

| Item | Requirement | Status | Notes |
| :--- | :--- | :---: | :--- |
| 4.1 | Multi-file queue with per-file status | ✅ Pass | Verified in `uploadEngine.test.ts` |
| 4.2 | 256 KiB aligned chunking for resumable upload | ✅ Pass | `CHUNK_SIZE = 1024 * 1024` (4 × 256 KiB) |
| 4.3 | Session resume query on network drop | ✅ Pass | Queries session status via `Content-Range: bytes */size` |
| 4.4 | Bounded concurrency (max 2 parallel uploads) | ✅ Pass | Prevents Android browser memory overflow |
| 4.5 | Exponential backoff with jitter on retry | ✅ Pass | Max 4 retries with jittered delay up to 10 seconds |
| 4.6 | Post-upload metadata verification | ✅ Pass | Queries file ID & size before marking `completed` |
| 4.7 | Screen wake-lock during active upload | ✅ Pass | Uses `navigator.wakeLock.request('screen')` politely |
| 4.8 | Quota exceeded detection (HTTP 403) | ✅ Pass | Pauses queue, shows clear link to `one.google.com/storage` |
| 4.9 | Zero phone originals deletion | ✅ Pass | Non-destructive invariant strictly maintained |

---

## 5. Android PWA & Web Share Target

| Item | Requirement | Status | Notes |
| :--- | :--- | :---: | :--- |
| 5.1 | Valid `manifest.webmanifest` with standalone mode | ✅ Pass | Verified: valid JSON with icons, theme, and start URL |
| 5.2 | Service worker with precaching and offline shell | ✅ Pass | `src/sw.ts` built with `vite-plugin-pwa` injectManifest |
| 5.3 | Intercept `POST /share-target` on static host | ✅ Pass | SW intercepts multipart POST and stages into IndexedDB |
| 5.4 | Pending share recovery on app mount | ✅ Pass | Alerts user with "Waiting to upload (on phone only)" |
| 5.5 | Direct Share from Oppo Gallery to Poojaspace | 📱 Manual Test on Device | Requires installed PWA on actual Oppo Android phone |
| 5.6 | Reliable in-app Quick Add fallback | ✅ Pass | File picker supports multiple images, videos, and all files |

---

## 6. Build, Compilation & Automated Tests

| Command | Expected Output | Status |
| :--- | :--- | :---: |
| `npm run typecheck` | 0 errors | ✅ **PASS** |
| `npm test` | 12 tests passed | ✅ **PASS** |
| `npm run build` | Clean production bundle in `dist/` | ✅ **PASS** |
| Dev server startup | HTTP 200 on `http://localhost:5173/` | ✅ **PASS** |
