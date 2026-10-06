# NeptouWeb

Website and admin panel for [Neptou](https://apps.apple.com/app/neptou/id6756244066), a free iOS travel companion for Nepal.

- **Public site**: marketing homepage and privacy policy at https://neptou.github.io
- **Admin panel** (`/admin`): staff tools for managing places, foods, festivals, hotels, guides and emergency contacts in the Neptou backend

Built with Next.js 16, TypeScript and Tailwind CSS, exported as a static site and deployed to GitHub Pages.

## Quick start

Requires Node and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_BACKEND_URL
pnpm dev                     # http://localhost:3000
pnpm build                   # static export to out/
```

The admin panel needs a running Neptou backend at `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8000`).

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

Developer and agent guidance: [CLAUDE.md](CLAUDE.md).
