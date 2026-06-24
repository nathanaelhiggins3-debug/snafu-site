# UPDATE-01 — SNAFU site changes (for Claude Code)

> Read this entire file first. Then implement it section by section (A → E), in order.
> Stop after each section and tell me exactly how to view that change in the browser.
> Explain what you did in plain language — I am a beginner.

## Global rules for this pass
- Do NOT redesign the header or the moving ticker. Make only the specific text and
  label changes listed below.
- Do NOT break any existing link or page. After every rename, each nav link and page
  must still load with zero 404s. You must verify this.
- Use vanilla HTML, CSS, and JavaScript only. No new frameworks or libraries. Keep
  everything beginner-editable.
- Do NOT touch the Stripe path, and do NOT invent a large product catalog. Keep the
  current mock/seed pieces.

---

## SECTION A — Global renames

Three channels are being renamed. Apply each new name EVERYWHERE it is visible to a
visitor AND rename the matching folder and data file so the site stays fully
consistent. Update every reference (nav links, page titles, headings, buttons,
home-page strip titles, footer links, the ticker, body copy, file paths, and `href`s).

### Rename summary (single source of truth)

| Old name (visible) | New name (visible) | Folder rename        | Data file rename                         |
|--------------------|--------------------|----------------------|------------------------------------------|
| Dispatch           | News               | `dispatch/` → `news/`| (none, unless one exists)                |
| Archive            | Shop               | `archive/` → `shop/` | `js/archive-data.js` → `js/shop-data.js` |
| Supply             | Goods              | `supply/` → `goods/` | any `supply-data.js` → `goods-data.js`   |

### Specific visible text to update
- Nav links: `DISPATCH` → `NEWS`, `ARCHIVE` → `SHOP`, `SUPPLY` → `GOODS`.
- Hero button: `ENTER THE ARCHIVE` → `ENTER THE SHOP`.
- Home-page strip headings (use exactly these): the Shop strip becomes `New to the
  Shop`; the News strip becomes `Latest News`; keep `Gallery`; the Goods teaser
  becomes `Goods`.
- Any page heading, title tag, or body copy containing "Dispatch", "Archive", or
  "Supply" must use the new name and still read naturally.

### Verification (required before moving on)
After the renames, load the home page and click every nav link: Home, News, Shop,
Goods, Gallery, and Cart. Confirm each page loads with no 404s, and confirm the
home-page strips link to the correct renamed sections. Fix anything broken before
continuing.

---

## SECTION B — Home page hero rework (dictionary-entry style)

Rebuild the hero text beneath the big word so the hero reads like a dictionary entry.

Currently the hero shows the big `SNAFU.` followed by two lines ("A standing
collection of what's worth your attention." and "Fashion, culture, and rare
one-of-one finds — gathered, filed, and offered. When it's gone, it's gone."). Remove
those two lines and replace the hero contents with the following, stacked in this
order:

1. Eyebrow line — keep the existing one exactly as it is: `EST. LOS ANGELES · ISSUE
   NO. 001`.
2. The big display word — keep `SNAFU.` at its current size, with the red period dot
   exactly as it is now.
3. Pronunciation line — smaller, in the mono/label font, in the drab or red accent
   color, styled like a dictionary respelling. Use `/snaˈfo͞o/ · noun`. If that
   special "oo" character (o͞o) does not render cleanly in the browser, use the IPA
   form instead: `/snæˈfuː/ · noun`. You may append a plain hint: `(snuh-FOO)`.
4. Definition — this is the new subtext, in the body/serif font. Use exactly: `a
   chaotic, hopelessly muddled situation — everything tangled at once, usually from a
   mix-up or miscommunication.`
5. Origin line — small, mono, drab color, family-friendly. Use exactly: `Origin:
   military slang — "Situation Normal: All Fouled Up."`
6. Call-to-action button — keep it, now reading `ENTER THE SHOP` (per Section A).

The finished hero should look like a clean, on-brand dictionary entry for the word
SNAFU.

---

## SECTION C — Moving ticker (text-only update)

Do NOT redesign or replace the ticker. Keep its current style, animation, and its
multiple rotating messages. Make ONLY these word changes inside it, to match Section A:
- `NEW IN ARCHIVE: THREE 1/1 PIECES FILED THIS WEEK` → `NEW IN SHOP: THREE 1/1 PIECES
  FILED THIS WEEK`
- `SUPPLY DROP INCOMING — SIGN UP FOR FIRST ACCESS` → `GOODS DROP INCOMING — SIGN UP
  FOR FIRST ACCESS`
- Keep `WHEN IT'S GONE, IT'S GONE` and any other messages unchanged.

Do not replace the ticker with an acronym line. Leave everything else about it alone.

---

## SECTION D — New "PLAY" section: SNAFU block-snake game

Add a playable mini-game in classic SNAFU style.

### D1. Navigation
Add ONE new nav link labeled `PLAY` to the existing header nav, styled exactly like
the other nav links (same font, size, spacing, and hover/active treatment). Add it to
the mobile menu too, if one exists. Do not otherwise change the header or the ticker.

### D2. The page
Create a new page at `play/index.html`. It uses the SAME site header, ticker, and
footer as every other page (so its nav shows the renamed News / Shop / Goods /
Gallery / PLAY links). The game sits in the main content area. Above the game, show a
small mono title (`SNAFU // PLAY`) and a score readout. Build the game with vanilla
JavaScript on an HTML5 `<canvas>`. No libraries.

### D3. The game — classic Snake, SNAFU-themed
Classic Snake on a grid, with two twists: the snake is made of toy alphabet blocks
that spell SNAFU, and the food is stars.

Board:
- A medium square grid. Use a 20 × 20 grid (you may adjust within 17–22 for feel).
  Cell size about 24–28px, so the board is roughly 520px square. Center it, and make
  it scale down to fit smaller and mobile screens.
- Board background is SNAFU cream (`#F1EAD8`) with the same faint dot texture used
  elsewhere on the site. Draw a solid ink (`#17130C`) border frame about 3px thick
  around the play field — this frame is the wall.

The snake (SNAFU alphabet blocks):
- Each body segment is a toy ABC block: a rounded square with a slight beveled, 3D toy
  look and a bold capital letter centered on it.
- Reading from the head along the body, the letters spell `S, N, A, F, U` and then
  repeat (`S N A F U S N A F U …`) as the snake grows. Segment index i shows the letter
  at position `i % 5` of "SNAFU", so the head is always `S`.
- Give each letter its own consistent block color so the repeating pattern reads
  rhythmically:
  - S = red `#CC2E1C`
  - N = blue `#2E5BCC`
  - A = gold `#E0A422`
  - F = green `#2E8C57`
  - U = ink `#17130C`
  - Draw the letters in cream/white so they read clearly on each block color.
- The snake starts at length 3 (showing S, N, A) near the center, with a default
  facing direction, but it stays still until the player starts the game (see Start
  screen).

The food (stars):
- Food is a small five-point star (gold/amber, e.g. `#E0A422`, with a subtle glow or
  outline), placed on a random empty cell.
- Eating a star grows the snake by one block (append the next letter in the SNAFU
  cycle), adds 1 to the score, and spawns a new star on a random empty cell.

Controls:
- WASD to steer: W = up, A = left, S = down, D = right. Also accept the Arrow keys as
  a bonus, but WASD is the spec.
- Prevent 180° reversal: ignore any input that would make the snake instantly reverse
  into its own neck.

Speed:
- Classic tick-based movement at medium speed (about 110–130ms per step). The snake
  moves one cell per tick.

Start screen:
- On load, show an overlay over the board reading `PRESS W A S D TO START`. The first
  valid direction key starts the game loop.

Death rules (classic):
- The snake dies if its head hits the wall (the edge of the grid) or runs into its own
  body.

Death behavior — CRUCIAL, must work reliably:
- On death, stop the game loop, then show a `GAME OVER` overlay centered over the
  board, large, in the site's display font, in SNAFU red.
- Hold `GAME OVER` on screen for about 1.2 seconds, then AUTOMATICALLY redirect the
  browser to the News page. The player does not click anything.
- Use the News page's real URL after the Section A rename, as a root-relative path so
  it works both on the local server (`http://localhost:8000`) and when deployed:
  `/news/`. Verify the path resolves and the redirect actually lands on the live News
  page. This redirect is the most important part of the game.

Score:
- Show the current score (stars eaten) above or beside the board.
- Keep a high score in `localStorage` under the key `snafu_snake_high` and display it.

---

## SECTION E — Cart: make it work with mock items

Right now, adding a mock item does not let me view it in the cart. Make the cart fully
functional with the existing mock items so I can simulate the entire shopping
experience. This stays mock — do NOT wire real Stripe here; that is a later phase.

Implement:
1. Add to cart works: on the Shop product cards and product pages, the "Add to cart"
   action adds that item to the cart, stored in `localStorage` under the key
   `snafu_cart` (store id, title, brand, price, image, and quantity). This must work
   even though the items are placeholders.
2. Header count updates live: the `CART 0` indicator in the header reflects the number
   of items in the cart, updates immediately when items are added or removed, and
   persists across page loads and navigation.
3. Cart page shows items: the cart page (`cart/index.html`) lists each item with a
   thumbnail, title, brand, price, quantity, and a Remove button, plus a running
   subtotal. Include a clean empty state ("Your cart is empty") when there are no
   items.
4. Remove and quantity: removing an item updates the list, the subtotal, and the
   header count. Shop pieces are one-of-one (quantity 1), which is fine.
5. Leave a clearly labeled placeholder where the real Stripe checkout will go later — a
   disabled or "coming soon" checkout button is fine for now.

Verification: add a mock item from the Shop, confirm the header count goes to 1, open
the cart page and confirm the item shows with its details and a subtotal, then remove
it and confirm the list empties, the subtotal returns to zero, and the header count
returns to 0.

---

## SECTION F — After you finish
- Tell me exactly how to run and view the site: the local server command, plus which
  pages to open (home, News, Shop, Goods, Gallery, the new PLAY page, and the cart).
- Confirm all of the following: no links broke from the renames; the hero reads like
  the dictionary entry; the ticker still rotates its messages with the Shop and Goods
  wording; the snake game plays with WASD and redirects to News on death; and the cart
  shows mock items.
- Give me a short summary of every file you changed or added.
