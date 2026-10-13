# Poojaspace — QA, Security and Release Checklist

Use this as a manual sign-off sheet. Mark status honestly: **Pass**, **Fail**, **Blocked**, or **Not tested**. “The code looks correct” is not a substitute for a real upload test.

## Product and UX

- [ ] App name reads Poojaspace everywhere; no placeholder brand text remains.
- [ ] Welcome copy tells Pooja which Google account will store files.
- [ ] One clear Quick add action is visible on the mobile Home screen.
- [ ] Photos, Videos, Documents, Albums, Favourites and Recently deleted are easy to find.
- [ ] Empty, loading, offline, no-permission and error states are designed.
- [ ] Every visible button is functional or explicitly disabled with a reason.
- [ ] Touch targets are comfortable; controls don't overlap bottom navigation/keyboard.
- [ ] Responsive widths tested at 320 px, 360–390 px, tablet and desktop.
- [ ] Keyboard/focus states, accessible labels and reduced-motion preference work.
- [ ] Loading library never downloads every full-size photo/video.
- [ ] Text is clear and non-technical; no false “unlimited” or “backup complete” claims.

## Authentication and privacy

- [ ] Only `openid`, `email`, `profile`, and `drive.file` requested unless a reviewed exception is documented.
- [ ] No broad `drive`/`drive.readonly` scope.
- [ ] User can see which Google email is connected.
- [ ] Cancelled consent, popup blocked and wrong account are handled clearly.
- [ ] Expired token reconnects without losing local pending files.
- [ ] Access tokens are not stored in localStorage or written to logs.
- [ ] No OAuth client secret, refresh token or private credential in frontend code/build output/Git.
- [ ] No public Drive permission is created.
- [ ] No hidden media upload to analytics or third-party storage.
- [ ] User filenames are rendered as text; no untrusted HTML execution.
- [ ] Privacy page explains data ownership, scopes, pending-local queue and recovery.
- [ ] Disconnecting Drive does not delete any file.

## Google Drive integration

- [ ] New account creates one `Poojaspace` root folder and expected category folders.
- [ ] Reconnecting does not create duplicates.
- [ ] Queries are scoped to app-created `Poojaspace` content only.
- [ ] Listings paginate correctly.
- [ ] Uploaded files are ordinary, visible files in the user's Drive.
- [ ] File names, byte sizes, MIME types and parent folders are preserved correctly.
- [ ] Upload completion is not declared before Drive response and metadata verification.
- [ ] An ambiguous network outcome does not create duplicates on retry.
- [ ] Search, sort, favourites, move, rename, trash and restore affect actual Drive items.
- [ ] Recently deleted preserves original folder information and allows restore.
- [ ] Permanent delete, if present, requires deliberate confirmation.
- [ ] Storage meter is accurately labelled and doesn't misrepresent account quota.
- [ ] Drive quota exceeded stops uploads safely; originals remain untouched.

## Upload and mobile resilience

- [ ] One photo uploads successfully.
- [ ] Multiple photos upload with accurate per-file progress.
- [ ] A video uploads successfully; a large/resumable video is tested.
- [ ] PDF and office document upload.
- [ ] Unknown MIME/file extension path is usable.
- [ ] Duplicate-looking items get a non-blocking warning rather than auto deletion.
- [ ] Network disconnect/reconnect retries without silently losing items.
- [ ] Token expiry during queue triggers safe reconnect.
- [ ] Cancel queued file works.
- [ ] Failed file shows reason and retry/remove actions.
- [ ] Upload queue remains truthful after page refresh/reopen.
- [ ] App explains pending IndexedDB items are still only on the device.
- [ ] IndexedDB quota/write failure is visible and safe.
- [ ] Background/screen-lock limitations are not misrepresented.
- [ ] Original camera-roll file is never removed.

## Android PWA and Share Target

- [ ] `manifest.webmanifest` has correct name, icons, colors, scope, start URL, display and file `share_target`.
- [ ] App serves over HTTPS and is installable.
- [ ] PWA is installed on an actual Oppo Android phone with Chrome (record model/OS/browser version).
- [ ] Oppo Gallery/Google Photos → select one file → Share → Poojaspace works.
- [ ] Multi-file share works.
- [ ] Shared files with no active Google connection remain visibly pending only if successfully stored in IndexedDB.
- [ ] Supported and unsupported MIME types are handled.
- [ ] Share target POST is correctly handled by the service worker/static-host strategy.
- [ ] Duplicate POST/reload/service worker update does not drop or double-upload files.
- [ ] Files upload directly to Drive; no server-side staging/media upload occurs.
- [ ] Quick add picker works even if Share Target fails on this device.
- [ ] Help page says the Share option requires an installed PWA and compatible browser/app.

## Security headers / code quality

- [ ] CSP permits required Google Identity/Drive endpoints and blocks unnecessary external scripts.
- [ ] `X-Content-Type-Options: nosniff` set where appropriate.
- [ ] Safe referrer policy and restrictive permissions policy configured.
- [ ] Frame embedding is blocked where compatible with OAuth.
- [ ] Service worker caches app shell, not private OAuth-protected media API responses.
- [ ] Dependency lockfile committed; unnecessary packages removed.
- [ ] `.env.local` ignored by Git; `.env.example` has placeholders only.
- [ ] Production logs don't contain tokens, filenames or personal file metadata.
- [ ] Errors sent to users are safe; detailed sensitive API responses aren't exposed.

## Test commands and evidence

- [ ] `npm run lint` passes (if configured).
- [ ] `npm run typecheck` passes (if configured).
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Browser test checks all main pages and routes.
- [ ] Drive API tests use mocks in automated tests; live integration verified separately.
- [ ] At least one real test account uploaded and retrieved files end-to-end.
- [ ] Large upload/retry test performed.
- [ ] Poojaspace → Drive → reopen Poojaspace check performed.
- [ ] Real Oppo Share Target test performed or marked Blocked/Not tested, never assumed.
- [ ] No real credentials required to run automated unit tests.

## Release and recovery

- [ ] Production URL is stable and HTTPS.
- [ ] OAuth allowed origins match the actual deployed origin.
- [ ] Test users/consent configuration are correct.
- [ ] Pooja knows how to install the PWA.
- [ ] Pooja knows how to upload from Gallery and how to use Quick add.
- [ ] Pooja knows files are stored in her own Google Drive.
- [ ] Pooja has opened a few uploaded files directly in Drive to confirm them.
- [ ] She is told to retain originals until she has personally verified cloud copies.
- [ ] She knows how to open `My Drive/Poojaspace` if the web app is unavailable.
- [ ] She knows how to restore from Poojaspace/Recently Deleted.
- [ ] She knows that app removal does not remove Drive files, but clearing site data can remove any unuploaded local queue.
- [ ] Actual storage availability has been checked at Google One/Drive; the app does not promise arbitrary free capacity.
- [ ] Final report distinguishes implemented, automated-tested and manually-verified behavior.
