# SEO Technical Overhaul — Design

**Date:** 2026-07-15
**Status:** Approved by user (pending spec review)
**Scope:** Metadata overhaul, OG image, sitemap, robots, JSON-LD. Landing page only — `/help` stays auth-gated (revisit later). Public `/shortcuts` content pages are a separate future project.

## Context

The site currently exposes a single indexable page (`/`) with bare-minimum metadata: a plain title, a description, and icons. There is no sitemap, no robots.txt, no Open Graph/Twitter tags, no canonical URL, and no structured data. Search Console shows near-zero impressions after one month live.

## Decisions (confirmed with user)

| Decision | Value |
|---|---|
| Canonical production domain | `https://ninjashortcuts.com` |
| SEO site/brand name | **Excel Shortcuts Ninja** — and the visible UI brand is renamed to match (see §7) |
| OG image | Code-generated via Next `ImageResponse` (`opengraph-image.tsx`) |
| Help/FAQ page | Stays auth-gated; excluded from index via robots disallow |
| Approach | Native Next.js 15 file conventions + small SEO constants module |

## Components

### 1. `src/lib/seo.ts` (new)

Single source of truth, imported by everything below:

- `SITE_URL = 'https://ninjashortcuts.com'` — hardcoded, **not** derived from `NEXT_PUBLIC_APP_URL` (that env var points at the Firebase preview URL and is used for Stripe redirects; canonical URLs must not change with deployment config)
- `SITE_NAME = 'Excel Shortcuts Ninja'`
- `SITE_TITLE = 'Excel Shortcuts Ninja — Learn Excel Keyboard Shortcuts by Doing'`
- `SITE_DESCRIPTION` — keyword-first, ~155 chars, mentioning: Excel keyboard shortcuts, interactive challenges/drills/flashcards, Windows & Mac, certificate

### 2. `src/app/layout.tsx` — metadata overhaul

Extend the existing `metadata` export (keep the current `icons` config):

- `metadataBase: new URL(SITE_URL)`
- `title: { default: SITE_TITLE, template: '%s | Excel Shortcuts Ninja' }`
- `description: SITE_DESCRIPTION`
- `openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US', url: SITE_URL, title: SITE_TITLE, description: SITE_DESCRIPTION }`
- `twitter: { card: 'summary_large_image' }`
- `keywords` array (minor signal, harmless)

### 3. `src/app/page.tsx` — landing page metadata + JSON-LD

- Export page-level `metadata` with `alternates: { canonical: '/' }`. Canonical is per-page; it must **not** go in the root layout (it would mark every route canonical to the homepage).
- Render one `<script type="application/ld+json">` (server component, so it ships in the HTML) containing an `@graph`:
  - **Organization** — name, url, logo (`/logo.svg` absolute URL), `contactPoint` with `info@ninjashortcuts.com`
  - **WebSite** — name, url
  - **SoftwareApplication** — `applicationCategory: 'EducationalApplication'`, `operatingSystem: 'Web'`, with two **Offer** entries: €9.99 (7-day) and €14.99 (1-month), `priceCurrency: 'EUR'`
  - No review/rating markup — never fabricate ratings.
- Build the object as a typed const and inject via `JSON.stringify` in `dangerouslySetInnerHTML`.

### 4. `src/app/sitemap.ts` (new)

Next-native `MetadataRoute.Sitemap`. Entries: `/` only (priority 1.0, changeFrequency `weekly`). Future `/shortcuts/*` pages get added here.

### 5. `src/app/robots.ts` (new)

Next-native `MetadataRoute.Robots`:

- `userAgent: '*'`, `allow: '/'`
- `disallow` (bare paths, so both the list page and nested routes are blocked): `/dashboard`, `/challenge`, `/drills`, `/flashcards`, `/certificate`, `/results`, `/drill-results`, `/survey`, `/checkout`, `/verify`, `/verify-email`, `/auth-action`, `/help`, `/api`
- `/login` and `/signup` remain crawlable (brand queries), but are not in the sitemap
- `sitemap: `${SITE_URL}/sitemap.xml``

### 6. `src/app/opengraph-image.tsx` (new)

`ImageResponse`, 1200×630, `alt` export, `contentType: 'image/png'`:

- Dark ink background matching the landing page's dark sections, emerald accent
- Brand mark + "Excel Shortcuts Ninja"
- Headline: "Learn Excel Shortcuts. Stop wasting time."
- Small lit-keycap motif (Ctrl + D) echoing the hero card
- Fonts: load Inter TTFs from `public/` via `fs.readFile` (already in repo: `Inter-Bold.ttf`, `Inter-SemiBold.ttf`, `Inter-Regular.ttf`)
- Next auto-injects `og:image` / `twitter:image` tags from this file; no manual wiring

### 7. Brand rename in the UI: "Excel Ninja" → "Excel Shortcuts Ninja"

**Rule:** occurrences that name the *product/brand* are renamed; occurrences that describe a *person or rank* (the aspirational "ninja") are kept.

Rename (product/brand):
- `src/components/logo.tsx` — shared header logo text (used by app-header and landing nav)
- `src/components/landing/landing-content.tsx` — footer logo text and the © line
- `src/components/landing/contact-modal.tsx` — modal descriptions and mail subjects
- `src/app/help/page.tsx` — all FAQ copy referring to the product (~10 occurrences)
- `src/components/before-you-start.tsx` — "How Excel Ninja works" title + browser-shortcut copy
- `src/components/landing-donation.tsx` — "Support Excel Ninja"
- `src/lib/legal-content.tsx` — every reference to the Service (~8 occurrences, incl. the "Excel Ninja ('the Service')" definition)
- `src/app/certificate/page.tsx` — logo alt text and "The Excel Ninja Team" signature
- `src/lib/utils.ts` — LinkedIn certificate name → "Excel Shortcuts Ninja: Certificate of Mastery"
- `src/components/challenge-preloader.tsx` — image alt text

Keep (persona/rank, not brand):
- `src/app/signup/page.tsx` — "Start your journey to becoming an Excel Ninja"
- `landing-content.tsx` — Level3 rank alt "Excel Ninja", "Individual learner becoming an Excel Ninja", "A team of Excel Ninjas"
- `src/components/certificate-modal.tsx` — "Excel Ninja" as fallback *user name* on the certificate

The repo-internal name (folder `ExcelNinja`, CLAUDE.md project title) is untouched.

## Error handling

- `opengraph-image.tsx` font loading uses `path.join(process.cwd(), 'public', …)` — works in dev and in the Firebase App Hosting build. If font read fails at runtime the route errors; verify it renders in dev and production build (`npm run build`) before shipping.
- JSON-LD is static data — no runtime failure modes beyond typos; validate with Google's Rich Results Test.

## Verification

1. `npm run typecheck` (grep output for the touched files — pre-existing errors exist elsewhere)
2. Dev server (`npm run dev`, port 9002):
   - `curl localhost:9002/sitemap.xml` and `/robots.txt` — correct content, ninjashortcuts.com URLs
   - View `/` page source: title, description, canonical, OG/Twitter tags, JSON-LD script present
   - Open `/opengraph-image` — renders the 1200×630 card
3. `npm run build` passes (ImageResponse routes can fail only at build/runtime, not typecheck)
4. Post-deploy (user): validate JSON-LD via Google Rich Results Test; check share preview via opengraph.xyz or LinkedIn Post Inspector

## Manual steps owned by the user

- Set `NEXT_PUBLIC_APP_URL=https://ninjashortcuts.com` in the production environment
- Ensure the custom domain `ninjashortcuts.com` is connected in Firebase App Hosting
- In Google Search Console: submit `https://ninjashortcuts.com/sitemap.xml`

## Out of scope (explicitly)

- Making `/help` public (declined for this pass)
- Public `/shortcuts/[slug]` content pages (the big traffic lever — separate project)
- Any redirect/canonicalization of the Firebase `*.hosted.app` URL to the custom domain (hosting-level concern)
