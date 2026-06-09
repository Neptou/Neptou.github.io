@../CLAUDE.md
@AGENTS.md

# NeptouWeb — CLAUDE.md

This file provides guidance specific to the Next.js web project.

## Stack

- **Next.js 16** (Turbopack, App Router) — static export (`output: "export"`)
- **TypeScript**, **Tailwind CSS**
- **Deployed**: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Node.js**: 24+ (workflow targets Node 24; local machine runs Node 26)

## Project Structure

```
app/
  layout.tsx          ← root layout; includes BackendPing for Render warmup
  page.tsx            ← public homepage (hero, features, stats, CTA)
  admin/
    page.tsx          ← redirects to /admin/login or /admin/dashboard
    login/page.tsx    ← admin login form
    setup/page.tsx    ← first-time admin account creation
    dashboard/page.tsx← places search + filter table (main admin UI)
    foods/page.tsx    ← foods CRUD list + search
    emergency-contacts/page.tsx ← emergency contacts CRUD list + search
components/
  BackendPing.tsx     ← fires GET /health on mount to warm Render cold start
  AdminHeader.tsx     ← top nav for admin pages (tabs: Places / Foods / Emergency Contacts)
  LoginForm.tsx       ← login form component
  SetupForm.tsx       ← setup form component
  PlacesTable.tsx     ← places table with inline Edit / Delete actions
  PlaceModal.tsx      ← add/edit place modal (fetches /admin/divisions for dropdown)
  FoodsTable.tsx      ← foods table with inline Edit / Delete actions
  FoodModal.tsx       ← add/edit food modal
  EmergencyContactsTable.tsx ← emergency contacts table
  EmergencyContactModal.tsx  ← add/edit emergency contact modal
lib/
  config.ts           ← exports BACKEND_URL (NEXT_PUBLIC_BACKEND_URL or localhost:8000)
  auth.ts             ← localStorage token helpers (getToken / setToken / clearToken)
proxy.ts              ← Next.js middleware: redirects unauthenticated /admin/* to /admin/login
```

## Dev & Build

```bash
npm install
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # static export → out/   (also runs TypeScript check)
```

Set `NEXT_PUBLIC_BACKEND_URL` in `.env.local` to point at the local or remote backend:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml` which:
1. Installs deps, runs `next build` (injects `NEXT_PUBLIC_BACKEND_URL` from GitHub Actions variable)
2. Uploads `out/` as a Pages artifact and deploys via `actions/deploy-pages`

**GitHub Pages source** must be set to **"GitHub Actions"** (not "Deploy from a branch") in repo Settings → Pages.

The `NEXT_PUBLIC_BACKEND_URL` Actions variable is set to `https://neptou-backend-5v5u.onrender.com`.

## Backend Connection

All backend calls use `BACKEND_URL` from `lib/config.ts`. Admin routes require a Bearer token stored in `localStorage` (via `lib/auth.ts`) and set as a cookie for the middleware auth check.

`BackendPing` fires a silent `GET /health` on every page load to warm up the Render free-tier instance before users reach the admin panel — no UI impact on failure.

## Key Patterns

- **Auth flow**: login → JWT stored in `localStorage` via `setToken()` + cookie for middleware → `getToken()` used in fetch headers
- **Static export**: no server-side code at runtime; all API calls are client-side fetches to the Render backend
- **`trailingSlash: true`**: all routes have trailing slashes (required for GitHub Pages path resolution)
- **`onPlacesChange` prop**: `PlacesTable` takes `(updater: (prev: Place[]) => Place[]) => void` — callers must wrap `setState` accordingly (see `dashboard/page.tsx`)
