# Poojaspace — Privacy, Data Ownership & Recovery Guide

## 1. Privacy Principles & Guarantees

Poojaspace was built as a personal gift for Pooja didi. It is engineered with strict privacy standards so that family photographs and personal documents remain completely private.

### Principle 1: Direct Ownership by Pooja
- All files are saved into Pooja's personal Google account under `My Drive/Poojaspace`.
- Pooja is the sole owner of all files.
- Even if the Poojaspace website is taken down or deleted in the future, her files remain intact in Google Drive forever.

### Principle 2: Zero Intermediate Servers
- Media streams directly from Pooja's browser to Google's official upload endpoints.
- Neither her brother, nor any database, nor any analytics service ever receives or stores copies of her files.
- There are no third-party storage buckets (such as Supabase, Cloudinary, AWS S3, or Firebase Storage).

### Principle 3: Least Privilege (`drive.file`)
- Poojaspace asks only for the narrow `https://www.googleapis.com/auth/drive.file` scope.
- It **cannot** view, list, or edit Pooja's personal emails, Google Docs, spreadsheets, or other unrelated folders in her Google Drive.
- It only manages files created by Poojaspace.

### Principle 4: Zero Phone Deletion
- Uploading a photo or video to Poojaspace **never** deletes or compresses the original copy in her Oppo phone's Gallery or internal storage.
- Phone originals remain completely untouched.

### Principle 5: Memory-Only Authentication
- Google OAuth access tokens live strictly in browser memory.
- Tokens are never written to `localStorage`, `sessionStorage`, or external telemetry.

---

## 2. File Recovery & Restoration

### How Deletion Works in Poojaspace
When Pooja deletes a photo, video, or document inside the app:
1. The file is **not permanently deleted**.
2. It is moved into the `Recently Deleted` folder inside `My Drive/Poojaspace`.
3. Its previous folder location (e.g. `Photos`, `Videos`, or an album) is remembered in the file's custom properties.

### How to Restore a File in Poojaspace
1. Open the side menu or tap **Recently Deleted** on the Home screen.
2. Find the file you wish to restore.
3. Tap **Restore**.
4. The file instantly returns to its original folder or album!

### Permanent Deletion
If Pooja wants to permanently remove a file to free up storage space:
1. Go to **Recently Deleted**.
2. Tap the trash icon next to the item.
3. A confirmation dialog appears explaining that this action will permanently delete the file from Google Drive.
4. Tap **Delete Forever** to confirm.

---

## 3. Independent Recovery (If the Website is Ever Unavailable)

If Pooja loses internet access to the website or if the website domain ever expires:
1. Open the official **Google Drive** app on her Oppo phone (or visit **[drive.google.com](https://drive.google.com/)**).
2. Look in **My Drive** for the folder named **Poojaspace**.
3. Inside, she will find:
   - `Photos/`
   - `Videos/`
   - `Documents/`
   - `Albums/`
   - `Recently Deleted/`
4. All original, full-resolution files are there to view, download, or share anytime.

---

## 4. How to Disconnect or Revoke Access

### Within the App:
1. Open the menu drawer.
2. Tap **Disconnect Google Drive**.
3. All local in-memory session tokens are immediately wiped. Drive files are not affected.

### Via Google Account Security:
1. Visit **[myaccount.google.com/connections](https://myaccount.google.com/connections)**.
2. Locate **Poojaspace**.
3. Tap **Delete all connections that you have with Poojaspace**.
4. Access is permanently revoked.
