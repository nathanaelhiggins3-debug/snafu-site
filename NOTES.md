# SNAFU — Build Notes & Direction

> Living context file. Nate writes direction here; Claude references it before making changes.
> Last updated: 2026-06-18

## The brand, in one breath
A global hub for fashion, culture, and rare 1/1 finds. Based in LA, owned outright,
static site → deploy free → Stripe later. Anti-mainstream. "When it's gone, it's gone."

## Identity feel (the north star)
- **Chateau Marmont meets rigid abstract punk edge.** Old-Hollywood faded grandeur +
  hard punk structure. The happy medium of *class* and *cool uniqueness*.
- Like the **clutter of a chic old-money antique mansion** — rich in small details,
  little ornaments, fancy small gestures and symbols, all on-theme.
- **Neutral on first contact.** Like the word "SNAFU" itself — you don't instantly
  associate a theme; you wait for it to be presented. Avoid spelling the theme out loud.
- Detail, deep detail, and more detail. Layered. Interactive. Complicated. Engaging.

## Locked / loved (do not break)
- Dotted paper-grain background. Very SNAFU. Keep it.
- The dot after SNAFU in the header logo: `SNAFU.`
- The acronym/status toggle when you click the stamp top-right — perfect little detail.
  Keep this energy of tiny rewarding interactions everywhere.

## Palette (locked)
- Cream base `#F1EAD8`
- Near-black ink `#17130C`
- Redaction-red accent `#CC2E1C`
- Sand placeholder `#DDD3BC`

## Type (revised 2026-06-18)
- Display: **Bodoni Moda** — high-contrast fashion-editorial serif. Classy; the punk
  comes from how it's used (oversized, tight, hard rules, redaction red).
- Labels / utility / stamp: **Space Mono** — the punk/technical edge.
- Body: **Newsreader** — elegant, readable serif.
- (Fonts are a one-line swap in css/styles.css `:root` + the <link> in each page head.)

## Decisions made this round
- Dropped the "field dispatch / frequency / channel / filing-desk" language. Sections are
  just sections now, indexed elegantly (01–04) like a contents page in an old book.
- Stamp text is now **SITUATION: NORMAL → SITUATION: ALL F'D UP**.
- Added a **broadcast ticker** (scrolling marquee) in the header for dynamic info.
- Added small typographic ornaments (fleurons ❧, asterism ⁂, daggers †, section marks §)
  as dividers/accents — the "antique clutter," kept tasteful.

## Structure
- Home hub + four sections, shared header/footer/ticker across all pages.
  1. **Dispatch** — editorial/news, the "what's cool" feed. Signal, not a comment pool.
  2. **Gallery** — campaigns, fits, editorial shots.
  3. **Archive** — 1/1 rare resale. Product grid → click into a detail page per piece.
  4. **Supply** — SNAFU's own product/drops.

## How the code is organized (so Nate can edit)
- `css/styles.css` — one file, numbered/commented sections. Tokens live in `:root` up top.
- `js/site.js` — builds the shared ticker + header + footer once; every page injects it.
- `js/archive-data.js` — the Archive product list. One source feeds both the grid and the
  detail pages. Add a piece by copying one block.
- Pages are tiny: just their own content + the shared script line.

## Running list / ideas to revisit
- Add real images (replace sand placeholders).
- Build Supply detail pages like Archive when products firm up.
- Stripe checkout (needs a tiny local server — Claude will walk through it).
- More micro-interactions / hover gestures over time.
