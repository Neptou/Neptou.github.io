# Post-Deploy SEO / AEO Checklist

One-time setup to run **right after** the site is live at <https://neptou.github.io>.
The metadata, sitemap, robots, structured data, and `llms.txt` are already in the code — this
list is about telling the search / AI engines the site exists and confirming everything resolves.

> **Prerequisite:** push `main` → wait for the GitHub Actions "deploy" workflow to finish. Nothing
> below works until the site is actually live.

## 0. Smoke-test the live artifacts

Open each and confirm it loads (not a 404):

- [ ] <https://neptou.github.io/> — homepage
- [ ] <https://neptou.github.io/sitemap.xml> — lists `/` and `/privacy/`
- [ ] <https://neptou.github.io/robots.txt> — allows `*` + AI crawlers, disallows `/admin/`, links the sitemap
- [ ] <https://neptou.github.io/llms.txt> — the LLM brief

## 1. Google Search Console  ← biggest accelerator

1. [ ] Go to <https://search.google.com/search-console>, add a **URL-prefix** property: `https://neptou.github.io/`.
   - (Domain-property / DNS verification is **not** possible on a shared `github.io` subdomain — use the meta-tag method below.)
2. [ ] Choose **HTML tag** verification. It gives you a token like `<meta name="google-site-verification" content="XXXX" />`.
3. [ ] Add the token to `app/layout.tsx` metadata — no HTML editing needed:
   ```ts
   export const metadata: Metadata = {
     // ...existing...
     verification: { google: "XXXX" },
   };
   ```
   Then commit, push, wait for deploy, and click **Verify**.
4. [ ] **Sitemaps** → submit: `sitemap.xml`
5. [ ] **URL Inspection** → paste `https://neptou.github.io/` → **Request Indexing**. Repeat for `/privacy/`.

## 2. Bing Webmaster Tools  ← matters for AEO (feeds ChatGPT search & Copilot)

1. [ ] <https://www.bing.com/webmasters> → add site → **Import from Google Search Console** (fastest) or verify with the meta tag (same `verification` field supports `other: { "msvalidate.01": "XXXX" }`).
2. [ ] Submit sitemap: `https://neptou.github.io/sitemap.xml`

## 3. Validate structured data (rich results)

- [ ] Google Rich Results Test: <https://search.google.com/test/rich-results> → enter the homepage URL. Expect `MobileApplication`, `Organization`, `WebSite`, `FAQPage` detected, no errors.
- [ ] Schema.org validator: <https://validator.schema.org/> → same URL.

## 4. Check social / link previews

- [ ] Paste `https://neptou.github.io/` into any OG debugger (or share into Slack/iMessage) — confirm title, description, and the logo image render.

## 5. AEO sanity checks (a few days after indexing)

- [ ] Ask Perplexity / ChatGPT (search mode) / Copilot: *"Is there a free iOS app for traveling in Nepal?"* and *"What is Neptou?"* — see if the site is cited.
- [ ] Confirm no AI crawler is blocked: re-open `/robots.txt` and verify the AI user-agents are still `Allow: /`.

## 6. Authority (ongoing — the slow lever)

The `github.io` subdomain starts with near-zero authority and the App Store listing does **not**
link back to the site, so:

- [ ] Add the website link to any Neptou social profiles.
- [ ] Post the launch where Nepal-travel / iOS-app audiences gather (a couple of quality inbound links meaningfully speeds ranking).

## Re-run when

- New public pages are added → add them to `app/sitemap.ts`.
- Facts change → keep `public/llms.txt`, the homepage copy, and the JSON-LD in `app/page.tsx` in sync.

---

**Realistic timing:** with steps 1–2 done, the homepage is usually indexed in **hours–days**;
brand-term ("Neptou") ranking follows quickly; generic-term ranking ("Nepal travel app") is
**weeks–months** and depends on section 6. See the conversation notes for the full breakdown.
