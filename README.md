# 🌸 Poojaspace — Pooja's Memories & Files

> **A warm, private, and personal files and memories app for Pooja didi's Oppo Android phone, storing everything safely in her own Google Drive.**

---

## 🌟 Overview & Mission

Poojaspace was built with love by Pooja's brother as a personalized sanctuary for her photos, videos, documents, and memories. Designed specifically for her **Oppo Android phone**, it functions as a lightweight, installable Progressive Web App (PWA) with native Android Share sheet support and zero monthly storage costs.

Instead of routing family files through third-party databases or restrictive free tiers (such as Supabase's 1 GB limit), Poojaspace connects directly to **Pooja's own Google Drive**. Through least-privilege permissions (`drive.file`), Pooja owns her files forever with complete privacy.

---

## ✨ Key Features

- **📱 Mobile-First for Oppo Android:**
  - One-handed mobile ergonomics with bottom navigation and 44px+ touch targets.
  - Safe-area insets for Android gesture navigation.
  - Installable PWA with offline application shell.
  - **Android Web Share Target:** Select photos in Oppo Gallery or Google Photos → Tap **Share** → Choose **Poojaspace** to stage and upload directly!
  - **Quick Add Fallback:** Prominent central floating action with multi-file picker for photos, videos, and documents.

- **☁️ Authentic Google Drive Storage:**
  - Saves files directly to `My Drive/Poojaspace/` in Pooja's personal Google account.
  - Least-privilege OAuth 2.0 (`drive.file`) — cannot see unrelated emails or private Docs.
  - Tokens reside strictly in browser memory (never stored in `localStorage`).
  - Idempotent folder structure: `Photos`, `Videos`, `Documents`, `Audio & Other Files`, `Albums`, `Recently Deleted`.

- **⚡ Resumable Large-File Upload Engine:**
  - 256 KiB chunk-aligned resumable upload protocol for large photos and videos.
  - Automatic resume query upon network drops.
  - Bounded concurrency (max 2 parallel uploads) to protect phone memory.
  - Truthful byte progress and post-upload Drive metadata verification.
  - Polite screen wake-lock during active uploads.

- **🖼️ Rich Media Library & Memories:**
  - **Photos Gallery:** Responsive grid, lazy loading, favourite stars, and fullscreen Lightbox with zoom, swipe navigation, and downloads.
  - **Video Player:** Integrated HTML5 player with streaming and direct Drive links.
  - **Documents & Files:** Clean list view for PDFs, receipts, certificates, and audio.
  - **Albums:** Create custom albums (e.g., "Family Trip", "Diwali") directly mapped to Google Drive folders.
  - **Instant Search & Sort:** Search by file name, filter by category, sort by date or size.

- **🛡️ Gentle Recovery & Phone Safety:**
  - **Zero Phone Deletion:** Uploading never deletes or alters photos on the phone.
  - **Recently Deleted:** Deleted files move to `Recently Deleted` with original folder saved in metadata.
  - **One-Tap Restore:** Return accidentally deleted items to their original album anytime.
  - **2-Step Permanent Delete:** Requires deliberate confirmation with warning modal.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Bespoke Obsidian Void (`#09090B`) & Solar Gold (`#F59E0B`) luxury design system with frosted glassmorphism and Tailwind CSS
- **Typography:** Plus Jakarta Sans & Playfair Display
- **Icons:** Lucide React
- **PWA & Offline:** `vite-plugin-pwa`, Workbox, Custom Service Worker (`src/sw.ts`), IndexedDB
- **Auth & Storage API:** Google Identity Services (GIS), Google Drive REST API v3
- **Hosting / Cloud:** Render (100% Free Forever Static Site with zero cold starts & auto SSL)
- **Testing:** Vitest, Testing Library, jsdom

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended, verified on v22.18.0)
- npm (v9+ recommended, verified on v10.9.3)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Google OAuth (Optional for preview, required for live Drive)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Cloud Web Client ID:
```dotenv
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
*(If unconfigured, Poojaspace runs in a luxury **Demo Preview Mode** using Pooja's provided photos from `assets/`).*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser or phone on the same Wi-Fi.

---

## 🧪 Testing & Validation Commands

```bash
# Run unit & integration tests
npm test

# Run TypeScript compilation checks
npm run typecheck

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📖 Complete Documentation

- 🚀 **[Render Deployment Guide (Free Forever)](docs/RENDER_DEPLOYMENT.md)** — Step-by-step 1-click deployment on Render with free SSL.
- ☁️ **[Google Cloud & Family Storage Guide](docs/GOOGLE_SETUP.md)** — Step-by-step console setup and how to share 20–40+ GB for free via Google One Family Sharing.
- 📐 **[Technical Architecture](docs/ARCHITECTURE.md)** — Direct-to-Drive data flow, token lifecycle, and chunked upload protocol.
- 📋 **[Implementation Plan](docs/IMPLEMENTATION_PLAN.md)** — Product roadmap, milestones, risk matrix, and acceptance criteria.
- 🛡️ **[Privacy & Recovery Guide](docs/PRIVACY_AND_RECOVERY.md)** — Data sovereignty, zero server storage, and file recovery.
- ✅ **[QA & Release Checklist](docs/QA_CHECKLIST.md)** — Full manual and automated verification audit.

---

## ❤️ Dedicated to Pooja Didi

*Built with love for Pooja didi so her memories are always safe, beautiful, and close to her heart.*

