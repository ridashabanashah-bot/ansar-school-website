# Design reference — section inventory from tist.school

Captured at viewport 1440×900 + 390×844 on 2026-04-27.
Screenshots: `/tmp/tist-ref/desktop-N.png`, `/tmp/tist-ref/mobile-N.png` (gitignored).
Raw HTML: `/tmp/tist-ref/tist.html`.

This document records the **layout/density patterns** to mirror — not assets,
copy, or colors. We use Ansar's blue brand palette throughout.

## Header

- Two-row sticky bar with backdrop blur.
  - **Top utility row** — left: announcement marquee. Right: phone, email, social icons, "Apply Now" pill button (warm/orange in reference; we use brand-600 in our blue palette).
  - **Main row** — large logo + school name left, horizontal nav center, secondary CTA right. Hover dropdowns for nav items with children.
- Mobile: stacked logo + hamburger that opens a sheet of nav links.

## Sections (top to bottom)

1. **Hero carousel** (full-bleed)
   - Auto-advancing background image, dark gradient left→right overlay so left-side text reads.
   - Eyebrow tag (small uppercase) → big H1 → subheading paragraph → two CTA buttons.
   - Floating "Play video" thumbnail bottom-left.
   - Right-side floating info cards (curriculum bullets) — for us, replaced by a "Quick facts" mini-card.
   - Arrow controls + dot indicator.

2. **Latest news** strip (cream/light section)
   - Eyebrow + big H2 + intro paragraph + "View all" pill button.
   - 4-up news cards (image top, date chip, title, short excerpt) on desktop; 1-up scroll on mobile.

3. **Pride / Why us** (white section)
   - Eyebrow + H2 + supporting paragraph.
   - 3- or 4-card grid: each card has a colored circle icon + bold title + 2-line body. Density is high — ~4 columns at lg, 2 at md.

4. **Stats strip** (deep brand color band)
   - 3–6 stats horizontal: huge number (display 4xl+) + small label below. Optional inline icon.

5. **Programs / curriculum** grid
   - Image-top cards, 3-up at lg. Title + class range + 2-line body + "Learn more →".

6. **Why choose us** (alternating cream)
   - 6-card icon grid (icon, short title, brief body).

7. **Student-centric campus / facilities**
   - Big icon grid (8–9 cells) on the left; right column is a 3-up photo collage.

8. **Gallery teaser**
   - Eyebrow + H2 + scrollable 3-up image grid; "View gallery" link.

9. **Testimonials**
   - 5-up portrait cards (rounded photo + small quote on hover); we'll replace with a swipeable testimonial carousel (photo, quote, author, role).

10. **CTA banner**
    - Full-bleed band with student-photo on the right, headline + body + bold pill button on the left. Background is a slate/gray-tinted overlay.

11. **Trust strip**
    - Small row of logos / accreditation badges.

## Footer

- Cream/slate background, ~360px tall on desktop.
- Top row: logo + tagline + email + phone + "View Map" button.
- Hairline divider.
- Four equal columns of links:
  - **About** (about, contact, facilities, privacy, etc.)
  - **Quick links** (transport, blogs, news & events, gallery)
  - **Our school** (program tiers)
  - **Beyond academics** (clubs, activities)
- Hairline divider.
- Long paragraph blurb spanning full width.
- Bottom bar: copyright + "made by" line.

## Visual language

- **Density**: every section is content-heavy. White space is structural, not decorative.
- **Surfaces**: alternating white / cream-warm / brand-deep bands. No long flat scrolls.
- **Cards**: rounded-2xl, subtle border, hover lift via shadow-lg.
- **Typography**: display/serif-ish for headings (we use Poppins); Inter for body.
- **Icons**: small filled-circle backgrounds in brand-50 with brand-700 glyphs.
- **CTA color**: a warm accent on the reference (orange) — for us, the primary brand-600 button stays, with a subtle ring + larger shadow on hero/CTA-band placements.
- **Eyebrows**: tiny uppercase tracked-out tag above every section heading.

## Mobile pattern

- Hero shrinks to ~520px tall, headline left-aligned, single CTA below.
- All grids collapse to 1 column.
- Footer columns stack vertically; long blurb stays full-width.
- Floating call/whatsapp pills bottom-right are common on Indian school sites — out of scope for this redesign, but easy to add later.
