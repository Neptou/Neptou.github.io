@../CLAUDE.md

# NeptouWeb — CLAUDE.md

This file provides guidance specific to the Next.js web project. (`AGENTS.md` is a symlink to this file.)

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16** (Turbopack, App Router) — static export (`output: "export"`)
- **TypeScript**, **Tailwind CSS**
- **Deployed**: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Node.js**: 26 (workflow and local machine both on Node 26)
- **Package manager**: pnpm (see Dev & Build)

## Project Structure

```
app/
  layout.tsx          ← root layout; full SEO metadata + BackendPing for Render warmup
  page.tsx            ← public homepage (hero, features, stats, CTA) + JSON-LD structured data
  sitemap.ts          ← static sitemap.xml (home + /privacy); `dynamic = "force-static"`
  robots.ts           ← static robots.txt (allow /, disallow /admin/, sitemap ref)
  admin/
    page.tsx          ← redirects to /admin/login or /admin/dashboard
    login/page.tsx    ← admin login form
    setup/page.tsx    ← first-time admin account creation
    dashboard/page.tsx← places search + filter table (main admin UI)
    foods/page.tsx    ← foods CRUD list + search
    festivals/page.tsx← festivals & jatras CRUD list + search
    team/page.tsx     ← admin team management (super-admin only): roles + per-resource permissions
    emergency-contacts/page.tsx ← emergency contacts CRUD list + search
components/
  BackendPing.tsx     ← fires GET /health on mount to warm Render cold start
  AdminHeader.tsx     ← top nav (tabs filtered by permission via GET /admin/me; Team tab is super-admin only; shows current user + Change password)
  LoginForm.tsx       ← login form component
  SetupForm.tsx       ← setup form component
  PlacesTable.tsx     ← places table with inline Edit / Delete actions
  PlaceModal.tsx      ← add/edit place modal (fetches /admin/divisions for dropdown)
  FoodsTable.tsx      ← foods table with inline Edit / Delete actions
  FoodModal.tsx       ← add/edit food modal
  FestivalsTable.tsx  ← festivals & jatras table with inline Edit / Delete actions (Location column resolves district from division_id)
  FestivalModal.tsx   ← add/edit festival modal (searchable district picker, date pickers, Nepali date/month)
  DivisionSelect.tsx  ← reusable searchable district picker (combobox over place_divisions; stores division_id)
  AdminsTable.tsx     ← team table (super-admin): Edit / Reset password / Delete
  AdminModal.tsx      ← add/edit admin (role select + per-resource permission checkboxes)
  ResetPasswordModal.tsx ← super-admin resets another admin's password
  ChangePasswordModal.tsx ← self-service password change (from AdminHeader)
  EmergencyContactsTable.tsx ← emergency contacts table
  EmergencyContactModal.tsx  ← add/edit emergency contact modal
lib/
  config.ts           ← exports BACKEND_URL (NEXT_PUBLIC_BACKEND_URL or localhost:8000)
  divisions.ts        ← Division type, cached getDivisions(), divisionLabel() (shared by DivisionSelect + festivals table)
  auth.ts             ← token helpers + authFetch (Bearer header, 401 → login redirect); getMe() (cached /admin/me), canAccess/isSuperAdmin RBAC helpers, RESOURCES list
```

## Dev & Build

This project uses **pnpm** (shared content-addressable store → far less disk than npm's per-project `node_modules`). The pinned version lives in `package.json` `packageManager`.

```bash
pnpm install
pnpm dev           # http://localhost:3000 (Turbopack)
pnpm build         # static export → out/   (also runs TypeScript check)
```

> pnpm blocks dependency build scripts by default. The native ones this project needs (`sharp`, `unrs-resolver`) are allow-listed in `pnpm-workspace.yaml` (`allowBuilds:`) — pnpm 11 reads project settings there, not from a `pnpm` field in `package.json`.

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

All admin calls go through `authFetch()` in `lib/auth.ts` — it attaches the Bearer token from `localStorage`, and on a missing token or a 401 it clears the token, redirects to `/admin/login/`, and throws `AuthError` (callers catch and ignore it). There is no middleware: this is a static export, so real access control is the backend's JWT check; the client-side redirect is UX only. Public calls (login, setup, `/health`) use plain `fetch` with `BACKEND_URL` from `lib/config.ts`.

`BackendPing` fires a silent `GET /health` on every page load to warm up the Render free-tier instance before users reach the admin panel — no UI impact on failure.

## SEO

The public site is live-marketing for the App Store app (<https://apps.apple.com/app/neptou/id6756244066>, live since build 17, 2026-07-07).

- **Metadata** (`app/layout.tsx`): `metadataBase = https://neptou.github.io`, title template, keywords, canonical, full Open Graph + Twitter card (OG image = `/logo.png`), `robots` index/follow. Relative image/canonical URLs resolve against `metadataBase`.
- **Structured data** (`app/page.tsx`): inline JSON-LD `@graph` with `MobileApplication` (free iOS app, `downloadUrl` → App Store), `WebSite`, and `Organization`.
- **`sitemap.ts` / `robots.ts`**: both need `export const dynamic = "force-static"` — without it `next build` fails under `output: "export"`. They emit `/sitemap.xml` and `/robots.txt`. Add new public routes to `sitemap.ts` (admin stays out via robots `disallow`).
- **Homepage CTAs** are live App Store links (`APP_STORE_URL` in `page.tsx`) — the old "coming soon" placeholders were removed. If the app is ever pulled, revert those to the notify/email flow.

**Post-deploy setup:** `SEO-CHECKLIST.md` (repo root) — one-time Search Console / Bing / structured-data steps to run after a deploy.

### AEO (AI answer-engine optimization)

So AI assistants (ChatGPT, Claude, Perplexity, Gemini, Apple Intelligence, …) can crawl and recommend the app:

- **`robots.ts`** explicitly allows a list of AI crawler user-agents (`AI_CRAWLERS`: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, etc.), each `allow: /` + `disallow: /admin/`. Default is allow-all anyway; the explicit entries make intent durable. Add/trim the list there.
- **`public/llms.txt`** (served at `/llms.txt`, [llmstxt.org](https://llmstxt.org) convention): a markdown brief — summary, key facts, features, links, FAQ. Keep it in sync with the homepage when facts change.
- **FAQ**: the `faqs` array in `page.tsx` renders a visible `<details>` FAQ section **and** a `FAQPage` JSON-LD entry from the same source (visible text must match the structured data). Phrase questions the way users ask assistants. `MobileApplication`/`Organization` also carry `sameAs` (App Store) + `featureList`.

## Key Patterns

- **Auth flow**: login → JWT stored in `localStorage` via `setToken()` → all admin requests via `authFetch()` (adds header, handles missing-token and 401 by redirecting to login)
- **Static export**: no server-side code at runtime; all API calls are client-side fetches to the Render backend
- **`trailingSlash: true`**: all routes have trailing slashes (required for GitHub Pages path resolution)
- **`onPlacesChange` prop**: `PlacesTable` takes `(updater: (prev: Place[]) => Place[]) => void` — callers must wrap `setState` accordingly (see `dashboard/page.tsx`)
