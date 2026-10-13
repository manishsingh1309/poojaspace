# Poojaspace — Google Cloud & Family Storage Setup Guide

This guide contains step-by-step instructions for Pooja's brother to set up Google Cloud OAuth credentials and configure free family storage sharing so Pooja can enjoy 20–40+ GB in her own account.

---

## 1. How to Provide 20–40 GB (or more) Storage for Free

Poojaspace saves files directly into Pooja's Google account. By default, every free Google account comes with **15 GB** of storage. 

If you (or your family) already have an active **Google One** or **Google AI / Gemini** subscription (such as 100 GB, 200 GB, or 2 TB plans):
1. Visit **[families.google.com](https://families.google.com/)**.
2. Click **Create a family group** (if you don't already have one).
3. Click **Invite family members** and enter **Pooja's Google email address**.
4. Have Pooja open the invitation email on her phone and tap **Accept**.
5. Go to **[one.google.com/settings](https://one.google.com/settings)**.
6. Under **Share Google One with family**, toggle the switch to **ON**.
7. Confirm that Pooja now has access to the shared family storage pool at **[one.google.com/storage](https://one.google.com/storage)**.

> [!NOTE]
> **Privacy Guarantee:** Family sharing shares *storage capacity*, NOT files. Pooja's photos in Poojaspace remain strictly private to her account and are never visible to other family members unless she explicitly shares them.

---

## 2. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Navigate to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Click the project dropdown at the top and select **New Project**.
3. Project Name: `Poojaspace Personal` (or `Poojaspace`).
4. Click **Create** and ensure the new project is selected.

### Step 2: Enable the Google Drive API
1. In the search bar at the top, type `Google Drive API` and press Enter.
2. Click on **Google Drive API** from the results.
3. Click the blue **Enable** button.

### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen** (or **Branding**).
2. Choose **External** user type and click **Create**.
3. Fill in the App Information:
   - **App name:** `Poojaspace`
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
4. Click **Save and Continue**.
5. On the **Scopes** page:
   - Click **Add or Remove Scopes**.
   - Search for and select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
     - `https://www.googleapis.com/auth/drive.file`
   - Click **Update** and then **Save and Continue**.
6. On the **Test Users** page:
   - Click **Add Users**.
   - Add **Pooja's Google email** and **your Google email**.
   - Click **Save and Continue**.

### Step 4: Create OAuth Web Client ID
1. In the left sidebar, click **Credentials**.
2. Click **+ Create Credentials** at the top → **OAuth client ID**.
3. Application type: Select **Web application**.
4. Name: `Poojaspace Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   - `http://localhost:5173` (for local development)
   - `http://localhost:4173` (for local preview testing)
   - `https://your-production-domain.vercel.app` (your actual deployed HTTPS domain)
6. Leave **Authorized redirect URIs** blank (the token popup flow does not require redirect URIs).
7. Click **Create**.
8. Copy the **Client ID** (it ends with `.apps.googleusercontent.com`).

> [!WARNING]
> **Client ID is Public; Client Secret is Private:**
> You only need the **Client ID** in Poojaspace. **Never** paste the client secret into frontend files, environment variables with `VITE_`, or Git repositories.

---

## 3. Configuring the App

Create a file named `.env.local` in the project root:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

Save the file and restart the development server:
```bash
npm run dev
```

When Pooja opens Poojaspace, she can tap **Connect Google Drive**, choose her account, and start uploading immediately!

---

## 4. Deploying to Free Static Hosting (Vercel, Netlify, or GitHub Pages)

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
2. The output is generated in the `dist/` directory.
3. On your hosting provider (e.g. Vercel):
   - Set **Build Command:** `npm run build`
   - Set **Output Directory:** `dist`
   - Add Environment Variable:
     - `VITE_GOOGLE_CLIENT_ID` = `your-actual-client-id.apps.googleusercontent.com`
4. Copy the assigned HTTPS domain (e.g., `https://poojaspace.vercel.app`).
5. Go back to Google Cloud Console → **Credentials** → Edit your OAuth Web Client → Add `https://poojaspace.vercel.app` to **Authorized JavaScript origins**.
6. Done! Pooja can now install the PWA on her phone.
