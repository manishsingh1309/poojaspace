# Poojaspace — Product & Technical Implementation Plan

## Executive recommendation

Build Poojaspace as a **mobile-first Progressive Web App (PWA)** installed from Chrome on Pooja's Oppo Android phone. Use Google Drive as the authoritative file store, with Pooja authorising access to her own Google account. Make Android Gallery/Photos → Share → Poojaspace the premium quick-add workflow, and keep a multi-file Quick add picker as the reliable fallback.

Avoid Supabase Storage as the primary media store: its current free storage quota is about 1 GB, far below the desired library. A static PWA plus Drive API avoids a second storage bill and avoids storing family media on an app server. Any 20–40 GB target depends on actual Google Drive/Google One quota. If the family's already-paid Google AI/Google One plan supports family storage sharing, invite Pooja and share the allowance; do not describe this as unlimited or free forever.

## Product goals

1. Pooja can upload photos, videos, PDFs, office documents, audio and other files from one easy interface.
2. A file selected from Android Gallery can be shared into the installed Poojaspace PWA with minimal steps, where supported.
3. Uploaded items remain in Pooja's Google Drive even if the website is removed.
4. Poojaspace never deletes original phone files automatically.
5. A failed or interrupted upload is clearly labelled and can be retried safely.
6. She can browse, search, organise, favourite, download, move, trash and restore files.
7. The app is visually personal and comfortable on a phone, with accessible controls and clear language.
8. The recurring cost of the app is ₹0 extra on appropriate free hosting and when available Drive capacity is already covered by the user's existing plan.

## Non-goals for version 1

- Automatic background camera-roll backup of the whole phone. A PWA cannot promise native-app style always-on background gallery access.
- A new cloud-storage service that creates 20–40 GB of free quota.
- Multi-family collaboration, public links, team permissions, chat, AI classification, face recognition, OCR, or a heavy server/database.
- Automatic deletion of phone originals, automatic duplicate deletion, or irreversible deletion without confirmation.
- Public App Store/Play Store publishing.

## User journeys

### Journey 1: First-time setup
1. Pooja opens the HTTPS website in Chrome.
2. Welcome screen explains that files will be saved to the Google account she chooses.
3. She taps Connect Google Drive, chooses her own account and grants the narrow `drive.file` permission.
4. Poojaspace finds/creates the app's root folder and category folders in her Drive.
5. The Home screen shows Quick add, Photos, Videos, Documents, Albums and Recently deleted.
6. Install guidance invites her to add the app to the Home Screen so it appears like an app.

### Journey 2: Quick add from Gallery
1. Pooja selects one or several photos/videos in Oppo Gallery or Google Photos.
2. Taps Share and selects Poojaspace, if that Gallery/browser combination offers the installed PWA as a share target.
3. The PWA receives the shared files and stores them in a temporary IndexedDB queue until the Drive connection is ready.
4. Poojaspace shows file names, sizes, destination and upload progress.
5. Files upload directly to Drive; completed files are verified by ID/size metadata.
6. The UI states exactly which files are saved and which failed/remain on the phone.
7. Phone originals remain untouched.

Fallback: tap Quick add inside Poojaspace and select multiple files using Android's picker.

### Journey 3: Find and organise
1. Open Photos/Videos/Documents/All files.
2. Search, sort, filter or browse paginated/virtualised results.
3. Open item detail to view metadata, preview where feasible, download or open in Drive.
4. Move to an album, favourite or rename; the real Drive item is updated.

### Journey 4: Recover an accidentally deleted item
1. Choose Delete → item moves to Poojaspace/Recently Deleted; no permanent delete.
2. Recently deleted view clearly explains it still occupies Drive storage.
3. Tap Restore → file returns to its original folder/album.
4. Permanently delete, if implemented, requires an explicit second confirmation.

## Architecture

### System overview

```text
Oppo Android / Chrome PWA
  ├── React + TypeScript UI
  ├── PWA manifest + service worker
  ├── Quick add file picker
  ├── Android Web Share Target
  │     └── POST → service worker → IndexedDB pending-share queue
  ├── Upload queue + progress/retry state
  └── Google Identity Services access token (memory only)
            │
            └── HTTPS Drive API requests directly from the browser
                         │
                         ▼
                 Pooja's Google Drive
                  └── Poojaspace/
                      ├── Photos/
                      ├── Videos/
                      ├── Documents/
                      ├── Audio & Other Files/
                      ├── Albums/<album folders>/
                      └── Recently Deleted/
```

No media server, Supabase Storage, or third-party media bucket is needed in the preferred v1 architecture.

### Why this design

- **Data ownership:** Pooja's account owns the files; she can still reach them in Google Drive if Poojaspace goes away.
- **Cost control:** no separate paid storage tier is required by the app itself. Actual capacity comes from her account/pool.
- **Privacy:** a narrow `drive.file` scope is intended for files the app creates/uses, rather than reading all Drive contents.
- **Simple operations:** Drive folders and files are the source of truth. A database is unnecessary for a single-user first version.
- **Android UX:** the Web Share Target API can register an installed PWA as a Share destination on supporting browsers. This must be tested against the actual Oppo Gallery app.

## Data structure

```text
Poojaspace/
  Photos/
  Videos/
  Documents/
  Audio & Other Files/
  Albums/
    Family/
    Travel/
    Special Moments/
  Recently Deleted/
```

A file has one real parent folder. Moving files updates parent relationships rather than creating duplicates. Browse views can classify by MIME type regardless of the folder. Keep custom `appProperties` small (for example, a favourite flag or previous parent ID when needed) and follow current Drive API constraints. Never make browser local storage the only record of where files exist.

## Upload/recovery state model

Suggested upload states:

- `queued` — user selected/shared the file; not yet uploaded.
- `waiting_for_auth` — file still temporarily on device; Drive not connected.
- `uploading` — active Drive resumable upload.
- `retrying` — temporary network/API failure; bounded retry underway.
- `needs_reconnect` — access token expired/revoked; queue preserved.
- `uploaded_verifying` — Drive upload response received, metadata verification pending.
- `completed` — Drive confirms file ID, parent, and byte size.
- `failed` — permanent error with explanation and retry/remove option.
- `cancelled` — user explicitly removed from queue.

Do not display the local queue as cloud storage. If IndexedDB has not been able to persist a shared file, tell the user and do not silently navigate away or claim it is safe.

## Security model

- OAuth scopes: `openid email profile drive.file` by default.
- Client ID may be public frontend configuration; no client secret or refresh token belongs in the browser.
- Access tokens live in memory; do not persist them to localStorage.
- All files remain private. Never create public Drive permissions.
- No analytics or logging of private file names/content by default.
- Service worker caches the application shell, not private Drive responses.
- User filenames and MIME types are untrusted input.
- Use secure hosting headers/CSP and test OAuth/Drive endpoints against them.
- The app can be used only against the authorised user's Drive data. Keep all queries scoped to the Poojaspace folder tree.
- Clearly document the limitations of a front-end-only app and keep secrets out of it.

## Key technical risks and mitigations

| Risk | Mitigation |
|---|---|
| Actual Google plan has insufficient quota | Check current account/plan before onboarding; show quota errors; never claim free quota is created by the app. |
| OAuth setup/domain/verification blocks deployment | Use least scope, add test users for private testing, document exact console requirements, verify the chosen production origin before release. |
| Static hosting does not natively handle Share Target POST | Implement a service-worker POST interception + IndexedDB handoff after verifying current Chrome guidance; maintain Quick add fallback. |
| Oppo Gallery doesn't list installed PWA | Test on the actual phone; verify app is installed and Chrome supports it; make multi-select Quick add obvious. |
| Large/unstable video upload fails | Use Drive resumable uploads, bounded concurrency, retries, progress and verification. |
| App closes during upload | Do not promise background continuation; preserve queue/session state as safely as feasible and resume when reopened. |
| Drive scope can't read overall storage quota | Show Poojaspace's own total and link to Google storage management; do not request broad scopes just for a meter. |
| Accidental deletion | Move to Recently Deleted by default; allow restore; require second confirmation for permanent deletion. |
| OAuth token leaks | In-memory tokens, no query-string tokens, no sensitive logs, restrictive CSP, limited dependencies. |
| Browser storage is cleared | Drive remains source of truth; queue may be lost only before upload, which is clearly explained. |
| Fake demo mode confuses user | Isolate fixtures from real mode; display “Demo data” unmistakably; no fake upload success. |
| Too many files degrade UI | Drive pagination, lazy thumbnails, list virtualization and no mass media preloading. |

## Implementation phases

1. **Reconnaissance/plan:** inspect repository, document assumptions, check current official docs, map acceptance criteria.
2. **App shell:** React/TS/Vite/Tailwind, responsive design tokens, routes, PWA shell, original icons, sample-state fixtures.
3. **OAuth/Drive layer:** Google Identity Services, selected account display, Drive wrapper, root-folder create/find idempotency and permission/error model.
4. **Real library and upload queue:** multi-select, resumable uploads, progress, retries, metadata verification, listing, pagination and performance.
5. **Organisation/recovery:** albums, favourites, rename/move, Recently Deleted/restore, downloads and safe previews.
6. **Android quick-add:** manifest share target, service-worker/IndexedDB handoff, pending queue, no-auth and storage-error cases.
7. **Hardening/polish:** security headers, accessibility, file-preview safety, responsive review, performance and error states.
8. **Release verification:** unit tests, typecheck, build, browser E2E, Android/Oppo physical test when possible, deployment and recovery documentation.

## Acceptance criteria

- [ ] Actual photos/videos/PDFs upload to the intended Google Drive account.
- [ ] Uploaded files remain visible in Drive's Poojaspace folder after closing/reopening the PWA.
- [ ] Files are not shown as safely backed up before upload + verification complete.
- [ ] Multi-file uploads show accurate progress and preserve pending items through retry/reconnect.
- [ ] One large video upload is manually exercised and a network interruption is tested.
- [ ] Gallery/Photos → Share → Poojaspace works on the real Oppo phone, or the exact device limitation is documented with Quick add fallback tested.
- [ ] Rename, move, favorite, trash and restore operations work against actual Drive files.
- [ ] Poojaspace never deletes phone originals automatically.
- [ ] No Google client secret/refresh token appears in frontend code, git, built assets or logs.
- [ ] Only narrow OAuth scopes are requested; the app creates no public file permissions.
- [ ] No real media is sent to Supabase/another provider in the preferred design.
- [ ] Quota-full, offline, token-expired, permission-denied and unknown-file-type states are handled.
- [ ] All controls are functional, keyboard-accessible and readable on mobile.
- [ ] All automated checks and production build pass; manual checks are separately reported.
- [ ] Setup, storage ownership and recovery documentation is complete.

## Current official references to review during implementation

- Google Drive API scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Google Drive resumable uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Google OAuth scopes: https://developers.google.com/identity/protocols/oauth2/scopes
- Google One family storage: https://support.google.com/googleone/answer/9004015
- Current Google AI plan benefits for India: https://one.google.com/intl/en_in/about/google-ai-plans/
- Chrome Web Share Target: https://developer.chrome.com/docs/capabilities/web-apis/web-share-target
- Supabase Storage pricing, if reconsidered: https://supabase.com/docs/guides/storage/pricing
- Google Antigravity planning artifacts: https://www.antigravity.google/docs/artifacts/
