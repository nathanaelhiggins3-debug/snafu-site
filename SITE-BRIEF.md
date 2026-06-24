# SITE-BRIEF — SNAFU.com (build with Claude Code)

> READ THIS WHOLE FILE FIRST. Then look at the existing snafu project in this
> folder. Then propose a PHASED build plan and WAIT for my approval before writing
> a lot of files. Build phase by phase and stop after each so I can run it, look at
> it in the browser, and live-edit with you. I am the developer; I am new to coding
> but learning fast — explain each step in plain language as you go.

---

## 1. What we're building

The SNAFU website: a global digital hub for fashion, culture, and rare one-of-one
finds. I'm using an existing site, **Sunny Arkives** (a curated archive/resale
store), as the **structural template** — its page architecture and layout. But the
identity, voice, sections, and copy are 100% SNAFU. Think: Sunny Arkives' *skeleton*,
SNAFU's *blood*.

I cannot show you the reference screenshots, so Section 3 describes the Sunny
Arkives structure in detail. Replicate the STRUCTURE, never their actual content,
images, brand list, or copy — all of that is mine and original.

## 2. The synthesis rule (important)

- **Structure / layout / page types** = copy from the Sunny Arkives template
  (described in Section 3).
- **Identity / palette / type / voice / section names / all copy** = SNAFU
  (Section 5).
- Where Sunny Arkives has a generic store section, map it to the SNAFU channel that
  fits (Section 6) and rewrite all text in SNAFU's voice.

## 3. The reference template (Sunny Arkives) — structure to replicate

A clean, spacious, editorial e-commerce layout. Lots of whitespace, big imagery,
minimal chrome. The pages and components:

**Global (on every page):**
- A thin **announcement bar** at the very top (full-width), centered text, with a
  region/flag at the left. (SNAFU version = the broadcast ticker.)
- A **header**: left side = hamburger menu + primary nav links; **centered logo**;
  right side = search icon, a "Follow" link, account icon, cart icon with item
  count.
- The primary nav opens a **mega-menu**: a full-width panel with columns (a SHOP
  column listing categories, plus other nav columns) and 1–2 large featured image
  cards with "Shop Now ›" links.
- A **trust-badge row** under the header on the home page: four items with small
  icons — e.g. "Worldwide Shipping / Secure Payment / Curated Selection / Expert
  Authentication."
- A **footer** (build a clean one — links to all sections, social, newsletter
  signup, legal).

**Home page:**
- A full-bleed **editorial hero** image with a centered tagline and a single
  call-to-action button ("Shop Now").
- A **"New Arrivals"** section below (product grid).

**Shop / All Products page (the commerce core):**
- A results count ("1120 Results"), a **"Sort by"** dropdown (e.g. Date new→old).
- A **left filter sidebar** (sizes by category, etc. — keep SIMPLE for v1, see
  Section 4).
- A **product grid**: each card = product image, product title, brand name
  (subtitle), price, and a **"Sold out"** badge when applicable.

**Catalog page:**
- A grid of large **catalog/lookbook "volumes"** — each a big editorial cover image
  with a title ("Catalog Vol. 1", "Vol. 2"...). These are seasonal editorial
  lookbooks, not individual products.

**Brands page:**
- An **A–Z index**: letter headers (1, A, B, C … Y) each listing brand names as
  links. Clicking a brand filters the shop to that brand.

**About page:** brand story / info.

**Profile / account:** login/account area. (DEFER for v1 — see Section 4.)

## 4. HONEST architecture decision (read carefully — this scopes the work)

Replicating the full Sunny Arkives store custom is large. Here's how we build it
sanely:

**v1 builds (the high-value core, finishable, makes it a real SNAFU site that sells):**
- The full SNAFU identity shell: ticker, header + mega-menu, trust badges, footer.
- Home page with hero + featured strips into each channel.
- **Archive** (the resale store): product grid + product pages + **working Stripe
  checkout**. Filters kept SIMPLE — category + a single sort. Each piece is 1-of-1
  (quantity 1); "available" → "sold" status.
- **Supply** (SNAFU's own product): same commerce engine as Archive.
- **Gallery** (campaign/lookbook volumes — the "Catalog" page type).
- **Dispatch** (the editorial/news feed — articles; this is SNAFU's addition, not in
  Sunny Arkives).
- **Brands** A–Z index (links into the Archive filtered by brand).
- **About**.
- **Cart + Stripe Checkout**.

**DEFER to later phases (do NOT build in v1 — they balloon scope):**
- User **accounts / profile / login**, and "Follow."
- **Faceted multi-filtering** at scale (size + waist + brand + category all at once)
  and full-text **search**. (v1 = simple category filter + sort only.)
- Anything assuming a 1,000+ product catalog. v1 assumes a modest, hand-managed set.

**If the Archive ever grows to true Sunny-Arkives scale** (hundreds+ of items,
accounts, heavy search), the right move is a real commerce backend (Shopify headless,
or Stripe + a small database/admin) behind the custom SNAFU shell — NOT hand-editing
a thousand-item file. Note this in the README as a future decision. Build v1 as
above for now.

## 5. SNAFU identity (apply throughout)

**Design tokens (CSS variables):**
```
--paper:   #F1EAD8   (warm cream background)
--ink:     #17130C   (near-black text)
--stamp:   #CC2E1C   (redaction red — accents, primary buttons)
--drab:    #8C8470    (muted khaki — labels, hairlines)
--sand:    #DDD3BC    (image placeholders / panels)
--line:    rgba(23,19,12,0.16)
```
Adopt Sunny Arkives' CLEAN, SPACIOUS editorial layout (lots of whitespace, big
imagery) but SKIN it with these SNAFU tokens. If at any point I say I want it to
look more like the minimal white Sunny Arkives style instead, that's a palette
swap we can do — but default to the SNAFU cream/ink/red identity.

**Fonts (Google Fonts):** display/headings = **Archivo** (heavy, condensed feel,
uppercase); labels/metadata/filing codes = **Space Mono**; body/article text =
**Newsreader** (serif).

**Voice:** bold, confident, quirky, anti-mainstream. Clean navigation; the chaos
lives in texture and copy, not in the structure. No emojis.

**Signature SNAFU quirks to keep:**
- The top bar is a **broadcast ticker** reading something like:
  "SITUATION NORMAL — ALL F***ED UP — ARCHIVE RESTOCK FRIDAY — ACCESSED GLOBALLY".
- A **"STATUS: NORMAL / ALL F***ED UP" stamp** somewhere in the header (a bordered,
  slightly rotated mono badge that toggles on click) — the SNAFU mark, in place of
  Sunny Arkives' logo treatment. The SNAFU wordmark itself is the centered logo.

## 6. Site map & navigation (Sunny page → SNAFU channel)

Primary nav (replaces SHOP/CATALOG/BRANDS/ABOUT/PROFILE):

| Sunny Arkives page      | SNAFU channel | What it is |
|-------------------------|---------------|------------|
| SHOP / All Products     | **ARCHIVE**   | 1-of-1 rare resale pieces (the store) |
| CATALOG (volumes)       | **GALLERY**   | Campaign / lookbook volumes, fits, editorial |
| (none — SNAFU addition) | **DISPATCH**  | Editorial/news feed — "what's cool," hand-filed |
| (SNAFU's own goods)     | **SUPPLY**    | SNAFU-made product / drops |
| BRANDS                  | **BRANDS**    | A–Z index, links into Archive by brand |
| ABOUT                   | **ABOUT**     | Brand story |

Right side of header: search (DEFER — placeholder for v1), cart, account (DEFER).
So functional v1 nav: **DISPATCH · GALLERY · ARCHIVE · SUPPLY · BRANDS · ABOUT** +
cart.

## 7. Page-by-page spec

- **Home:** ticker → header → trust badges → full-bleed hero (SNAFU tagline, e.g.
  "Find it in the static." + a CTA) → "New to the Archive" product strip →
  "From the Dispatch" latest articles strip → "Gallery" image strip → "Supply"
  teaser → footer.
- **Archive (store):** results count, simple category filter + sort dropdown,
  product grid (image, title, brand subtitle, price, "Sold/Claimed" badge). Clicking
  a card → **product page** (gallery of images, title, brand, price, description,
  size/condition, an "Add to cart" or "Buy" button; if sold, show "Claimed"). Each
  item is 1-of-1.
- **Supply:** same as Archive but for SNAFU's own goods (these can have sizes/qty >
  1 since they're produced, not 1-of-1 — support a simple size selector).
- **Gallery:** grid of campaign/lookbook "volumes" (big cover image + title) →
  volume page = a set of images.
- **Dispatch:** list of articles (filing code, channel tag, date, headline, dek) →
  article page (the field-dispatch article layout: mono metadata, Archivo headline,
  Newsreader body). Articles authored as markdown/data files.
- **Brands:** A–Z index of brand names; clicking filters the Archive to that brand.
- **About:** SNAFU story, the authentication promise, contact.
- **Cart:** list of added items, quantities (1 for archive), subtotal, "Checkout"
  button → Stripe.

## 8. Data model (keep it simple, file-based for v1)

- **Products** — a `products.json` (or one file per channel: `archive.json`,
  `supply.json`). Each product:
  ```json
  {
    "id": "obj-014",
    "channel": "archive",            // or "supply"
    "title": "Distressed Field Parka",
    "brand": "Maison Margiela",
    "price": 640.00,
    "currency": "USD",
    "category": "outerwear",
    "sizes": ["M"],                   // archive usually single; supply can be multi
    "images": ["/img/archive/obj-014-1.jpg", "..."],
    "description": "…",
    "status": "available"             // "available" | "sold"
  }
  ```
  This file IS the inventory for v1. Marking something sold = change status to
  "sold". (Later this could move to a small admin or a commerce backend.)
- **Dispatch posts** — markdown files with front matter (title, date, channel,
  filing code, dek) — reuse the field-dispatch article style already in this
  project.
- **Gallery volumes** — a `gallery.json` (title, cover image, image list per
  volume).

Build the Archive/Supply grids, product pages, brand index, and home strips by
reading these data files, so adding a product = adding a JSON entry + images (easy
for me to do).

## 9. Stripe architecture (v1 commerce)

Use **Stripe** for payments. Clean, ownable, secure approach:

- **Cart:** client-side (JS; localStorage is fine for a real deployed site).
- **Checkout:** a small **serverless function** (Netlify Functions or Vercel
  Functions) called `create-checkout-session` that:
  1. receives the cart's line items,
  2. creates a **Stripe Checkout Session** (server-side, using the official `stripe`
     npm package),
  3. returns the session URL; the frontend redirects to Stripe's hosted checkout
     page.
- **Security:** the Stripe **secret key** lives ONLY in the serverless function's
  environment variables — NEVER in frontend code or committed to the repo. The
  frontend uses only the **publishable key**.
- **Start in TEST MODE.** Use Stripe test keys and test card numbers so no real
  charges happen while we build. We switch to live keys only when I say so.
- **Verify the current Stripe API + Checkout Session syntax against
  https://docs.stripe.com before writing the integration — don't guess the shape.**
- Honest note for the README: Stripe handles the payment only. Marking an item sold,
  shipping, and fulfillment are manual for v1 (fine for 1-of-1 pieces). Sold-out /
  inventory automation is a later phase.

## 10. Tech stack

- Static-site-first, hand-editable, light dependencies. Because there are many
  product pages and articles generated from data, I'm open to a **lightweight static
  site generator (e.g. Eleventy / 11ty)** to template products and posts from the
  data files — propose this in your plan if it keeps things clean and maintainable.
  No heavy frameworks, no unnecessary complexity.
- **Serverless functions** for the Stripe checkout endpoint.
- **Deploy target:** Netlify or Vercel (free tier, supports static + serverless
  functions). The README should explain deploying there and pointing a domain at it.
- If this project already has a structure (homepage hub + Dispatch were started),
  integrate with it; if migrating to a static generator is cleaner, propose that as
  part of the plan and explain the tradeoff before doing it.

## 11. Build order (phases — stop and let me test after each)

1. **Phase 1 — shell:** global layout (ticker, header + mega-menu, trust badges,
   footer) + home page with hero and placeholder strips. Skin in SNAFU identity.
   Let me see it.
2. **Phase 2 — Archive store (display):** product grid + product pages + simple
   category filter + sort, driven by `archive.json`. Cart UI (add/remove, subtotal)
   — no real payment yet, just the cart. Let me test.
3. **Phase 3 — Stripe checkout:** the serverless `create-checkout-session` function,
   wire the cart to Stripe test-mode checkout, success/cancel pages. Test with
   Stripe test cards.
4. **Phase 4 — the other channels:** Gallery (volumes), Dispatch (articles), Brands
   A–Z index, About. Supply reusing the Archive engine.
5. **Phase 5 — polish & deploy:** mobile layout, empty/error states, then deploy to
   Netlify/Vercel and point a domain.

After each phase tell me exactly how to run it locally and what to look at.

## 12. What I'll need to provide (tell me when)

- A **Stripe account** + **test-mode** publishable & secret keys (I'll get these
  from dashboard.stripe.com — guide me when it's time).
- Product data (titles, brands, prices) + product images for a starter set of
  Archive and Supply pieces.
- Dispatch article text and Gallery images (placeholders fine to start).

## 13. Hard constraints — do NOT do these

- Do not copy Sunny Arkives' actual content, images, brand list, or copy — structure
  only; all SNAFU content is original.
- Do not put the Stripe secret key in frontend code or commit it. Use serverless env
  vars. Add `.env` to `.gitignore`.
- Do not build the deferred items (accounts/profile, follow, full search, heavy
  faceted filtering) in v1.
- Do not add heavy frameworks or unnecessary complexity. Keep it editable by a
  beginner.
- Use Stripe TEST mode until I explicitly say go live.

## 14. Definition of done (v1)

A live SNAFU site where: the identity is unmistakably SNAFU; you can browse the
Archive and Supply, open product pages, add to cart, and complete a Stripe (test)
checkout; Gallery, Dispatch, Brands, and About all exist and read in SNAFU's voice;
adding a product = adding a JSON entry + images; and it's deployed to a real URL.
