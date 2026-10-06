@../CLAUDE.md

# NeptouWeb

Public marketing site and staff admin panel for Neptou. Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, React 19. Built as a static export and served from GitHub Pages at https://neptou.github.io. Cross-project context (backend, iOS, API versioning) is in the root `../CLAUDE.md`.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build   # static export to out/ (also type-checks)
pnpm lint
```

pnpm version is pinned in `package.json` (`packageManager`). Native build scripts (`sharp`, `unrs-resolver`) are allow-listed in `pnpm-workspace.yaml` under `allowBuilds:`; pnpm 11 reads settings there, not from `package.json`.

## Environment

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `.env.local` locally; GitHub Actions repo variable in CI | Backend base URL. Falls back to `http://localhost:8000` (`lib/config.ts`). Inlined at build time. |

## Layout

- `app/` routes; `app/layout.tsx` holds site metadata and mounts `BackendPing`
- `components/` admin tables (`*Table.tsx`), add/edit modals (`*Modal.tsx`), pickers (`DivisionSelect`, `PlaceMultiSelect`), `AdminHeader`, `BackendPing`
- `lib/config.ts` `BACKEND_URL`; `lib/auth.ts` token, `authFetch`, `getMe`, RBAC helpers; `lib/divisions.ts` cached divisions; `lib/verify.ts` verify toggle
- `public/llms.txt` brief for AI answer engines

## Routes

All backend calls go to `${BACKEND_URL}`. Admin endpoints are unversioned `/admin/...`.

| Route | What it does | Backend calls |
|---|---|---|
| `/` | Marketing homepage, FAQ, JSON-LD, App Store links | none (`/health` ping from layout) |
| `/privacy` | Privacy policy | none |
| `/admin` | Redirects to `/admin/dashboard` | none |
| `/admin/setup` | First-run super-admin creation; redirects to login if already set up | `GET /admin/status`, `POST /admin/register` |
| `/admin/login` | Login, stores JWT | `POST /admin/login` |
| `/admin/dashboard` | Places search, filter, CRUD | `/admin/places`, `/admin/places/filters`, `/admin/divisions` |
| `/admin/maps` | Check/fix place coordinates against keyless Google Maps embeds | `/admin/places`, `/admin/places/filters`, `POST /admin/places/{id}/verify-coordinates` |
| `/admin/foods` | Foods CRUD | `/admin/foods` |
| `/admin/festivals` | Festivals and jatras CRUD, district picker | `/admin/festivals`, `/admin/divisions` |
| `/admin/hotels` | Hotels CRUD (not in iOS yet) | `/admin/hotels`, `/admin/divisions` |
| `/admin/guides` | Tour guides CRUD, places-covered picker (not in iOS yet) | `/admin/guides`, `/admin/places` |
| `/admin/emergency-contacts` | Emergency contacts CRUD | `/admin/emergency-contacts`, `/admin/emergency-contacts/filters` |
| `/admin/team` | Super-admin only: admins, roles, per-resource permissions, password resets | `/admin/admins`, `/admin/admins/{id}/password` |

Every admin page also uses `GET /admin/me` (identity and permissions), `POST /admin/me/password` (change own password) and `POST /admin/logout` via `AdminHeader`. CRUD is `GET` list with query params, `POST` create, `PUT /{id}` full-object update, `DELETE /{id}`.

## Conventions

- **Static export only** (`output: "export"`, `trailingSlash: true`, `images.unoptimized`). No server code, middleware, route handlers or server actions at runtime. Everything dynamic is a client-side fetch to the backend.
- **Auth**: JWT in `localStorage` (`admin_token`). Admin calls must go through `authFetch()`, which adds the Bearer header and on a missing token or 401 clears it, redirects to `/admin/login/`, and throws `AuthError` (callers catch and ignore it). The redirect is UX only; the backend JWT check is the real enforcement. Only login, setup, logout and `/health` use plain `fetch`.
- **RBAC in the UI**: `getMe()` (cached) supplies role and permissions. `AdminHeader` hides tabs via `canAccess(me, resource)`; the Team link needs `isSuperAdmin`. Resource keys in `RESOURCES` mirror the backend's list.
- **Verify workflow**: Foods, Festivals, Hotels, Guides and Emergency Contacts tables show a verified column and a toggle via `verifyRecord()` (`POST /admin/<res>/{id}/verify`). Places use coordinate verification on the Maps tab instead. Missing `verified` is treated as `false`. Emergency contacts' `last_verified` is a separate domain field, not the review flag.
- **Table updaters**: tables take `onXChange(updater: (prev) => next)`, not a plain array setter; wrap `setState` accordingly.
- **Divisions**: use `getDivisions()` / `DivisionSelect` rather than fetching `/admin/divisions` again; records store `division_id`.
- **Styling**: Tailwind utility classes; Geist fonts via `next/font` in `layout.tsx`.

## SEO and AEO

- Site metadata, Open Graph, Twitter card and Apple Smart App Banner (`itunes.appId`) live in `app/layout.tsx`. The canonical site URL is hardcoded as `https://neptou.github.io` in `layout.tsx`, `sitemap.ts` and `robots.ts`.
- `app/page.tsx` renders the FAQ section and the JSON-LD (`MobileApplication`, `WebSite`, `Organization`, `FAQPage`) from the same `faqs` array, so visible text and structured data stay identical.
- `robots.ts` allows all, explicitly lists AI crawlers (`AI_CRAWLERS`), and disallows `/admin/`. Add new public routes to `sitemap.ts`.
- When app features change, update all of: homepage copy and `features`/`stats`, `faqs`, JSON-LD `featureList`, the `layout.tsx` description, `public/llms.txt`, and `app/privacy/page.tsx`.
- `public/googlebe42a8f4168a1995.html` is the Google Search Console verification file. Do not delete it.

## Deploy

Push to `main` runs `.github/workflows/deploy.yml`: `pnpm install --frozen-lockfile`, `pnpm run build` with `NEXT_PUBLIC_BACKEND_URL` from the Actions variable, adds `out/.nojekyll`, deploys via `actions/deploy-pages`. Repo Settings > Pages source must be "GitHub Actions".

## Gotchas

- `sitemap.ts` and `robots.ts` need `export const dynamic = "force-static"` or the export build fails.
- `authFetch` only sets the auth header. Requests with a JSON body must set `Content-Type: application/json` themselves, or FastAPI will not parse the body.
- `NEXT_PUBLIC_BACKEND_URL` is baked in at build time; changing the Actions variable needs a rebuild.
- The backend is on Render's free tier and cold-starts. `BackendPing` fires `GET /health` on every page load to warm it; expect the first admin request after idle to be slow.
- The Maps tab's Google embed is keyless and cannot be read back; staff paste a Maps URL or `lat, lng`, and Save goes through the normal place `PUT` (backend recomputes geohash).
