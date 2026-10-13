# Poojaspace — Google Drive, OAuth, Hosting and Storage Setup

This guide is for the developer setting up the private Poojaspace PWA. Use only the real credentials generated in your own Google Cloud project. **Never paste client secrets, access tokens or refresh tokens into Antigravity prompts, chat, source files or screenshots.**

## 1. Choose the real storage capacity first

Poojaspace itself does not create cloud storage. It uses the Google Drive capacity of the account that signs in.

1. Check the exact subscription under the Google account that currently pays for Gemini/Google AI/Google One.
2. Check Google One's current India plan page and the account's own storage screen. Plan benefits can change.
3. If the subscription includes family sharing, you may be able to invite Pooja's Google account and enable storage sharing. Family requirements apply; confirm they are in the same country and Pooja is not already in another Google family group or blocked by Google's switching rules.
4. Pooja should still sign into Poojaspace using **her own Google account**. This means files are owned by her and are visible to her in Drive. Family sharing supplies a shared quota, not shared access to each other's files.
5. Confirm the available space at `https://one.google.com/storage`. Do not assume 20–40 GB is available until you check the current plan, existing usage and family pool.

If you do not have an eligible storage plan, the app can still work within whatever free Drive quota Pooja has, but this might not be enough for a large video library.

## 2. Why Drive instead of Supabase Storage

The preferred design does not need Supabase. Current Supabase free Storage is limited to about 1 GB, so it is a poor fit for 20–40 GB of photos and videos. Avoid creating extra services unless a documented feature needs them. Using Google Drive keeps the files in Pooja's own account and makes independent recovery simpler.

## 3. Create/configure a Google Cloud project

Console navigation changes over time; follow the current Google Cloud Console labels and Antigravity's generated `docs/GOOGLE_SETUP.md` if it differs.

1. Open `https://console.cloud.google.com/` and create a dedicated project, e.g. `Poojaspace Personal`.
2. Enable **Google Drive API** for this project.
3. Configure Google Auth Platform / OAuth consent / Branding as currently named by Google.
4. Give the app a clear name: `Poojaspace`. Use a developer contact email that you control.
5. Configure the app for private testing. Add the Google accounts that will test the app (Pooja and the developer) as test users if the consent screen is in Testing mode. Do not claim this is a publicly verified app.
6. Request the smallest viable scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.file`
7. Do **not** request `https://www.googleapis.com/auth/drive` or `drive.readonly` for convenience. Those are broad/restricted scopes compared with `drive.file`.
8. Create an OAuth client of type **Web application**.
9. Add authorised JavaScript origins for the local development origin (for example `http://localhost:5173`) and the final HTTPS production origin. Use the exact host(s), no accidental typos.
10. Add redirect URI entries only if the chosen Google Identity Services flow actually uses redirect mode; a token-popup flow may not require a redirect URI. Follow the actual implementation rather than copying unnecessary values.
11. Do not assume a shared hosting hostname can be verified as an authorised domain. Check the current Google Cloud requirements. If Google requires a domain you control, use an existing domain/subdomain if available, or stay in permitted private testing until a suitable domain is configured. Do not buy a new domain before confirming it is necessary.
12. If Google requires basic OAuth app verification for the chosen scopes/deployment, follow Google's official process. Do not attempt to bypass verification or ask Antigravity to hide consent warnings.

Official guides:
- Drive API OAuth/scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- OAuth scopes: https://developers.google.com/identity/protocols/oauth2/scopes

## 4. Environment variables

The preferred frontend-only version needs only a public Google OAuth **client ID** as build-time configuration. Antigravity should generate `.env.example` with a placeholder like:

```dotenv
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

Create a local `.env.local` for development and configure the same value in the hosting provider's environment settings for production. `.env.local` should be in `.gitignore`.

Important:
- The OAuth **client ID is public** in a browser application; it is not a secret.
- Never place the OAuth **client secret** in a `VITE_` variable or frontend bundle.
- Do not create or store a Google refresh token for the frontend-only architecture.
- Do not create a Supabase service-role key, a service account credential or a separate media-store credential.

If Antigravity believes a backend secret is necessary, it must stop and explain the new requirement and threat model before introducing a backend.

## 5. How OAuth should work in the browser

- Use Google Identity Services, with Drive access through the authorised token.
- Request only the documented scopes.
- Keep access tokens in memory; do not save them to localStorage.
- Reconnect when a token expires or the page reloads, using the safest supported consent/authorisation flow.
- Show the signed-in email so Pooja can verify that she picked her own account.
- If she denies permission, explain the effect and do not enter a fake connected state.
- Never place a token in a URL or query parameter.

## 6. Where uploaded files go

The first successful connection should create/discover this ordinary visible Drive folder tree:

```text
My Drive/
  Poojaspace/
    Photos/
    Videos/
    Documents/
    Audio & Other Files/
    Albums/
    Recently Deleted/
```

Files should be ordinary Google Drive files—not only hidden metadata or a separate app cache. This makes them accessible through Drive even if the app is uninstalled. The app must never automatically delete the original from Pooja's Android Gallery.

## 7. Hosting the PWA

1. Choose a free static hosting tier suitable for a private personal/non-commercial app and check current terms/limits.
2. Deploy the static production build over HTTPS.
3. Add the exact production origin to Google OAuth's authorised JavaScript origins as required.
4. Verify the Vite base path, SPA route fallback, `manifest.webmanifest`, icons, service worker scope and headers.
5. Update OAuth settings if the final domain differs from the temporary preview URL.
6. Avoid relying on per-deployment preview URLs for final OAuth and PWA Share Target tests. Use one stable production origin.
7. If a custom domain is required by current Google OAuth domain verification, use a domain you already control if possible. Don't buy a new domain before checking.

## 8. Install on Pooja's Oppo Android phone

1. Open the final HTTPS Poojaspace URL in Chrome on the phone.
2. Connect Pooja's Google account.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen** (wording varies by Chrome/Android version).
4. Confirm the Poojaspace icon is on her Home Screen and that it opens in standalone mode.
5. Open Gallery/Google Photos, select one or more photos/videos, tap Share, and check whether Poojaspace appears in the share sheet.
6. Select Poojaspace and test a small photo first, then multiple photos, a short video and a larger video.
7. Keep the app open until uploads complete; the browser does not guarantee uploads continue after being killed/backgrounded.
8. Confirm uploaded files appear in `My Drive/Poojaspace` and can be reopened/downloaded. Do not delete the phone originals until you personally verify the cloud copies.

If Poojaspace does not appear in the Share sheet, check: PWA is installed (not merely a browser tab), production HTTPS is working, manifest `share_target` is valid, service worker is updated, file MIME types match the manifest, and the Oppo Gallery/Chrome versions support the route. Use Quick add as a fallback.

Official Chrome guide: https://developer.chrome.com/docs/capabilities/web-apis/web-share-target

## 9. How the share target should work on a static host

A manifest file share target typically sends a multipart POST to its action URL. A static hosting server does not automatically store that POST for the React app. The implementation should verify a service-worker handler for the share-target POST, parse shared files, persist them to IndexedDB and redirect to the app's normal route. Files must then upload directly from the user's browser to Drive.

The implementation must not silently send files to a Vercel function, staging bucket, analytics service or any other third party. If the chosen approach cannot be made reliable on current Chrome, document the limitation, retain Quick add, and do not advertise Gallery sharing as tested until it works on the real Oppo device.

## 10. Check quota and storage errors

- Use Google One storage page to view true account/family storage: `https://one.google.com/storage`.
- Poojaspace may display the aggregate size of the files inside its folder. Label that as Poojaspace storage, not total available Google storage.
- If the selected API scope cannot read account quota, do not request broader Drive permissions merely to calculate a “space remaining” number.
- When quota is exhausted, keep pending files on the phone if browser storage allows, show a clear failure, and direct the user to Google storage management. Never delete phone originals.
- Files in the app's Recently Deleted folder still use Drive storage until permanently removed.
- If the subscription expires/downgrades or family sharing stops, uploads may fail once there is not enough quota. Existing files are still associated with the Google account but the account may become over quota; check Google's current guidance before promising specific behavior.

## 11. Release sanity checklist

- [ ] Correct Google account displayed.
- [ ] Only the expected scopes requested.
- [ ] First upload appears in the right Drive folder.
- [ ] Reopening the PWA restores file listing from Drive.
- [ ] Phone original is unchanged.
- [ ] No public sharing permission created.
- [ ] No client secret/token in source, Git, browser storage or build output.
- [ ] OAuth runs on the production origin and permitted test users can connect.
- [ ] PWA installed and share-sheet manually tested on the actual Oppo phone.
- [ ] Quota-full and revoked-permission errors were tested.
- [ ] Recovery guide says how to find the files and restore items.
