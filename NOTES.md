# SNAFU — Build Notes & Direction

> Living context file. Nate writes direction here; Claude references it before making changes.
> Last updated: 2026-06-25

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

## Type (revised 2026-06-25)
- Display: **Libra** — local custom face (uncial, all-caps in use). Loaded via `@font-face`
  in css/styles.css from `fonts/Libra.ttf`, which is OTS-sanitized so Chrome accepts it
  (maxZones 3→1, hinting tables stripped, cmap rebuilt). Used oversized, tight, with hard
  rules + redaction red. Fallback is Georgia — if you ever see Georgia, Libra failed to load.
- Labels / utility / stamp: **Space Mono** — the punk/technical edge.
- Body: **Newsreader** — elegant, readable serif.
- Mono + body load from Google Fonts (the `<link>` in each page head). The display face is
  the single `@font-face` + the `--display` token in `:root` — one swap point each.
- The original unsanitized font is kept as `fonts/LIBRA___.TTF` (+ `.TXT` license); the site
  does NOT load it. Re-sanitize from it if Libra ever needs rebuilding.

## Decisions made this round
- Dropped the "field dispatch / frequency / channel / filing-desk" language. Sections are
  just sections now, indexed elegantly (01–04) like a contents page in an old book.
- Stamp text is now **SITUATION: NORMAL → SITUATION: ALL F'D UP**.
- Added a **broadcast ticker** (scrolling marquee) in the header for dynamic info.
- Added small typographic ornaments (fleurons ❧, asterism ⁂, daggers †, section marks §)
  as dividers/accents — the "antique clutter," kept tasteful.

## Structure
- Home hub + five sections, shared header/footer/ticker across all pages.
  1. **News** — editorial/news, the "what's cool" feed. Signal, not a comment pool.
  2. **Gallery** — campaigns, fits, editorial shots.
  3. **Shop** — 1/1 rare resale. Product grid → click into a detail page per piece (`shop/item.html?id=`).
  4. **Goods** — SNAFU's own product/drops.
  5. **Play** — a block-snake game spelling SNAFU. It lives in the top nav, but is
     deliberately left OFF the home "Index" (which stays "four ways in") — a quiet find,
     on-brand with the hidden-detail identity. Don't add it to the Index.
- Plus supporting pages: `cart/`, `checkout/success`, `checkout/cancel`, `shop/item.html`.

## How the code is organized (so Nate can edit)
- `css/styles.css` — one file, numbered/commented sections. Tokens live in `:root` up top.
- `js/site.js` — builds the shared ticker + header + footer once; every page injects it.
  Nav order = the `SECTIONS` array at the top.
- `js/shop-data.js` — the Shop product list. One source feeds the grid, the detail pages,
  AND the Stripe function (it `require()`s this file, so prices are never trusted from the
  browser). Add a piece by copying one block.
- `js/cart.js` — the localStorage cart (`window.SNAFU_CART`); fires a `snafu:cart` event so
  the header badge updates live.
- Pages are tiny: just their own content + the shared script line.

## Running list / ideas to revisit
- Add real images (replace sand placeholders in Gallery + product frames).
- Wire the `#` placeholder links — News article titles and Goods products — to real pages.
- Build Goods detail pages like Shop when products firm up.
- Stripe checkout is LIVE in test mode (Netlify Function). To run it locally: `npm install`,
  then `netlify dev`; needs `STRIPE_SECRET_KEY` (sk_test_…) in `.env`. Swap to live keys to ship.
- More micro-interactions / hover gestures over time.
