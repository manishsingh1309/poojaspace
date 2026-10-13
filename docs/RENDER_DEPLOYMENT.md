# Poojaspace — Render Deployment Guide (100% Free Forever)

This document provides a step-by-step walkthrough to deploy **Poojaspace** on **Render** as a high-performance, free **Static Site** with automatic SSL (HTTPS), global CDN distribution, and full PWA support.

---

## Why Render "Static Site" (Not "Web Service")?

| Feature | Render Static Site (Recommended) | Render Web Service (Node.js) |
| :--- | :--- | :--- |
| **Cost** | **$0 / Free Forever** | Free tier available |
| **Cold Start Delay** | **0 seconds** (Instant CDN delivery) | Spun down after 15 mins (50s delay) |
| **SSL / HTTPS** | Free automatic certificate | Free automatic certificate |
| **PWA & Offline** | Full service worker support | Full service worker support |
| **Bandwidth** | 100 GB/month included | Limited free hours |

Poojaspace is a client-side Single Page Application (React + Vite + TypeScript) that communicates directly from Pooja's browser to the Google Drive API. It requires **zero Node server runtime**, making Render Static Site the fastest, most reliable choice.

---

## Estimated Completion Time
* **Total Time Needed:** ~15 to 25 minutes end-to-end.

---

## Step 1: Push Poojaspace to GitHub (3–5 minutes)

Render builds and deploys directly from a GitHub repository.

1. Open your terminal in the `poojaspace` folder:
   ```bash
   cd /Users/manishsinghchouhan1309/poojaspace
   ```
2. Initialize git and make your first commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete luxury Poojaspace PWA with Google Drive integration"
   ```
3. Go to **[github.com/new](https://github.com/new)** and create a new repository:
   - Repository name: `poojaspace`
   - Privacy: **Private** (recommended) or Public
   - Do **NOT** initialize with README (we already have everything).
4. Link your local repo and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/poojaspace.git
   git push -u origin main
   ```

---

## Step 2: Create a New Static Site on Render (3–5 minutes)

1. Log in or sign up at **[render.com](https://dashboard.render.com/)**.
2. From the Render dashboard, click the blue **New +** button at the top right and select **Static Site**.
3. Under **Connect a repository**, find your `poojaspace` repo and click **Connect**.
4. Configure the build settings:
   - **Name:** `poojaspace` (or any name you prefer)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Scroll down to **Environment Variables** (or click **Advanced**):
   - Click **Add Environment Variable**.
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `your-google-client-id.apps.googleusercontent.com` *(see docs/GOOGLE_SETUP.md if you haven't created one yet)*
6. Click **Create Static Site**.

---

## Step 3: Configure SPA Routing Rewrite (1 minute)

Because Poojaspace is a client-side Single Page Application (SPA), any route refresh or direct link (e.g. `/share-target`) must be served by `index.html`:

1. In your Render dashboard, navigate to your newly created **poojaspace** service.
2. In the left menu, click **Redirects / Rewrites**.
3. Click **Add Rule**:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
4. Click **Save Changes**.

*(Note: If you use the provided `render.yaml` blueprint, this rewrite rule is configured automatically).*

---

## Step 4: Add Your Render Domain to Google Cloud Console (2 minutes)

Once Render finishes building, you will receive an HTTPS address like:
`https://poojaspace.onrender.com`

**You MUST authorize this domain in Google Cloud, or Google will block login:**

1. Go to the **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Click on your **Poojaspace Web Client** under **OAuth 2.0 Client IDs**.
3. Under **Authorized JavaScript origins**, click **+ Add URI**.
4. Paste your exact Render URL:
   ```
   https://poojaspace.onrender.com
   ```
   *(Ensure there is no trailing slash `/` at the end).*
5. Click **Save** at the bottom.

> [!NOTE]
> Google changes typically take between **30 seconds and 2 minutes** to propagate globally.

---

## Step 5: Test and Install on Pooja's Oppo Phone (5 minutes)

1. **Send the Link to Pooja:**
   Send `https://poojaspace.onrender.com` to Pooja's phone via WhatsApp or SMS.
2. **Open in Chrome:**
   Have her open the link in **Google Chrome** on her Oppo phone.
3. **Install as App:**
   - Tap Chrome's menu (three dots **⋮** at the top right).
   - Tap **"Install app"** or **"Add to Home screen"**.
   - Poojaspace will be installed as a standalone app with the luxury obsidian and gold logo.
4. **Connect Google Account:**
   - Open Poojaspace from the home screen.
   - Tap **Connect Google Drive** (or the prompt in Settings).
   - Select her Google account and tap **Continue**.
   - A dedicated folder named `Poojaspace` will be created inside her personal Google Drive.
5. **Test Quick Add & Gallery Share:**
   - In Poojaspace, tap the glowing gold **`+`** button in the floating dock to upload a test photo.
   - Open the Oppo Gallery, select a photo, tap **Share**, and choose **Poojaspace**!
