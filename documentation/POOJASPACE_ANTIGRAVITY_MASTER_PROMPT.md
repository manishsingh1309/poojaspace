# Poojaspace — Master Build Prompt for Google Antigravity

> **How to use this file:** Open the Poojaspace project folder in Google Antigravity, attach this Markdown file and the other Poojaspace documents from this pack as project knowledge/context, then paste the section **“START HERE — EXECUTION INSTRUCTIONS”** into the agent. Let Antigravity create its plan artifact first, then continue implementation through the phases below. Do not paste Google credentials, access tokens, refresh tokens, passwords, or private photos into the prompt.

## START HERE — EXECUTION INSTRUCTIONS

You are acting as a **principal product engineer, senior full-stack engineer, Google Drive API specialist, Android/PWA engineer, security engineer, QA lead, and product designer**. Build **Poojaspace**, a polished, genuinely usable personal files and memories web app for Pooja, who uses an Android Oppo phone. This is a family project built by her brother as a thoughtful personalised gift.

Do not stop after giving advice or generating a design mockup. Work in the actual repository, implement the real application, run it, test it, fix issues, and leave clear setup/release instructions.

### Required working method

1. **Inspect before changing anything.** Inspect the current repository, package manager, existing code, environment files, and git status. Preserve existing user work. Do not overwrite unrelated files or secrets.
2. **Research uncertain integration details.** Use current official Google Drive API, Google Identity Services, Chrome PWA/Web Share Target, and hosting documentation when behavior is uncertain. Do not rely on memory for API details. Keep permissions narrowly scoped.
3. **Create a Planning artifact before broad implementation.** Write an actionable plan with architecture, data-flow diagram, milestones, dependencies, risks, acceptance criteria, setup tasks, and test strategy. Save it as `docs/IMPLEMENTATION_PLAN.md` and expose a plan artifact in Antigravity. Include any discovery-specific changes to this brief.
4. **Then continue implementing the plan.** Do not stop after producing the plan. Proceed phase by phase without waiting for approval unless you encounter a genuine blocker requiring a secret, consent, a destructive action, or a decision that cannot reasonably be made safely. For missing credentials, implement the full integration, `.env.example`, setup instructions, mocks for automated tests, and a clear “not configured” state—never fake a successful cloud upload.
5. **Build incrementally and validate continuously.** After each milestone run relevant lint, type checks, tests and build; launch the app and use the browser/testing tools to inspect all routes and key flows. Fix actual errors rather than merely reporting them.
6. **Never misrepresent completion.** Distinguish code implemented, automated tests passing, and live Google Drive/Oppo-device integration verified. If real OAuth credentials or an Oppo device are unavailable, state exactly what still needs a manual test.
7. **Finish with a handoff.** Provide a concise architecture summary, implemented features, files changed, commands run and their results, required environment variables, Google Cloud configuration steps, deployment steps, test account setup, limitations, and a prioritized list of anything not verified.

## 1. Product mission

Create a calm, friendly, personal place where Pooja can save and find photos, videos, documents, PDFs, audio, and other files from one simple phone-first interface. It should feel like an app made specifically for her, not an impersonal enterprise dashboard.

Product name: **Poojaspace** (keep this spelling consistently across the UI, manifest, documentation, title and assets).

Primary user: Pooja, a non-technical Android/Oppo phone user. Optimise for one-handed use, clear language, large touch targets, low cognitive load, readable upload progress, and predictable recovery.

Product principles:
- Personal, warm, respectful, uncluttered, reassuring.
- Fast to learn; the main action should be obvious within seconds.
- Phone first, while still responsive on desktop/tablet.
- Private by default. No public file links or unexpected sharing.
- Files belong to Pooja's own Google account, not to a developer-owned database or an opaque service.
- Real persistence and transparent recovery—not a mock cloud UI.
- Never delete originals from the phone automatically.
- No paid services or billing setup should be required for the intended personal deployment. Verify current free-tier constraints before choosing/using a service.
- Never claim unlimited or independent free cloud storage. Actual capacity comes from the authenticated Google account's available Drive/Google One quota.

## 2. Core storage decision and costs

### Preferred architecture

Build a static React PWA hosted on a suitable free static-hosting tier and use the **Google Drive API as the actual file store**, authorised by the user who owns the files. Store uploaded files in a clearly named `Poojaspace` folder in Pooja's Google Drive. Her Google account remains the owner; files remain accessible in Drive even if the Poojaspace website is later removed.

For a possible zero-additional-cost 20–40 GB (or more) setup, the family may share storage from an already-paid eligible Google AI/Google One subscription. Verify the user's actual subscription and current Google terms before promising any number. Current plan details can change. The app itself does not create additional quota.

Recommended path:
1. If the user's current eligible Google AI/Google One plan includes family sharing, the plan manager may enable it and invite Pooja, subject to Google's country/family-group rules.
2. Pooja signs into **her own Google account** in Poojaspace. Uploads go to her Drive and consume the personal storage first, then eligible shared storage as Google specifies.
3. The app only accesses files it creates/has explicit per-file access to, using the narrow `https://www.googleapis.com/auth/drive.file` scope plus basic identity scopes (`openid`, `email`, `profile`) as needed.
4. Do not use broad `drive` or `drive.readonly` scopes simply for convenience. Do not request all-Drive access unless the architect proves a requirement that cannot be met with narrower permissions, and document why before changing this design.

### Explicit non-goals / cost restrictions

- Do not store media in Supabase Storage as the main library: the free storage quota is far below the target collection size. Supabase is not required for the initial one-user design.
- Do not add Firebase Storage, Cloudinary, S3/R2, paid database services, paid AI API calls, paid monitoring, or subscription-only infrastructure without explicit approval.
- Do not use a Google service account as a shortcut to obtain consumer Drive capacity; it does not create free personal Drive storage.
- Do not expose a Google OAuth client secret or refresh token in frontend code, `.env` values prefixed with `VITE_`, browser storage, source control, logs or screenshots.
- Do not route large videos through a serverless request body just to forward them. Upload media directly from the browser to Drive using a documented, browser-compatible upload strategy.
- If current Drive quota is too small, show the limit clearly and stop safely. Never imply the files were backed up when the upload failed.

## 3. Preferred stack

Use the smallest reliable stack that fits a secure personal PWA:

- **React + TypeScript + Vite**.
- **Tailwind CSS** for design tokens and responsive styling.
- **vite-plugin-pwa / Workbox** or the most appropriate maintained PWA integration for the current Vite version.
- **Lucide React** (or similarly lightweight icons) with consistent stroke and sizing.
- React Router only if it materially simplifies the routes; otherwise use a small route structure.
- Vitest + React Testing Library for unit/component tests; Playwright if the environment supports reliable browser E2E tests.
- Google Identity Services for OAuth/token consent, and the official Drive API REST endpoints or official JS client where appropriate.
- Browser IndexedDB only for transient pending-share/upload queue records and non-sensitive performance caches. It is not the authoritative store for user files.
- The Google Drive folder tree and file metadata are the source of truth for persistent user content. Avoid adding a database unless a documented requirement truly justifies it.
- Deploy as a static site on a free tier appropriate for a personal, non-commercial project. Prefer a single stable HTTPS production origin for OAuth and PWA installation.

Use stable, compatible package versions and document the reason for any unusual dependency. Keep the bundle small; avoid heavy UI frameworks when simple components suffice.

## 4. Information architecture and required pages

Implement actual routes/views, not decorative buttons. Every interactive control must have a meaningful working behavior or be clearly disabled with an explanation.

### A. First-run welcome and account connection

- Brand name and friendly welcome: “Welcome to your space, Pooja” / a similarly natural, not over-sentimental tone.
- A small personal note such as “A little space for the things you want to keep.”
- Explain in plain language that files will be saved to the Google account she chooses.
- A **Connect Google Drive** action with a short permissions explanation.
- Show the signed-in email after connection so she can confirm the right account.
- Do not create uploads until the Drive connection is ready.
- If OAuth is not configured, show a developer-facing but understandable “Google Drive setup is incomplete” message in local development; never pretend sign-in worked.

### B. Home dashboard

- Clear welcome and compact account/connection status.
- One dominant **Quick add** / **Upload files** action.
- Shortcuts: Photos, Videos, Documents, Albums, Favourites, Recently deleted.
- “Recently added” section with a small, performant number of items.
- Space used by Poojaspace files, calculated from visible file sizes. Label it accurately as **Poojaspace files**, not total Google account use unless the API can read that reliably with the chosen allowed scopes.
- Link to Google storage management for the actual account quota. If total quota cannot be queried without broader scopes, do not request those scopes merely to draw a storage meter.
- Friendly first-time empty state with clear next step.

### C. Quick Add / Upload queue

Support all of these entry points:
1. Tap **Quick add** and choose one or many files from Android's file picker/gallery.
2. Accept common photos, videos, PDFs, office documents, audio, archives and other file types. Do not assume every Android/Oppo file has a reliable MIME type; use extension/size fallback and allow “All files” via the picker.
3. Receive photos/videos/files shared from another Android app using PWA Web Share Target, when browser/device support is available and the PWA is installed.
4. Allow drag/drop on desktop as an additional, not primary, path.

Upload UI requirements:
- Multi-file queue, per-file progress and total progress.
- Clear state labels: Waiting, Uploading, Paused (if implemented), Retrying, Completed, Failed, Needs connection.
- Cancel/remove a queued file before it uploads; retry failures.
- Two or another small capped number of concurrent uploads to avoid memory/network pressure on phones.
- Avoid automatically preloading file contents or huge video blobs.
- Detect offline/online changes and pause/retry politely.
- Use resumable/chunked Drive uploads for large media and interruptions where supported by the API. Research the current official API behavior; do not hand-wave resumability.
- If a token expires during a queue, request re-authorisation safely and resume if the current upload session supports it.
- Handle duplicate-looking files with a warning (e.g. same name + size); never block distinct files based only on a filename.
- On quota errors, stop the queue and show specific steps to check/free Google storage. Do not delete local originals.
- Verify the final file metadata and byte size after upload before labelling it successfully saved.
- Keep the upload screen open during upload; explain that browser/PWA background uploads are not guaranteed if Android suspends or closes the app.
- Optional wake-lock support while uploads are active is fine only if feature-detected and reliably released on completion/navigation.
- Never show “Backed up” or “Saved safely” before Drive confirms upload completion and metadata verification.

### D. Android Gallery / Share-sheet quick add

This is a high-priority differentiator.

Implement a PWA manifest `share_target` accepting common image, video and document MIME types/extensions. After Poojaspace is installed on Chrome for Android, it should be eligible to appear as a destination in the Android Share menu where supported. A flow should be: Gallery/Photos app → select one or more items → Share → Poojaspace → review/confirm if needed → automatic upload queue → clear completion result.

Implementation requirements:
- Use the correct manifest fields, method and `multipart/form-data` for file shares.
- If the app is static-hosted, handle the POST target through a service-worker strategy that receives the request, transfers `File` objects to an IndexedDB pending-share queue, then redirects to a normal app route. Verify this pattern against current Chrome documentation; do not assume a static host automatically supports POST routes.
- Do not upload to a server-side staging bucket. Files should move from the phone/browser directly to the user's Drive after the user has connected their account.
- Keep the original file names and avoid converting/compressing the originals by default.
- If the share arrives before OAuth is ready, persist it temporarily in IndexedDB, show a clearly labelled **Waiting to upload — still only on this phone** state, and prompt the user to connect Drive. Delete temporary queue blobs only after verified cloud upload or explicit user cancellation.
- Handle shared multiple files, no-file shares, unknown MIME types, duplicate taps, navigation interruption, IndexedDB quota exhaustion, app reload, and an upload interrupted midway.
- If sharing from a particular Oppo Gallery version is unsupported, the normal multi-select Quick add must still work and the setup/help page must explain the fallback. Test on a real Oppo/Android/Chrome device before claiming full share-sheet compatibility.
- No background camera-roll monitoring or automatic full-gallery sync: a web app cannot safely promise native-app level background access. Only upload files the user selects or deliberately shares.

### E. Library

Tabs/filters for:
- All files
- Photos
- Videos
- Documents
- Audio / Other files
- Favourites
- Albums
- Recently deleted

Required controls:
- Search by file name.
- Sort by newest, oldest, name, size; filter by file category/date as practical.
- Grid/list toggle where useful.
- Paginated or virtualised rendering for large libraries; do not load thousands of full-size blobs simultaneously.
- Friendly empty states and sensible loading skeletons.
- Thumbnails only when provided or fetched safely; lazy load and release object URLs to prevent memory leaks.
- Stable pagination using Drive API page tokens and correct filtering; handle folders, pagination errors and revoked access.

### F. File detail / preview

For each file, show name, type, byte size, uploaded date, and containing album/folder where available. Provide:
- Safe preview when feasible.
- Download original.
- Open in Google Drive where a valid link is available.
- Rename and move to another folder/album.
- Favourite/unfavourite.
- Move to Recently deleted / restore.
- Share externally only through an intentional, clearly explained Google Drive sharing workflow; do not create anyone-with-link permissions.

Large-video handling is important: do not fetch every video into memory to draw the library. Only fetch content after the user requests playback/download. If a video is too large for reliable in-browser preview, offer “Open in Drive” or “Download original” rather than risking a crash. Never put OAuth access tokens in query strings or media URLs.

For uploaded HTML, SVG, scripts or unknown active content, do not render as trusted same-origin HTML. Prefer download or an external safe viewer. Treat names/content as untrusted.

### G. Albums

- Create, rename and open albums.
- Put a file in one clear parent folder so Drive is the persistent source of truth; avoid fragile duplicate file copies for album membership.
- Show image/file count, cover image where available, and last updated time.
- Moving a file changes its parent correctly and preserves the actual file (not a second copy).
- If moving is not supported for an item, show the real failure and preserve the original.
- Allow moving files out of an album back to a category folder.

### H. Recently deleted and recovery

- Default delete action should **move files to a `Recently Deleted` folder inside Poojaspace**, not immediately permanently delete them.
- Preserve enough metadata to restore a file to its previous folder/album.
- Restore is one tap with success/error feedback.
- Permanent deletion, if implemented, must require a clear warning and a second explicit confirmation. Never perform it automatically.
- Explain that files in Recently deleted still use storage until permanently removed; this is intentional to protect recovery.
- If Drive API permissions allow it, provide a link to Google Drive's own trash for account-level recovery, but do not promise recovery after Google permanently removes a file.
- Removing the PWA or revoking access must not remove files from Drive.
- Never delete the original phone copy after upload.

### I. Settings and Help

- Signed-in Google account email and reconnect/disconnect flow.
- Upload defaults (e.g. open uploads into Photos/Videos or a chosen album).
- Optional duplicate warning setting.
- PWA install help with Android/Chrome steps.
- “Add from Gallery” guide: open Gallery → select files → Share → Poojaspace; if absent, install/update PWA and use Quick add.
- Storage usage by Poojaspace assets; link to Google account storage management.
- Privacy/explanation page: which account is used, what the app can access, where files are stored, no auto-upload, no phone originals deletion, how to restore, and how to revoke OAuth access.
- Support/reset options that do not accidentally delete Drive content. “Reset app preferences” must not delete files.

### J. Helpful system states

Design polished views for: loading, empty library, first sign-in, disconnected account, access denied, revoked permission, offline mode, upload queue, quota full, unsupported file preview, missing folder, Drive API rate limit, file moved outside app, partial list failure, server/hosting error, expired token, failed upload, completed upload, pending local share, IndexedDB quota reached, no network, and maintenance/setup incomplete.

## 5. Drive data model and folder structure

Create the following inside Pooja's Drive the first time she connects (or discover the app-created folder if it already exists):

```
My Drive/
  Poojaspace/
    Photos/
    Videos/
    Documents/
    Audio & Other Files/
    Albums/
      <user-created album folders>/
    Recently Deleted/
```

Details:
- Root and folders must be created idempotently; repeated sign-in must never create duplicate `Poojaspace` trees.
- Drive API is the source of truth. Use a stable root folder ID discovered through Drive API. Do not depend only on localStorage for the root folder ID; rediscover after reinstall/cleared browser state.
- Store files as ordinary Drive files the user can see in Drive. Avoid hidden-only `appDataFolder` as the only place where user files live.
- Prefer a folder tree and Drive metadata over a new database. A file should exist once, with one actual parent folder; don't rely on multiple parents.
- Add small app-specific metadata using Drive `appProperties` if needed for favourites or original parent ID; follow current field-size/permission limitations. If the metadata pattern becomes brittle, use a documented simple index file in the app folder and implement safe updates/rebuilds. Do not make the app's only file index a single fragile local browser object.
- `Recently Deleted` restore metadata must be recoverable. If custom properties are missing, fail safely and offer a safe manual recovery option rather than deleting or moving a file incorrectly.
- For rename/move/delete operations, check API success, update the UI from the returned metadata, and roll back optimistic UI where necessary.
- Lists must filter only within the Poojaspace tree. Never crawl or list the user's unrelated Drive contents.

## 6. Google OAuth and API integration

Use Google Identity Services and the smallest viable OAuth scope set. Research current setup docs before implementation.

- Scopes: `openid email profile https://www.googleapis.com/auth/drive.file` unless a documented, verified technical need requires a change.
- Client ID is public configuration; it may be in `VITE_GOOGLE_CLIENT_ID`. Never place a client secret or refresh token in frontend environment variables.
- Do not save access tokens to localStorage. Prefer memory-only access-token state. On page reload/expiration, request the token again through a user-visible Google reconnect/continue action; use a silent/non-forced consent path only when supported and test its fallback.
- Avoid logging tokens, authorization headers, filenames that may be private, file contents or OAuth response bodies.
- Show exactly which Google account is connected. If multiple accounts are signed in, offer a clear way to confirm/change account.
- On 401/expired token: stop new uploads, keep queue files intact, request reconnect, and resume only after a valid token is supplied.
- On 403 scope/permission error: display an understandable permission message and a reconnection flow; do not silently request wider scopes.
- On 429/quota/rate error: use bounded exponential backoff with jitter, respect retry-after where available, and keep queue state.
- On quota exceeded: preserve pending files, show instructions, and never claim success.
- Only use `drive.file` to create/list/read/update/delete files the app created or that the user explicitly selected/shared with the app. Do not implement full-Drive search or use the broad `drive` scope.
- Keep the access token out of query strings, URLs, analytics events, crash reports and persisted browser storage.
- Google consent-screen and domain verification requirements vary by app status and scopes. Add Pooja as a test user for a private test app if appropriate, and document any verification/authorized-domain warnings. Do not attempt to bypass Google's requirements.
- Handle the no-client-ID state gracefully; app shell should still render setup instructions but must not pretend Drive is connected.

## 7. Upload implementation details

- Use a browser-compatible, documented Google Drive resumable upload flow for large assets; research the current endpoint and CORS/header behavior.
- Prefer resumable uploads for videos and large files; chunk sizes should obey official requirements (research the current multiple-of-256-KiB guidance). Do not set an arbitrary tiny file-size limit without evidence.
- Choose a conservative, capped concurrency for Android.
- Report progress accurately. Do not fabricate percentages if the underlying API does not provide enough information.
- On network failures, retry boundedly and keep local pending data until final verification.
- After Drive returns a completed file, fetch metadata needed for listing and confirm file ID, parents, size and type.
- If upload succeeded but the final verification request failed, mark it “Uploaded, checking…” or “Needs verification” and attempt safe reconciliation; do not blindly create duplicate files on retry.
- Use original bytes by default. Do not auto-compress, resize, strip metadata or convert formats unless Pooja explicitly chooses such a feature later.
- Don't claim uploads continue after the app/browser is closed. Android/Chrome may suspend background tabs/PWAs, especially under battery optimisation. Handle resume when the app reopens.
- Avoid huge memory usage: don't read whole multi-GB videos into ArrayBuffers just to start an upload. Do not load every media file as a Blob for grid rendering.
- Add file size/count summaries before upload where possible, without slowing selection. Show per-file failure reason with retry/remove action.
- If an upload is cancelled, clean up local queue records and any temporary app-created incomplete metadata when safely possible; document eventual expiry behavior if Drive session cancellation cannot be guaranteed.

## 8. IndexedDB and PWA offline behavior

- Use IndexedDB for transient queue files passed through the Web Share Target route and necessary resumable-upload state only if current browser behavior requires it. Never use localStorage for multi-megabyte file blobs.
- Delete pending local blobs only after verified upload or explicit user cancellation.
- Provide a warning that pending items labelled “only on this phone” are not yet stored in Drive; clearing browser/site data could remove them.
- Handle IndexedDB transaction failures, storage quota errors, duplicate share-target POSTs, service-worker update races and queue corruption safely.
- The service worker should cache the app shell and static assets sensibly, not private user files by default. Do not cache OAuth-protected file API responses in a shared Cache API cache.
- Build with the correct PWA manifest, icons, `display: standalone`, theme colors, `scope`, `start_url`, and `share_target`.
- Do not claim offline browsing of the entire cloud library. The app shell can open offline and explain that remote library actions require connection; pending local files can remain queued if stored successfully.
- Do not treat service worker background sync as guaranteed on Android.

## 9. Visual design direction

Create an original, consistent interface—not a generic admin dashboard. Warm, softly personal, modern, calm and very easy for a first-time user.

Suggested direction (adjust if a better coherent design emerges):
- Warm ivory/cream base, soft blush/rose accents, muted plum text and small sage/green highlights. Avoid low-contrast pastel-on-pastel text.
- Rounded but not excessively bubbly cards, delicate botanical or memory/scrapbook motifs, small moments of warmth, plenty of whitespace.
- Use a simple custom monogram/wordmark for Poojaspace. Do not copy another product's branding.
- Use real photos of Pooja only after the user supplies them. Until then, create attractive abstract decorative shapes/illustrations; do not invent a portrait or use random stock people as if they were Pooja.
- Make the main Quick add action visually obvious. Use bottom navigation on small screens where helpful, and no more than a manageable number of top-level destinations.
- Use responsive grids: one/two columns on narrow mobile depending on content, larger adaptive grids on tablet/desktop.
- Minimum 44×44 px effective touch targets, readable typography, clear focus states, accessible labels, keyboard support, reduced-motion support, sufficient contrast, and no critical action represented by icon-only buttons without accessible names.
- Use skeletons/empty states that are reassuring but quick. Avoid long decorative animations.
- The app should feel good on a low/mid-range Android phone and mobile data. Lazy-load, paginate/virtualise, optimise icons and avoid needless video preloads.
- Include light/dark mode only if it can be done consistently without delaying the core reliability work; light mode must be polished first.
- If photos are later provided, use them sparingly (e.g. a profile/welcome card or optional album cover) and ensure the user can remove/change them.

## 10. Navigation and mobile ergonomics

- Mobile-first layout; verify at narrow 320–360 px widths as well as common Android widths, tablet, and desktop.
- Use safe-area-aware bottom navigation, avoid covering the upload button with the keyboard, preserve scroll position appropriately, and keep destructive controls away from common thumb taps.
- Handle Android browser back navigation predictably, especially from preview/upload routes.
- Prevent duplicate form submissions and double-tap upload actions.
- Confirm leaving during active uploads and explain whether files are still uploading or waiting locally.
- Use labels people understand (e.g. “Photos”, “Videos”, “Documents”, “Recently deleted”) rather than technical terms such as “resource collection”.
- Provide an “Install Poojaspace” prompt only when supported and appropriate; always show the manual Chrome menu steps if not.

## 11. Security and privacy requirements

Treat family photographs and documents as private data.

- Least privilege: OAuth scopes limited to `openid email profile drive.file` by default. Never request broad Drive access without documented justification.
- Every file remains private in Google Drive by default. Never create `anyone` permissions, public links, or share files automatically.
- No server-side copy of media; no media analytics/telemetry; no third-party upload host.
- Do not expose client secrets, refresh tokens, access tokens or resumable upload URLs in logs, URLs, error telemetry or committed files.
- Tokens should be in memory only. If an upload-session URL must persist temporarily to support resume, evaluate it as sensitive state; keep it in origin-isolated IndexedDB with minimal lifetime, clear it when complete, and document the tradeoff. Do not place it in localStorage.
- Escape/render user filenames as text. Never inject a filename into `innerHTML`. Avoid XSS and unsafe HTML previews.
- Apply a restrictive Content Security Policy suitable for the chosen Google endpoints, plus `X-Content-Type-Options: nosniff`, a safe `Referrer-Policy`, `frame-ancestors 'none'`/appropriate frame restriction, and a restrictive Permissions Policy where compatible. Do not break OAuth popups—test CSP carefully.
- Keep dependencies limited and audit/package-lock committed. Don't add remote scripts, unneeded analytics, trackers or remote fonts.
- Keep app logs useful but free of personal file metadata and secrets.
- If a future backend is added, require a separate threat model before adding secret-bearing functions. Never store Google refresh tokens in client code.
- Add a plain-language Privacy page explaining that files go to Pooja's connected Google Drive, not to a separate Poojaspace cloud; explain permissions; explain pending-local uploads; explain recovery; explain that the brother/developer cannot see files merely because he built the app unless Pooja separately shares them or authorises access through another path.
- Provide a “Disconnect Google Drive” flow that clears local token state and revokes/disconnects the session if supported; it must not delete files.
- Never automatically delete files from Android Gallery/Photos.

## 12. Resilience and edge cases

Plan for and handle at least:
- No environment/client ID configured.
- Google login cancelled, popup blocked, multiple accounts or wrong account chosen.
- Consent declined, scope revoked, access token expired, account disabled.
- Root folder already exists, duplicate same-name folder, folder missing or moved.
- File name contains emoji, non-English characters, very long name, leading/trailing spaces, duplicate names or unsupported characters.
- Empty file, zero-byte file, unknown MIME type, file type mismatch, large video and corrupted file.
- Many files selected, same name and size, partial batch failure, duplicate tap, page refresh during upload.
- Slow network, airplane mode, connection drop mid-chunk, server 5xx, API quota/rate limits, storage quota reached.
- User backgrounds or closes PWA, Android/Oppo kills process, phone locks or browser reloads.
- Share-target receives one file, many files, no usable file, unsupported type, duplicate POST, unauthenticated state or IndexedDB write failure.
- Service worker old/new version mismatch and pending file migration.
- API response missing thumbnails/size/parents; a file was moved or deleted directly in Drive.
- Browser storage cleared while files remain in Drive.
- Drive API reports success but client does not receive response (safe reconciliation, avoid duplicate upload).
- Trash/restore operation fails or original parent was removed.
- Offline state with some queued files already uploaded.
- Storage accounting does not equal account-wide quota; label it accurately.
- Upload finishes but phone original remains; make this clear and never remove it automatically.

Use error types and user-facing messages that explain next action. Avoid leaking raw OAuth/API responses to the UI. Keep diagnostic details in development logs only and redact sensitive fields.

## 13. Performance expectations

- Never download full media to render a thumbnail grid.
- Lazy-load images; use thumbnails when available; revoke Blob/object URLs when no longer needed.
- Paginate and virtualise long libraries instead of rendering the full collection at once.
- Limit concurrent network operations; debounce search; cache only safe metadata needed for speed and reconcile with Drive on reconnect.
- Avoid reading large files entirely into memory for hashing/deduplication. Do not implement expensive whole-file hashing by default.
- Make initial app shell fast and resilient on Android data/mobile hardware.
- Ensure file operations remain reliable with thousands of files/folders (pagination and query correctness matter).

## 14. Testing strategy and definition of done

### Automated tests

Create tests for:
- Folder discovery/creation idempotency.
- Drive listing pagination and filtering to the Poojaspace tree only.
- Upload-state reducer/queue transitions.
- Retry and token-expiry behavior.
- Quota-exceeded and permission-denied errors.
- File classification for common, unknown and missing MIME types.
- Move/rename/trash/restore metadata handling.
- Share-target request parsing and IndexedDB persistence/recovery.
- Storage-size calculation and precise labels.
- Filename rendering safety.
- Main mobile navigation/empty states and no-config state.

Use mocks for Google APIs in automated tests; don't require a private real token to run unit tests.

### End-to-end/manual acceptance checks

1. Fresh install: welcome → connect Drive → correct account shown.
2. First upload: choose multiple photos → upload progress → success only after verification → items appear in Drive's `Poojaspace` folder.
3. Upload one video large enough to exercise resumable/chunked upload; disconnect network mid-upload, reconnect, recover/retry, verify one final file—not duplicates.
4. Upload PDF and an unknown/other file type.
5. Refresh/reopen PWA; files remain listed from Drive.
6. Rename, favourite, move to album, move to Recently deleted, restore to original folder.
7. Reach quota/API failure test state using mocks; original files are untouched and no false success shown.
8. Check Google account used and least-privilege scope shown on OAuth consent.
9. Install the PWA on a real Android/Oppo phone using HTTPS; select several photos/videos in Gallery/Photos → Share → Poojaspace; confirm files arrive in the queue and upload. If unsupported in the available environment, report it explicitly and give a reliable Quick add fallback.
10. Test wrong/no OAuth config, cancelled consent, token expiry, offline, service worker update, deleted site data, 320px width, reduced motion and keyboard navigation.
11. Verify no media is sent to unrelated backends, no public Drive permissions are created, no secrets in git/build assets, and no files are deleted from the phone.
12. Run all configured commands (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build` or equivalent) and fix failures.

### Done means

- The app uses real Drive APIs for actual uploads and library operations once configured. Demo data is never mistaken for a real backup.
- All core buttons/routes are functional or clearly disabled with a reason.
- Responsive UI is polished and usable on Android.
- PWA installation is configured correctly.
- Share Target is implemented if feasible and has a real-device test status, not a claim based on manifest presence alone.
- Auth scopes are minimal and secrets are not exposed.
- Error, recovery and quota states exist.
- Build/test status and manual tests are accurately reported.
- Setup and recovery instructions are written for a developer who has never configured this exact Google project.

## 15. Suggested implementation milestones

### Milestone 0 — Reconnaissance and plan
Inspect repo and current official documentation; write plan and risk register. Choose stable dependency versions. Identify any platform blocker early.

### Milestone 1 — App shell and design system
Set up React/TypeScript/Vite/Tailwind, routing, responsive layout, wordmark, navigation, empty states, page structure, PWA manifest and icons. All visual components should work with fixture data while integration is being built, but fixture data must be clearly isolated from real mode.

### Milestone 2 — Drive/OAuth foundation
Configure GIS token flow, account identity, permission states, Drive API client wrapper, root folder discovery/creation, folder utilities, least-privilege error handling and `.env.example`. Add tests with mocked APIs.

### Milestone 3 — Real upload and library
Implement Quick add, queue, resumable uploads, progress, verified success, Drive-backed listing, previews/download, file metadata display, search/sort/pagination, and accurate space-used accounting.

### Milestone 4 — Organisation and recovery
Implement categories, albums, move/rename/favourite, Recently deleted, restore, safe destructive-action confirmation and privacy/help/settings.

### Milestone 5 — Android share target and resilience
Implement installed-PWA file Share Target with service-worker/IndexedDB handoff where supported; add pending-local-state, reconnect, retry, large-file and interrupted-upload handling. Test on browser/device tools and document the physical Oppo verification checklist.

### Milestone 6 — Security, accessibility and visual polish
Apply headers/CSP, verify narrow scopes, check keyboard/contrast/reduced motion, perform responsive sweeps, performance pass and privacy review.

### Milestone 7 — Release verification and handoff
Run tests/build, inspect runtime/browser behavior, write exact Google Cloud setup, deploy steps, install instructions, data-recovery guide and an honest verification report.

## 16. Repository deliverables

Create or update these files as appropriate:

- `README.md` — project description, local setup, env vars, scripts, deployment, PWA install and core behavior.
- `docs/IMPLEMENTATION_PLAN.md` — execution plan/architecture/risk register.
- `docs/ARCHITECTURE.md` — storage flow, OAuth, folder model, upload/recovery data flow.
- `docs/GOOGLE_SETUP.md` — Google Cloud Console, Drive API, consent screen/test users, OAuth web client origins, environment variables and verification caveats.
- `docs/PRIVACY_AND_RECOVERY.md` — permissions, data ownership, pending local queue, Google Drive trash, disconnect and recovery steps.
- `docs/QA_CHECKLIST.md` — automated and physical-device acceptance checks.
- `.env.example` — placeholders only, no valid credentials.
- `vercel.json` or hosting configuration only when required for headers/SPA/PWA behavior. If headers are added, verify that GIS and Drive API still function.
- PWA manifest + custom app icons that do not infringe anyone's branding.
- Unit/component/e2e tests and realistic test fixtures.

Do not create a fake `BACKUP COMPLETE` success page or screenshots that imply cloud integration is verified when credentials are absent.

## 17. Required final report

At the end, return:
1. What was built and why the architecture uses Drive as storage.
2. The top user flows and how to test each.
3. Exact setup steps and the only required Google Cloud/environment variables.
4. Exact dev/build/test commands and results.
5. Deployment and Android installation instructions.
6. How to add photos using Gallery → Share → Poojaspace, plus the Quick add fallback.
7. What “20–40 GB free” depends on, and how to verify actual available storage in Google One/Drive.
8. Security/privacy/recovery notes.
9. Any known limitations, especially share-sheet compatibility on the physical Oppo phone, browser background-upload limitations, quota limits and OAuth verification/domain setup.
10. A clear separation of **implemented**, **automatically tested**, and **manually verified on a real account/device**.

Build it like a careful production-minded engineer who cares about Pooja's real files and comfort. Reliability, privacy, honest status and one-tap usability are more important than adding fancy features.
