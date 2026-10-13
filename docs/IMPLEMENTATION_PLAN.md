# Poojaspace — Comprehensive Product & Technical Implementation Plan

**Product Name:** Poojaspace  
**Target User:** Pooja (Android Oppo phone user) & brother (developer/family architect)  
**Primary Platform:** Mobile-First Progressive Web App (PWA) on Android Chrome + Desktop/Tablet responsive  
**Authoritative Storage:** Pooja's own Google Drive (`https://www.googleapis.com/auth/drive.file`)  
**Deployment Cost:** ₹0 / Free tier (Static PWA hosting + Google Drive / Google One Family Storage)  

---

## 1. Executive Summary & Vision

Poojaspace is a warm, deeply personal, secure, and intuitive web application and PWA designed specifically for Pooja didi to preserve, organise, and cherish her photos, videos, documents, and memories in one tranquil, clutter-free space. 

Instead of routing family files through third-party databases, proprietary storage buckets (like Supabase's 1 GB free tier limit), or public file sharing links, Poojaspace uses **Pooja's own Google account** via the Google Drive REST API. By leveraging the narrow `drive.file` scope, the application only accesses files created by Poojaspace, maintaining strict privacy and zero ongoing infrastructure costs. If the family has an active Google One or Google AI subscription with family sharing enabled, Pooja can enjoy 20–40+ GB of high-speed cloud storage directly within her own Google ecosystem.

The application is tailored for her **Oppo Android phone**, featuring an installable PWA that integrates with the native Android Share sheet (`Gallery → Share → Poojaspace`), alongside a foolproof, multi-file **Quick Add** fallback.

---

## 2. Core Architecture & System Topology

```
+-----------------------------------------------------------------------------------+
|                           POOJA'S OPPO ANDROID DEVICE                             |
|                                                                                   |
|  [ Oppo Gallery / Photos ] ----( Android Share Sheet )----+                       |
|                                                           |                       |
|  [ In-App Quick Add Picker ]                              |                       |
|           |                                               v                       |
|           |                                 [ PWA Share Target ]                  |
|           |                                (POST /share-target)                   |
|           |                                           |                           |
|           |                                           v                           |
|           |                                  [ Service Worker ]                   |
|           |                                           |                           |
|           |                                (Extract File Blobs)                   |
|           |                                           v                           |
|           +--------------------------------> [ IndexedDB Queue ]                  |
|                                            (pending_shares & queue)               |
|                                                       |                           |
|                                                       v                           |
|  [ React 18 + TS UI ] <------------------ [ Upload Orchestrator ]                 |
|  - Bottom Mobile Nav                      - 2x Bounded Concurrency                |
|  - Warm Ivory & Rose Theme                - Chunked Resumable Upload (256 KiB)    |
|  - Photos, Videos, Docs, Albums           - Exponential Backoff & Jitter          |
|  - Recently Deleted & Recovery            - Truthful Byte Progress Meter          |
|  - Personal Memories & Details                        |                           |
|                                                       | (Memory-Only Bearer Token)|
|                                                       v                           |
+-------------------------------------------------------|---------------------------+
                                                        |
                                       HTTPS Direct REST API Calls
                                (drive.file scope, no server intermediary)
                                                        |
                                                        v
                        +-----------------------------------------------+
                        |             POOJA'S GOOGLE DRIVE              |
                        |                                               |
                        |  My Drive/                                    |
                        |    └── Poojaspace/                            |
                        |        ├── Photos/                            |
                        |        ├── Videos/                            |
                        |        ├── Documents/                         |
                        |        ├── Audio & Other Files/               |
                        |        ├── Albums/                            |
                        |        │     └── [User Album Folders]/        |
                        |        └── Recently Deleted/                  |
                        +-----------------------------------------------+
```

### Architecture Pillars:
1. **Zero Intermediate Backend / Direct-to-Drive:** Files stream directly from Pooja's browser to Google Drive's resumable upload endpoint. No backend server touches or inspects her media files.
2. **Narrow OAuth Scopes (`drive.file`):** Poojaspace only sees and touches files created by itself. It cannot read, alter, or delete unrelated Google Drive files, Google Docs, or Google Photos.
3. **PWA & Web Share Target:** Service worker intercepts `POST /share-target`, extracts multipart files, stages them in IndexedDB, and redirects to `/` or `/quick-add` to begin upload.
4. **Resumable Chunked Upload Engine:** Uploads use Google Drive's chunked resumable upload protocol (multiples of 256 KiB, e.g. 1 MiB or 2 MiB chunks), allowing pause/resume across cellular network drops.
5. **Truthful Status & Non-Destructive Invariant:** No simulated backups; verified Drive file ID and byte sizes are checked before marking files "Saved safely". Phone originals are never automatically deleted.

---

## 3. Data Flow & State Lifecycles

### 3.1. Upload State Machine
Every file progresses through a strict, deterministic state machine:

```
[QUEUED] ──> [WAITING_FOR_AUTH] (if token missing or expired)
    │               │ (user completes Google Auth)
    v               v
[INITIALIZING_SESSION] (POST /upload/drive/v3/files?uploadType=resumable)
    │
    v
[UPLOADING_CHUNKS] (PUT session URL with Content-Range)
    │           ▲
    │ (network) │ (retry with Content-Range: bytes */size)
    v           │
[RETRYING] ─────+
    │
    │ (all chunks sent, HTTP 200/201)
    v
[VERIFYING_METADATA] (GET /drive/v3/files/{id}?fields=id,name,size,parents)
    │
    +───> [COMPLETED] (Verified in Drive, IndexedDB queue cleared)
    │
    └───> [FAILED] (User notified with clear retry / discard action)
```

### 3.2. Google Drive Folder Taxonomy & Discovery
On initial authentication, the app runs `discoverOrCreateRootFolder()`:
1. Query: `mimeType = 'application/vnd.google-apps.folder' and name = 'Poojaspace' and trashed = false and 'root' in parents`
2. If found, save root ID in memory and verify standard subfolders:
   - `Photos`
   - `Videos`
   - `Documents`
   - `Audio & Other Files`
   - `Albums`
   - `Recently Deleted`
3. If not found, create root folder and subfolders idempotently. Folder IDs are kept in memory and synchronized across sessions.

### 3.3. Soft Deletion & Recovery Model
- Deleting an item in Poojaspace does **not** permanently delete it from Drive.
- The app patches the file:
  - `addParents: recentlyDeletedFolderId`
  - `removeParents: currentParentFolderId`
  - `appProperties: { originalParentId: currentParentFolderId, deletedAt: ISO_TIMESTAMP }`
- In `Recently Deleted` view, Pooja can tap **Restore**, which restores the file to `originalParentId` (or fallback to category folder).
- Permanent deletion requires a 2-step confirmation with a red warning modal.

---

## 4. UI/UX Design System & Ergonomics for Oppo Android

### 4.1. Visual Palette & Mood
- **Base Canvas:** Soft Warm Ivory (`#FAF7F2`) / Warm Linen (`#F4EFEB`)
- **Card Surfaces:** Pure Warm White (`#FFFFFF`) with subtle warm rose borders (`#F3E6E8`)
- **Primary Brand & Accents:** Rose Blush (`#D97082`), Warm Rose (`#E68395`), Rosy Terracotta (`#C2576B`)
- **Typography:** Muted Deep Plum (`#3B232E`) for headings, Charcoal Plum (`#523D47`) for body, ensuring WCAG AAA/AA contrast.
- **Accents:** Soft Sage Green (`#5C8271`) for success badges, Warm Amber (`#D9822B`) for warnings.
- **Typography Family:** Modern clean sans (`Outfit`, `Plus Jakarta Sans`, system `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)

### 4.2. Ergonomics for One-Handed Phone Use
- **Bottom Navigation Bar:** Fixed bottom bar with 44px+ touch targets:
  - 🏠 Home
  - 🖼️ Photos
  - 📁 Files & Docs
  - 📚 Albums
  - ➕ Quick Add (Central floating pill button)
- **Safe Area Insets:** CSS `padding-bottom: max(env(safe-area-inset-bottom), 16px)` to prevent cut-off on Oppo gesture bars.
- **Micro-interactions:** Smooth spring transitions, card hover/active feedback, haptic-style tap feedback on supported devices.

---

## 5. Implementation Milestones & Work Breakdown

### Milestone 0: Environment Setup & Project Initialization
- Scaffold Vite + React 18 + TypeScript + Tailwind CSS project.
- Configure `vite-plugin-pwa` with custom service worker (`sw.js`).
- Setup Lucide React icons, Vitest, Testing Library, and testing utilities.
- Configure `.env.example` and `.gitignore`.

### Milestone 1: App Shell, Design System & Personal Touches
- Implement design tokens in Tailwind configuration.
- Integrate Pooja's real assets from `assets/` into a respectful welcome banner, personal profile avatar, and memory highlights.
- Build mobile-first layout with top bar, bottom navigation, and slide-over drawers.
- Build view routing (Home, Photos, Videos, Documents, Albums, AlbumDetail, Favourites, RecentlyDeleted, Settings, Privacy, QuickAdd).

### Milestone 2: Google Identity Services (GIS) & Drive API Core Layer
- Implement `googleAuthService.ts`: GIS token client initialization, popup sign-in, token expiration listeners, sign-out, memory-only token storage.
- Implement `driveApiClient.ts`: REST API client for folder creation, folder discovery, file listing with pagination tokens, file metadata fetch, file moving/renaming, and appProperties management.
- Implement comprehensive unit tests with mocked Google responses.

### Milestone 3: Resumable Upload Engine & Truthful Queue
- Implement `uploadEngine.ts`:
  - 256 KiB aligned chunking (default 1 MiB chunk).
  - Session creation via `POST /upload/drive/v3/files?uploadType=resumable`.
  - Byte-accurate progress calculation.
  - Concurrency limiter (2 active uploads).
  - Auto-retry with jittered exponential backoff on network drop.
  - Post-upload metadata verification.
- Implement `UploadQueueModal` / `UploadProgressFloatingBar` UI.

### Milestone 4: Library Views, File Details, Albums & Recovery
- Build `PhotoGalleryView` with thumbnail rendering, safe lazy-loading, and lightbox.
- Build `DocumentListView` and `VideoPlayerView`.
- Build `AlbumManager`: create album, add to album, remove from album.
- Build `RecentlyDeletedView`: move to trash, restore to original parent, permanent delete modal.
- Implement search by file name, category filter, and sorting (newest, oldest, name, size).

### Milestone 5: Android PWA Web Share Target & Offline Resilience
- Configure `manifest.webmanifest` with `share_target` accepting images, videos, audio, and documents.
- Implement custom service worker route for `POST /share-target`.
- Implement `indexedDbService.ts` for transient share staging (`pending_shares` store).
- Implement reception hook in React app: load pending shares on mount, show "Waiting to upload — on phone only", and trigger queue when authenticated.

### Milestone 6: Security Hardening, Accessibility & Documentation
- Security verification: no tokens in storage, CSP headers, XSS prevention.
- Accessibility audit: 44px touch targets, focus outlines, screen-reader labels.
- Create all required documentation:
  - `docs/ARCHITECTURE.md`
  - `docs/GOOGLE_SETUP.md`
  - `docs/PRIVACY_AND_RECOVERY.md`
  - `docs/QA_CHECKLIST.md`

### Milestone 7: Automated Testing, Build & Device Release Verification
- Run Vitest test suite covering auth, upload queue, folder discovery, metadata, and share parsing.
- Run TypeScript compile check and production Vite build.
- Test preview locally and verify PWA installability.
- Compile final release report with instructions for Pooja and her brother.

---

## 6. Technical Risk Matrix & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Pooja's Google account out of quota** | High | Detect HTTP 403 quota errors immediately; stop queue safely; display friendly link to `one.google.com/storage`; never delete local files. |
| **Token expires during 1 GB video upload** | High | Upload engine catches 401; pauses upload; requests GIS token refresh; resumes chunk upload without restarting from byte 0. |
| **Oppo Gallery doesn't support Web Share Target** | Medium | Provide prominent "Quick Add" button directly inside the app; include illustrated step-by-step fallback guide in Settings. |
| **Service worker POST interception failure on static host** | Medium | Custom SW handler intercepts `/share-target` before network request reaches static hosting; transfers files to IndexedDB and responds with 303 redirect. |
| **Memory pressure from large videos** | High | Do NOT read whole files into memory (`readAsArrayBuffer`). Slice `File` chunks on demand during each HTTP PUT chunk request. |
| **Accidental file deletion** | High | Two-tier deletion: Files move to `Recently Deleted` folder with `originalParentId` preserved in `appProperties`. Permanent deletion requires explicit 2nd confirmation. |

---

## 7. Acceptance Criteria Checklist

- [x] Comprehensive implementation plan and architecture documented.
- [ ] Mobile-first PWA installs smoothly on Android Chrome.
- [ ] Authentic Google Drive integration via `drive.file` scope.
- [ ] Multi-file upload with chunked resumable upload and truthful byte progress.
- [ ] Photo gallery, video player, document viewer, albums, favourites, search, and sorting.
- [ ] Soft deletion to `Recently Deleted` with one-tap restoration.
- [ ] Android Web Share Target configuration with IndexedDB staging.
- [ ] Memory-only OAuth token security; zero credentials in git/bundle.
- [ ] Automated unit and component tests passing.
- [ ] Zero build warnings, clean TypeScript compile, and production-ready static assets.
