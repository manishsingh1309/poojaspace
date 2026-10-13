# Poojaspace — Technical Architecture Reference

**Product:** Poojaspace  
**Authoritative Storage:** Pooja's Google Drive (`My Drive/Poojaspace/`)  
**Frontend Platform:** Progressive Web App (React 18 + TypeScript + Vite + Tailwind CSS)  
**Security Model:** Least-Privilege OAuth 2.0 (`https://www.googleapis.com/auth/drive.file`), memory-only tokens  

---

## 1. System Overview

Poojaspace is built as a static, direct-to-cloud Progressive Web App. It eliminates the need for expensive third-party storage databases (such as Supabase Storage's 1 GB free limit) by utilizing Google Drive as the authoritative storage layer. Media streams directly from Pooja's Oppo Android phone browser to Google's resumable upload servers via HTTPS.

```
+-------------------------------------------------------------------------------+
|                            POOJA'S ANDROID DEVICE                             |
|                                                                               |
|  [ Oppo Photos / Gallery ]                       [ In-App File Picker ]       |
|            |                                                |                 |
|     (Share Intent)                                          |                 |
|            |                                                |                 |
|            v                                                |                 |
|   [ Web Share Target ]                                      |                 |
|   (POST /share-target)                                      |                 |
|            |                                                |                 |
|            v                                                |                 |
|  [ Service Worker (sw.ts) ]                                 |                 |
|  - Intercepts POST                                          |                 |
|  - Extracts multipart blobs                                 |                 |
|  - Responds 303 Redirect /?from_share=true                  |                 |
|            |                                                |                 |
|            v                                                v                 |
|  [ IndexedDB: pending_shares ] <──────────────> [ React 18 Application ]      |
|  (Transient staging queue)                      - AuthContext                 |
|                                                 - DriveContext                |
|                                                 - UploadContext               |
|                                                 - Mobile-first UI & Drawers   |
|                                                             │                 |
|                                                             │ (Memory Token)  |
|                                                             v                 |
|                                                 [ Resumable Upload Engine ]   |
|                                                 - 2x Bounded Concurrency      |
|                                                 - 256 KiB Chunk Alignment     |
|                                                 - Exponential Backoff         |
+-------------------------------------------------------------|-----------------+
                                                              │
                                       Direct HTTPS REST API  │
                                       (drive.file scope)     │
                                                              v
                                              +───────────────────────────────+
                                              │      POOJA'S GOOGLE DRIVE     │
                                              │                               │
                                              │  My Drive/                    │
                                              │    └── Poojaspace/            │
                                              │        ├── Photos/            │
                                              │        ├── Videos/            │
                                              │        ├── Documents/         │
                                              │        ├── Audio & Other/     │
                                              │        ├── Albums/            │
                                              │        └── Recently Deleted/  │
                                              +───────────────────────────────+
```

---

## 2. Authentication & Security Topology

### 2.1. Least-Privilege Scopes
Poojaspace requests strictly:
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.file`

**Critical Invariant:** Poojaspace **never** requests `https://www.googleapis.com/auth/drive` (all-Drive access) or `drive.readonly`. The `drive.file` scope restricts the app to viewing, editing, and deleting only files created by Poojaspace itself or files explicitly shared with it.

### 2.2. Memory-Only Token Architecture
1. Google Identity Services (GIS) initializes `window.google.accounts.oauth2.initTokenClient`.
2. When Pooja signs in, GIS returns an ephemeral `access_token` with an expiration timestamp (`expires_in`).
3. The token is kept strictly in memory within `GoogleAuthService`.
4. **Zero LocalStorage Persistence:** Access tokens, refresh tokens, and OAuth responses are never written to `localStorage`, `sessionStorage`, or cookies.
5. If the token expires during an upload, `UploadEngine` pauses the queue and gracefully triggers GIS re-authentication.

---

## 3. Storage Hierarchy in Google Drive

On first connection, the app runs `discoverOrCreateTree()` idempotently:

```
My Drive/
  └── Poojaspace/                           <-- Root application container
      ├── Photos/                           <-- Default for image/* uploads
      ├── Videos/                           <-- Default for video/* uploads
      ├── Documents/                        <-- Default for pdf, doc, sheet uploads
      ├── Audio & Other Files/              <-- Default for audio, zip, other files
      ├── Albums/                           <-- Root for user-created custom albums
      │     ├── Family & Festivals/
      │     └── Special Moments/
      └── Recently Deleted/                 <-- Soft deletion container
```

### Folder Discovery Idempotency
Before creating any folder, the client queries:
```sql
mimeType = 'application/vnd.google-apps.folder' 
  and name = '{folderName}' 
  and trashed = false 
  and '{parentId}' in parents
```
If a folder with the given name exists, its ID is reused. Re-signing in or refreshing the app never produces duplicate folder structures.

---

## 4. Chunked Resumable Upload Protocol

Large mobile video and photo uploads use Google Drive's chunked resumable upload protocol:

### Step 1: Initiate Resumable Session
`POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json; charset=UTF-8`
  - `X-Upload-Content-Type: <file.type>`
  - `X-Upload-Content-Length: <file.size>`
- Body:
  ```json
  {
    "name": "IMG_2026.jpg",
    "parents": ["{folderId}"],
    "mimeType": "image/jpeg",
    "appProperties": { "uploadedVia": "Poojaspace-PWA" }
  }
  ```
- Google returns `200 OK` with header `Location: <resumableSessionUrl>`.

### Step 2: Stream Chunks
`PUT <resumableSessionUrl>`
- Chunk size is `1,048,576` bytes (1 MiB = 4 × 256 KiB).
- Header: `Content-Range: bytes START-END/TOTAL`.
- Google responds:
  - `308 Resume Incomplete` with `Range: bytes=0-LAST_BYTE` if more chunks remain.
  - `200 OK` or `201 Created` with file metadata JSON when upload finishes.

### Step 3: Truthful Metadata Verification
Once the final chunk returns `200 OK`, `UploadEngine` queries `driveApiClient.getFileMetadata(token, fileId)` to confirm the file ID exists, parents match, and byte size matches. Only after this verification passes is the file marked `completed`.

---

## 5. Android Web Share Target Strategy

1. **Manifest Registration:** `manifest.webmanifest` specifies `share_target` with `POST /share-target` accepting `multipart/form-data`.
2. **Service Worker Interception:** Because static hosts do not support server-side POST handlers, `src/sw.ts` intercepts incoming POST requests to `/share-target`.
3. **IndexedDB Staging:** The service worker reads `event.request.formData()`, stores files into `indexedDB (poojaspace_storage.pending_shares)`, and returns `Response.redirect('/?from_share=true', 303)`.
4. **In-App Reception:** When the app mounts, `UploadContext` checks `pending_shares`. If items exist, a warm notification banner informs Pooja: *"3 items shared from Gallery are waiting to upload (still only on this phone)"*.
5. **Direct-to-Drive Dispatch:** Once Google authentication is active, the files upload directly to Drive and IndexedDB is cleaned.

---

## 6. Soft Deletion & Recovery Model

- When a user deletes a file, `driveApiClient.softDeleteFile()` patches the file:
  - `addParents: recentlyDeletedFolderId`
  - `removeParents: currentParentFolderId`
  - `appProperties: { originalParentId: currentParentFolderId, deletedAt: ISO_STRING }`
- In `Recently Deleted`, tapping **Restore** patches:
  - `addParents: originalParentId`
  - `removeParents: recentlyDeletedFolderId`
  - `appProperties: { originalParentId: null, deletedAt: null }`
- **Permanent Deletion:** Requires an explicit 2-step confirmation with a destructive warning before calling `DELETE /drive/v3/files/{id}`.
- **Invariant:** Originals on Pooja's Oppo phone are **never** deleted.
