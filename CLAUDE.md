# Ansar School — Project Context for Claude Code

A private K-10 CBSE school site for Ansar School Padhinjarangadi, Kerala. This file is auto-loaded by Claude Code in any session in this repo. Read it before doing anything else.

## Stack

- **Frontend** — Next.js 14 App Router + TypeScript + Tailwind CSS (`frontend/`)
- **CMS** — Strapi 5 on Strapi Cloud (`cms/`)
- **Hosting** — Vercel, auto-deploys on push to `main`
- **Repo** — github.com/ridashabanashah-bot/ansar-school-website
- **Live site** — https://frontend-five-lemon-35.vercel.app

## Design system (current)

**Palette** — anchored on the Ansar logo navy. Defined in `frontend/tailwind.config.ts`.

| Token | Hex | Use |
| --- | --- | --- |
| `brand-700` | `#1B3D6B` | Logo navy. Primary text colour, dark surfaces, button bg |
| `brand-900` | `#0D1F40` | Deep ink. Headings, footer, deepest surfaces |
| `accent-500` | `#0437F2` | Electric blue. Primary accent — links, CTAs, dots, highlights |
| `accent-700` | `#224C98` | Royal blue. Hover states, secondary accent |
| `accent-100` | `#D4E0FF` | Soft fill. Pill icon backgrounds, soft surfaces |
| `cream-50` | `#FFFFFF` | Pure white surface |
| `cream-100` | `#F8F9FB` | Cool whisper-grey surface |

Do **not** introduce new colour tokens. If you need a shade, pick one already in the ramp. Brand and accent stay disciplined.

**Type** — loaded in `frontend/src/app/layout.tsx` via `next/font`:
- Display: Fraunces (variable, with `opsz` axis)
- Body: Inter (400/500/600)
- Signature: Caveat (only used for principal sign-off)

**Tone rules** — these are content rules from the school. Honour them:
1. **No invented numbers.** Don't write "30+ years," "1000+ alumni," "100% pass rate," or any stat we can't verify. The homepage explicitly has no stats section.
2. **No AI mentions.** The school may build AI tooling internally, but it's not advertised on the homepage.
3. **No social-media branding in body content.** Instagram, Facebook, YouTube, WhatsApp belong in the footer as icon links only — never named in headlines, hero badges, or sections.
4. **No traditional / stereotypically-Indian visual cues.** Brand reads international and modern. No saffron-orange, no marigold, no maroon-tilak motifs.

## Homepage architecture

`frontend/src/app/page.tsx` is the homepage. Sections, in order:

1. Hero photo card with floating preview cards + aurora gradient mesh
2. Marquee trust strip (CBSE Affiliated, English Medium, Class I — X, etc.)
3. About + principal card (with rotating seal + orbit dot)
4. Quick explore — 4 cards with 3D tilt on hover (School profile, Faculty & staff, Facilities, Co-curriculars)
5. Why Ansar — 4 glassmorphism pills around a centred photo
6. Numbered offerings — 6 items (Roman numerals i. — vi.) with hover sweep-fill
7. Bento grid — "A day at Ansar" with mixed media tiles
8. Latest happenings — Strapi-driven news tiles
9. CTA card — three-column with admissions tag

**CSS scoping convention** — homepage-specific styles are in `frontend/src/app/globals.css`, all classes prefixed `.hp-*`. Do not put homepage rules under generic class names. Tailwind utilities are fine for layout; custom CSS is for motion + glassmorphism + bento grid.

**Client-side effects** — `frontend/src/components/HomeEffects.tsx` is the single client component that handles scroll progress, cursor follower, IntersectionObserver reveals, and 3D tilt on quick cards. Mounted once at the top of `page.tsx`. Respects `prefers-reduced-motion`. Disabled on mobile.

**Data wiring** — `page.tsx` calls `getHomePage()`, `getAboutPage()`, `getNews(6)` from `frontend/src/lib/content.ts`. Hero image, principal photo, intro copy, why-us pillars (if 4+ in Strapi), CTA banner, and news tiles all pull from Strapi with hardcoded fallbacks. Quick links, offerings list, bento tiles are hardcoded constants near the top of `page.tsx` (`QUICK_LINKS`, `OFFERINGS`, `WHY_PILLS`).

**Fallback photos** — local images in `frontend/public/photos/`. Paths exported from `frontend/src/lib/fallbackPhotos.ts`. Never inline raw external URLs (e.g. Unsplash) in components — use the fallback exports.

## File conventions

- `@/` aliases to `frontend/src/`
- All page files are server components by default; mark `"use client"` only when you need browser APIs
- Edit globals.css for any homepage style change — don't create new CSS modules
- Keep edits surgical — `Edit` tool for small changes, `Write` only for new files or full rewrites
- Run `npx tsc --noEmit` from `frontend/` after every change set to verify types

## Working with this codebase

When a request is ambiguous, ask before guessing. If the user pastes a template prompt that still has `[BRACKET PLACEHOLDERS]` in it, ask them to fill it in rather than picking an example.

When adding a new section to the homepage:
1. Add the JSX inside `page.tsx` between two existing sections
2. Add scoped `.hp-*` CSS rules in `globals.css`
3. Add `.hp-reveal` class to elements that should fade in on scroll
4. Wire to Strapi data if the type already exists in `frontend/src/lib/types.ts`; otherwise hardcode a constant near the top of `page.tsx`
5. Run `npx tsc --noEmit` from `frontend/`

When changing the palette:
1. Edit `frontend/tailwind.config.ts` (brand or accent ramp)
2. Search-and-replace any hardcoded hex in `globals.css` and `page.tsx` (look for the old value and the rgba form of it)
3. Run `npx tsc --noEmit`

When deploying:
1. `git add -A && git commit -m "..." && git push` from repo root
2. Vercel auto-builds. Watch at vercel.com/[user]/[project]
3. If the build fails, the error usually appears in the Vercel deployment log

## Outstanding gaps (real content the user is supplying separately)

- Real campus photos to replace `/photos/` placeholders
- Real principal portrait
- Strapi entries for `home.heroSlides`, `home.introHeading`, `home.introBody`, `home.whyUs`, `about.principalName`, `about.principalMessage`, `about.principalPhoto`, `home.ctaBanner`
- News articles published in Strapi to populate the latest happenings tiles
