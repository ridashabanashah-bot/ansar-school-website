# Design reference — alabaster-inspired direction

This **replaces** the earlier tist.school dense-card direction. We are
moving to a calmer, photography-first aesthetic modeled on
[alabasterjarproject.org](https://alabasterjarproject.org), translated
into Ansar's logo-derived palette.

Captured 2026-04-27, viewport 1440×900 + 390×844.
Screenshots: `/tmp/alabaster-ref/desktop-N.png` + `mobile-N.png` (gitignored).

---

## Visual principles

- **Restraint over density.** One idea per section, lots of breathing room (py-24 at lg, py-32 in some).
- **Photography forward.** Hero is one full-bleed photo with a thin overlay; section illustrations are *one* picture, not a card grid full of them.
- **Serif display + sans body.** Headings in **Fraunces** (variable serif), body in **Inter**. Mid-weight serif for h2/h3.
- **Off-white surfaces, not pure white.** Cream backgrounds (`#fcf6ee` family) carry the page; pure white reserved for cards.
- **Soft pastel accents.** Sage, dusty rose, warm peach as section tints — not shouty primaries. We translate this to Ansar's deep navy ink + warm gold accent.
- **Borders over shadows.** Subtle `ring-1 ring-black/5` + `border-cream-100` instead of heavy drop-shadows. Cards barely lift.
- **Buttons.** Medium pill or rounded-md (rounded-full is fine for primary CTAs), no rings, gentle hover translateY(-2px). One CTA per section.

## Typography pairing

- **Fraunces** (Google variable, optical-size + weight axes) — h1/h2/section eyebrows. Use opsz 36+ for big headings.
- **Inter** — body, nav, microcopy.

## Color (Ansar translation, not alabaster's literal hexes)

The Ansar logo is a deep navy ink shield on a single tone. Derive a **navy/slate ramp** for `brand`, keep `accent` warm gold/amber, and add cream neutrals for section backgrounds.

```
brand:  navy ink ramp tuned for warmth, not previous saturated blue
accent: warm gold/amber — used only for primary CTAs and small flourishes
cream:  off-white section background (50, 100)
```

## Section pacing (home page)

1. **Hero** — full-bleed photo, dark gradient bottom-up overlay; serif headline overlaid; small uppercase eyebrow; one pill CTA. **No** carousel arrows visible by default (show on hover); fade transitions, 8s autoplay.
2. **About snapshot** — 2-col, 60/40. Left: small eyebrow, serif h2, body, single CTA. Right: photo collage (3 images: tall left, two stacked right) — uses real Ansar photos.
3. **Stats strip** — cream-100 background, 4 columns, **serif** numerals (Fraunces 5xl), thin uppercase tracked-out labels. No icons, no shadows.
4. **Programs (3 cards)** — image at top (4:3), centered serif title, 2-line body, `Learn more →` link. Card border = `border-cream-100 ring-1 ring-black/5`. No accent rule.
5. **Why Ansar (2x3 grid)** — small brand-colored line above title, serif title, small body. No numbered badges, no icons.
6. **News & events** — left: 3 latest news with real cover images, serif titles. Right: clean event list (date chip + title) in a simple column.
7. **Testimonials** — single quote on cream background, fades between quotes. Small portrait + name + role centered. No arrows.
8. **CTA banner** — full-bleed photo, dark overlay, serif heading + single solid pill button.

## Header

- **Single row** (drop the previous utility bar). Logo image left + school name + tagline. Nav center. "Apply Now" pill right.
- Cream background `bg-cream-50/95` with backdrop-blur and a hairline `border-b border-cream-100`.
- Mobile: hamburger drawer.

## Footer

- **Three columns** (drop the four-column dense version): (1) logo + footerAboutBlurb, (2) quick links + social, (3) contact card.
- **Cream-100 background**, dark text. Not the navy slab.
- Hairline divider above bottom bar; copyright + made-by.

## Reference observations from alabaster (not copied)

- Hero: smiling photograph + serif overlaid headline at bottom-left + small green pill button. Top nav simple sans, single donate pill on right.
- 3-up programs: photo top, centered serif name, sparse body, "Learn More" link.
- Stats inline as **pastel-tinted pills with serif numerals** (peach, sage). Each stat sits on its own card.
- Mid-page video block framed by a paint-stroke cutout.
- "Success Stories" / "changemakers" — center-aligned serif on tinted bands (sage / dusty rose).
- Newsletter band gradient navy→rose, serif heading.
- Footer: dark navy with sage links, separated bottom slab on cream with address + tax id + dev credit.

We copy the **rhythm** (one idea per band, lots of air, serif + sans pairing, off-white) — not the colors or copy.

## Instagram (skipped)

`https://www.instagram.com/ansar_schoolpdi/?hl=en` — IG redirects unauthenticated visitors to its login wall, so profile bio / captions could not be captured. No tone reference pulled from IG. Final URL on attempt: `…/accounts/login/?next=...`.

## Mobile pattern

- Hero shrinks to ~70vh, headline serif but smaller, single CTA.
- All grids collapse to 1 column.
- Stats become 2x2.
- Footer columns stack.
- Header: sticky cream bar, hamburger right.
