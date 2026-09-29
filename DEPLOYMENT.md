# 🌐 HACKX Public Deployment & Google Indexing Guide
> **Transforming Localhost into a Global HTTPS Web Address (`www.yourdomain.com`) with Google Search Discovery**

This comprehensive guide outlines how to deploy the **HACKX Maritime Oil Spill Intelligence System** from your local development environment to the public World Wide Web, configure custom domains, and ensure search engine indexing by Google.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Step 1: 1-Click Frontend Deployment on Vercel (Free & Instant)](#step-1-1-click-frontend-deployment-on-vercel-free--instant)
3. [Step 2: Connecting a Custom Domain (`www.yourdomain.com`)](#step-2-connecting-a-custom-domain-wwwyourdomaincom)
4. [Step 3: Getting Your Website Indexed on Google Search](#step-3-getting-your-website-indexed-on-google-search)
5. [Step 4: Deploying the Python FastAPI Backend (Render / Railway)](#step-4-deploying-the-python-fastapi-backend-render--railway)
6. [Step 5: All-in-One Docker Deployment (VPS / DigitalOcean / AWS)](#step-5-all-in-one-docker-deployment-vps--digitalocean--aws)
7. [SEO & Search Crawler Assets](#-seo--search-crawler-assets)
8. [Troubleshooting & Verification](#-troubleshooting--verification)

---

## 🏛️ Architecture Overview

The repository is pre-configured with cloud-ready assets:
- **`vercel.json`**: Root and frontend configuration for Single Page Application (SPA) routing without 404s.
- **`frontend/public/robots.txt`**: Directs search engine crawlers (Googlebot, Bingbot) to discover and index all public pages.
- **`frontend/public/sitemap.xml`**: Pre-built XML sitemap listing the portal, tactical workstation, and documentation.
- **`backend/main.py`**: Production CORS configuration supporting `*.vercel.app`, `*.onrender.com`, `*.netlify.app`, and custom domains.
- **`frontend/src/api/client.ts`**: Dynamically switches between local mock data and live cloud backends via `VITE_API_BASE_URL`.

---

## Step 1: 1-Click Frontend Deployment on Vercel (Free & Instant)

Because the project is hosted on GitHub ([`champtanu12345-prog/HACKX`](https://github.com/champtanu12345-prog/HACKX)), Vercel provides continuous deployment with zero server maintenance.

### Instructions:
1. Navigate to **[vercel.com](https://vercel.com/)** and sign in using your **GitHub account**.
2. Click **"Add New..."** → **"Project"**.
3. Select your repository: **`champtanu12345-prog/HACKX`** and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or select repo root `/` — root `vercel.json` handles both)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy** 🚀.
6. Within 60 seconds, your site is published with a global CDN and free SSL certificate (`https://hackx.vercel.app` or similar).

*Every future `git push` to `main` will automatically trigger an instant deployment.*

---

## Step 2: Connecting a Custom Domain (`www.yourdomain.com`)

To replace `.vercel.app` with a professional branded web address:

1. **Purchase a domain** from any domain registrar (e.g., Namecheap, GoDaddy, Hostinger, Cloudflare) — e.g., `hackx-maritime.org` or `icg-hackx.in`.
2. Open your project on **Vercel** → navigate to **Settings** → **Domains**.
3. Enter your domain: `www.yourdomain.com` (and `yourdomain.com`) and click **Add**.
4. Configure DNS Records in your domain registrar's DNS management panel:
   | Type | Name / Host | Value / Target | TTL |
   | :--- | :--- | :--- | :--- |
   | **A** | `@` (root) | `76.76.21.21` | Automatic / 3600 |
   | **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 3600 |
5. Vercel automatically provisions and renews a free Let's Encrypt SSL certificate. Within 5–30 minutes, your website is accessible at **`https://www.yourdomain.com`**.

---

## Step 3: Getting Your Website Indexed on Google Search

Google cannot index `localhost`. Once your public web link (`https://...`) is active, follow these steps to appear in Google search results:

### 1. Register with Google Search Console
- Open **[search.google.com/search-console](https://search.google.com/search-console)**.
- Click **"Add Property"** and choose **URL prefix** (e.g., `https://www.yourdomain.com` or `https://hackx.vercel.app`).
- Verification is automated if your domain is managed on Cloudflare/Vercel or via HTML tag.

### 2. Submit the XML Sitemap
- In the left sidebar of Google Search Console, click **Sitemaps**.
- Under "Add a new sitemap", enter:
  ```text
  sitemap.xml
  ```
- Click **Submit**. Google will confirm status: `Success`.

### 3. Request URL Inspection & Indexing
- In the top search bar, paste your homepage URL: `https://www.yourdomain.com/`.
- Click **"Test Live URL"** → **"Request Indexing"**.
- Googlebot will schedule crawling within 24–48 hours.

### 4. Search Ranking Verification
Once indexed, search Google for:
```text
site:yourdomain.com
```
or queries like `"HACKX Indian Coast Guard Oil Spill Intelligence"`.

---

## Step 4: Deploying the Python FastAPI Backend (Render / Railway)

The frontend includes self-contained simulated datasets and client-side calculators. To host the real-time Python REST API and satellite processors:

### Deploying on Render (Free Tier):
1. Go to **[render.com](https://render.com/)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your repository: `champtanu12345-prog/HACKX`.
4. Configure Service:
   - **Name**: `hackx-api`
   - **Environment**: `Python`
   - **Region**: Singapore (or nearest)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.
6. Copy the resulting URL (e.g., `https://hackx-api.onrender.com`).
7. In Vercel, add an Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://hackx-api.onrender.com/api/v1`
   - Re-deploy the frontend to link them.

---

## Step 5: All-in-One Docker Deployment (VPS / DigitalOcean / AWS)

For self-hosted Linux VPS deployments (Ubuntu 22.04 / Debian):

```bash
# 1. Clone repository on server
git clone https://github.com/champtanu12345-prog/HACKX.git
cd HACKX

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch with Docker Compose
docker compose up -d --build

# 4. Verify running containers
docker compose ps
```

Services exposed:
- `http://your-server-ip:5173` — Nginx serving React production build
- `http://your-server-ip:8000` — Uvicorn FastAPI backend & Swagger docs (`/docs`)
- `5432` — PostGIS PostgreSQL database

---

## 🔍 SEO & Search Crawler Assets

The repository contains pre-configured SEO assets:

| File | Purpose |
| :--- | :--- |
| [`frontend/index.html`](file:///frontend/index.html) | OpenGraph preview cards, Twitter cards, meta keywords, author tags, and Googlebot directives (`index, follow`). |
| [`frontend/public/robots.txt`](file:///frontend/public/robots.txt) | Grants search engine crawlers permission to index all views. |
| [`frontend/public/sitemap.xml`](file:///frontend/public/sitemap.xml) | Search engine URL map with change frequencies and priorities. |
| [`frontend/vercel.json`](file:///frontend/vercel.json) | URL rewriting to maintain clean browser URLs and prevent 404s on refresh. |

---

## 🛠️ Troubleshooting & Verification

| Issue | Resolution |
| :--- | :--- |
| **Page 404 on refresh** | Ensure `vercel.json` rewrites are present (already included in repository root and frontend folder). |
| **CORS errors in browser console** | Backend CORS in `backend/main.py` is configured with `allow_origin_regex` to permit all `.vercel.app` and `.onrender.com` subdomains automatically. |
| **Google Search not showing site immediately** | New domains take 24–48 hours for Googlebot's first crawl pass. Use Google Search Console's "Request Indexing" button to expedite. |

---
*Created for Smart India Hackathon 2026 | Team HackX | Indian Coast Guard NOS-DCP*
