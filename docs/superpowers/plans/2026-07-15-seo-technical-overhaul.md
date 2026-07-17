# SEO Technical Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site indexable and shareable: rich metadata, canonical URL, code-generated OG image, sitemap.xml, robots.txt, JSON-LD structured data, and a UI brand rename to "Excel Shortcuts Ninja".

**Architecture:** Native Next.js 15 App Router metadata conventions (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `metadata` exports) fed by a single constants module `src/lib/seo.ts`. JSON-LD is a static object serialized into a `<script>` in the server-rendered landing page.

**Tech Stack:** Next.js 15 (App Router, Turbopack), TypeScript 5, `next/og` ImageResponse. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-15-seo-technical-overhaul-design.md`

## Global Constraints

- Canonical domain: `https://ninjashortcuts.com` — hardcoded in `src/lib/seo.ts`, never derived from `NEXT_PUBLIC_APP_URL`.
- Brand/site name: `Excel Shortcuts Ninja` (exact string, including in the OG image and JSON-LD).
- **No test framework exists.** Verification = `npm run typecheck` + dev-server checks. Typecheck has pre-existing errors in `challenges/page.tsx`, `drill-ui.tsx`, `scroll-animation.tsx` — grep the output for *your* files only.
- Dev server: `npm run dev` serves `http://localhost:9002`. Start it once in the background at the beginning and reuse it (Turbopack hot-reloads route files).
- No `any` in new code. No `bg-blue-*`/`text-blue-*` styling.
- Persona/rank uses of "Excel Ninja" (a *person* who is a ninja at Excel) are **kept**, only product/brand references are renamed — the keep-list is in Task 7.
- Commit after every task.

---

### Task 1: SEO constants module

**Files:**
- Create: `src/lib/seo.ts`

**Interfaces:**
- Produces: `SITE_URL: string`, `SITE_NAME: string`, `SITE_TITLE: string`, `SITE_DESCRIPTION: string` — named exports consumed by Tasks 2–6.

- [ ] **Step 1: Create the module**

```ts
// src/lib/seo.ts
export const SITE_URL = 'https://ninjashortcuts.com';
export const SITE_NAME = 'Excel Shortcuts Ninja';
export const SITE_TITLE =
  'Excel Shortcuts Ninja — Learn Excel Keyboard Shortcuts by Doing';
export const SITE_DESCRIPTION =
  'Master Excel keyboard shortcuts with interactive challenges, timed drills, and flashcards. Practice real scenarios on Windows & Mac and earn a certificate.';
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "lib/seo" ; echo done`
Expected: only `done` (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add src/lib/seo.ts
git commit -m "feat(seo): add site-wide SEO constants module"
```

---

### Task 2: Root layout metadata overhaul

**Files:**
- Modify: `src/app/layout.tsx:8-17` (the existing `metadata` export)

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `SITE_TITLE`, `SITE_DESCRIPTION` from `@/lib/seo`.
- Produces: global `metadataBase` and title template — Task 3's page metadata and Task 6's auto-injected image URLs resolve against this.

- [ ] **Step 1: Start the dev server (background, reused by all later tasks)**

Run: `npm run dev` in the background.
Expected: ready on `http://localhost:9002` (wait for the "Ready" line before curling).

- [ ] **Step 2: Replace the metadata export**

In `src/app/layout.tsx`, add the import and replace the existing `export const metadata` (keep the `icons` block exactly as it is today):

```tsx
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'excel keyboard shortcuts',
    'learn excel shortcuts',
    'excel shortcuts training',
    'excel shortcuts practice',
    'excel drills',
    'excel flashcards',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: { url: '/mono-emerald.svg', type: 'image/svg+xml' },
    shortcut: '/mono-emerald.svg',
    apple: '/mono-emerald.svg',
  },
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "app/layout" ; echo done`
Expected: only `done`.

- [ ] **Step 4: Verify rendered tags**

Run: `curl -s localhost:9002/ | grep -o '<title>[^<]*</title>\|og:site_name" content="[^"]*"\|twitter:card" content="[^"]*"\|name="description" content="[^"]*"' | head`
Expected output includes:
- `<title>Excel Shortcuts Ninja — Learn Excel Keyboard Shortcuts by Doing</title>`
- `og:site_name" content="Excel Shortcuts Ninja"`
- `twitter:card" content="summary_large_image"`

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): rich metadata with OG/Twitter tags and title template"
```

---

### Task 3: Landing page canonical + JSON-LD

**Files:**
- Modify: `src/app/page.tsx` (server component — has no `"use client"`, safe for `metadata` export)

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION` from `@/lib/seo`; `metadataBase` from Task 2 (resolves the relative canonical).

- [ ] **Step 1: Add metadata export and JSON-LD to the page**

Replace the full contents of `src/app/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingContent } from "@/components/landing/landing-content";
import { inter, interTight, jetbrainsMono } from "@/components/landing/fonts";
import styles from "@/components/landing/landing.module.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@ninjashortcuts.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: [
        {
          '@type': 'Offer',
          name: '1-Week Access',
          price: '9.99',
          priceCurrency: 'EUR',
        },
        {
          '@type': 'Offer',
          name: '1-Month Access',
          price: '14.99',
          priceCurrency: 'EUR',
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav />
      <main>
        <LandingContent />
      </main>
    </div>
  );
}
```

Note: if `page.tsx` has drifted from this (user syncs branches often), keep any newer imports/JSX and only *add* the `metadata` export, the `jsonLd` const, and the `<script>` element.

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "app/page" ; echo done`
Expected: only `done`.

- [ ] **Step 3: Verify canonical and JSON-LD in the HTML**

Run: `curl -s localhost:9002/ | grep -o 'rel="canonical" href="[^"]*"'`
Expected: `rel="canonical" href="https://ninjashortcuts.com/"`

Run: `curl -s localhost:9002/ | grep -o 'application/ld+json' && curl -s localhost:9002/ | grep -o '"@type":"SoftwareApplication"'`
Expected: both strings found.

- [ ] **Step 4: Validate the JSON-LD parses**

Run: `curl -s localhost:9002/ | grep -o '<script type="application/ld+json">[^<]*</script>' | sed 's/<[^>]*>//g' | python3 -m json.tool > /dev/null && echo VALID`
Expected: `VALID`

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(seo): canonical URL and JSON-LD structured data on landing page"
```

---

### Task 4: sitemap.ts

**Files:**
- Create: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `SITE_URL` from `@/lib/seo`.
- Produces: `/sitemap.xml` route (referenced by Task 5's robots.txt).

- [ ] **Step 1: Create the sitemap route**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "app/sitemap" ; echo done`
Expected: only `done`.

- [ ] **Step 3: Verify the served XML**

Run: `curl -s localhost:9002/sitemap.xml`
Expected: valid XML containing `<loc>https://ninjashortcuts.com</loc>`.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): sitemap.xml route"
```

---

### Task 5: robots.ts

**Files:**
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `SITE_URL` from `@/lib/seo`; `/sitemap.xml` from Task 4.

- [ ] **Step 1: Create the robots route**

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/challenge',
        '/drills',
        '/flashcards',
        '/certificate',
        '/results',
        '/drill-results',
        '/survey',
        '/checkout',
        '/verify',
        '/verify-email',
        '/auth-action',
        '/help',
        '/api',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "app/robots" ; echo done`
Expected: only `done`.

- [ ] **Step 3: Verify the served robots.txt**

Run: `curl -s localhost:9002/robots.txt`
Expected: `User-Agent: *`, `Allow: /`, all 14 `Disallow:` lines, and `Sitemap: https://ninjashortcuts.com/sitemap.xml`.

- [ ] **Step 4: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat(seo): robots.txt route blocking auth-gated app pages"
```

---

### Task 6: Code-generated OG image

**Files:**
- Create: `src/app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `SITE_NAME` from `@/lib/seo`; Inter TTFs already in `public/` (`Inter-Bold.ttf`, `Inter-SemiBold.ttf`).
- Produces: `/opengraph-image` route; Next auto-injects `og:image` + `twitter:image` meta tags on every page.

- [ ] **Step 1: Create the image route**

Design intent: dark ink background matching the landing dark sections, emerald accent, brand row (logo mark + name), two-line headline, lit Ctrl+D keycap motif echoing the hero card. `next/og` supports only flexbox layout and every element with multiple children needs explicit `display: 'flex'`.

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CSSProperties } from 'react';
import { SITE_NAME } from '@/lib/seo';

export const alt =
  'Excel Shortcuts Ninja — Learn Excel Shortcuts. Stop wasting time.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const keycap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 28px',
  borderRadius: 12,
  border: '2px solid #334155',
  backgroundColor: '#1e293b',
  color: '#f8fafc',
  fontSize: 36,
  fontWeight: 600,
};

export default async function OgImage() {
  const [interBold, interSemiBold] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'Inter-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0b1220',
          padding: 72,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#10b981',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
              <path d="M15 18H25" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M15 25H35" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M15 32H25" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M30 18L35 32" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', color: '#f8fafc', fontSize: 40, fontWeight: 600 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: '#f8fafc', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Learn Excel Shortcuts.
          </div>
          <div style={{ display: 'flex', color: '#34d399', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Stop wasting time.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={keycap}>Ctrl</div>
          <div style={{ display: 'flex', color: '#64748b', fontSize: 36 }}>+</div>
          <div
            style={{
              ...keycap,
              backgroundColor: '#10b981',
              border: '2px solid #34d399',
            }}
          >
            D
          </div>
          <div style={{ display: 'flex', color: '#94a3b8', fontSize: 28, marginLeft: 14 }}>
            Fill Down — one of 100+ shortcuts you&apos;ll master
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interBold, weight: 700 },
        { name: 'Inter', data: interSemiBold, weight: 600 },
      ],
    }
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "opengraph-image" ; echo done`
Expected: only `done`.

- [ ] **Step 3: Verify the image renders**

Run: `curl -s -o /tmp/og.png -w "%{http_code} %{content_type}" localhost:9002/opengraph-image`
Expected: `200 image/png`. Then open/Read `/tmp/og.png` and visually confirm: dark background, brand row, two-line headline, Ctrl+D keycaps, no clipped text.

- [ ] **Step 4: Verify the meta tags are auto-injected**

Run: `curl -s localhost:9002/ | grep -o 'og:image" content="[^"]*"'`
Expected: an `og:image` URL ending in `/opengraph-image` (with query params), absolute on `https://ninjashortcuts.com`.

- [ ] **Step 5: Verify production build (ImageResponse failures only surface at build/runtime)**

Run: `npm run build 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat(seo): code-generated Open Graph share image"
```

---

### Task 7: Brand rename "Excel Ninja" → "Excel Shortcuts Ninja"

**Files (modify):**
- `src/components/logo.tsx` (line 7: `<h1>` text)
- `src/components/landing/landing-content.tsx` (footer logo text ~line 466; © line ~line 490)
- `src/components/landing/contact-modal.tsx` (lines ~114, 115, 127: description + both mail subjects)
- `src/app/help/page.tsx` (all ~10 occurrences — every one refers to the product)
- `src/components/before-you-start.tsx` (~line 842 "How Excel Ninja works"; ~line 1305 browser copy)
- `src/components/landing-donation.tsx` (~line 11 "Support Excel Ninja")
- `src/lib/legal-content.tsx` (all ~8 occurrences — the Service definition and body text)
- `src/app/certificate/page.tsx` (~line 145 logo alt; ~line 172 "The Excel Ninja Team")
- `src/lib/utils.ts` (~line 15: `certName` → `"Excel Shortcuts Ninja: Certificate of Mastery"`)
- `src/components/challenge-preloader.tsx` (~line 42 alt text)

**Interfaces:** none — pure copy change.

**KEEP unchanged (persona/rank, not brand):**
- `src/app/signup/page.tsx` — "Start your journey to becoming an Excel Ninja"
- `src/components/landing/landing-content.tsx` — Level3 rank alt `alt="Excel Ninja"`, `alt="Individual learner becoming an Excel Ninja"`, `alt="A team of Excel Ninjas"`
- `src/components/certificate-modal.tsx` — `name: userProfile.name || "Excel Ninja"` (fallback *user name* printed on the certificate)

- [ ] **Step 1: Rename in the full-file cases (every occurrence is the product)**

In `src/app/help/page.tsx` and `src/lib/legal-content.tsx`, replace **all** occurrences of `Excel Ninja` with `Excel Shortcuts Ninja` (replace-all per file).

- [ ] **Step 2: Rename the targeted occurrences**

Apply these exact replacements:

| File | Old | New |
|---|---|---|
| `logo.tsx` | `>Excel Ninja</h1>` | `>Excel Shortcuts Ninja</h1>` |
| `landing-content.tsx` | `<span className={styles["logo-text"]}>Excel Ninja</span>` | `…>Excel Shortcuts Ninja</span>` |
| `landing-content.tsx` | `&copy; 2026 Excel Ninja. All rights reserved.` | `&copy; 2026 Excel Shortcuts Ninja. All rights reserved.` |
| `contact-modal.tsx` | `Interested in Excel Ninja for your team?` | `Interested in Excel Shortcuts Ninja for your team?` |
| `contact-modal.tsx` | `mailSubject="Excel Ninja — Team Inquiry"` | `mailSubject="Excel Shortcuts Ninja — Team Inquiry"` |
| `contact-modal.tsx` | `mailSubject="Excel Ninja — Contact"` | `mailSubject="Excel Shortcuts Ninja — Contact"` |
| `before-you-start.tsx` | `title: "How Excel Ninja works",` | `title: "How Excel Shortcuts Ninja works",` |
| `before-you-start.tsx` | `You&apos;re using Excel Ninja in a browser.` | `You&apos;re using Excel Shortcuts Ninja in a browser.` |
| `landing-donation.tsx` | `Support Excel Ninja` | `Support Excel Shortcuts Ninja` |
| `certificate/page.tsx` | `alt="Excel Ninja Logo"` | `alt="Excel Shortcuts Ninja Logo"` |
| `certificate/page.tsx` | `The Excel Ninja Team` | `The Excel Shortcuts Ninja Team` |
| `utils.ts` | `const certName = "Excel Ninja: Certificate of Mastery";` | `const certName = "Excel Shortcuts Ninja: Certificate of Mastery";` |
| `challenge-preloader.tsx` | `alt="Excel Ninja Typing"` | `alt="Excel Shortcuts Ninja Typing"` |

- [ ] **Step 3: Verify only the keep-list remains**

Run: `grep -rn 'Excel Ninja' src --include='*.tsx' --include='*.ts'` (the renamed string "Excel Shortcuts Ninja" does not contain "Excel Ninja" as a substring, so any hit is an unrenamed occurrence)
Expected: exactly 5 hits — `signup/page.tsx` (1), `landing-content.tsx` alts (3), `certificate-modal.tsx` fallback name (1). Anything else is a missed rename.

- [ ] **Step 4: Verify typecheck + visual spot-check**

Run: `npm run typecheck 2>&1 | grep -E "logo|landing-content|contact-modal|help/page|before-you-start|landing-donation|legal-content|certificate/page|lib/utils|challenge-preloader" ; echo done`
Expected: only `done`.

Load `localhost:9002/` and confirm the header logo and footer read "Excel Shortcuts Ninja" and the header doesn't wrap/overflow at desktop width (the name is 9 characters longer; if the landing nav or app header looks cramped, flag it in the report rather than restyling).

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat: rename product brand to Excel Shortcuts Ninja across UI"
```

---

## Final verification (after all tasks)

1. `npm run typecheck 2>&1 | grep -E "seo|layout|app/page|sitemap|robots|opengraph" ; echo done` → only `done`.
2. `npm run build` → succeeds.
3. Manual steps for the user (not automatable here):
   - Set `NEXT_PUBLIC_APP_URL=https://ninjashortcuts.com` in the production environment.
   - Connect `ninjashortcuts.com` as the custom domain in Firebase App Hosting.
   - Submit `https://ninjashortcuts.com/sitemap.xml` in Google Search Console.
   - After deploy: run the homepage through Google Rich Results Test and a share-preview checker (e.g. LinkedIn Post Inspector).
