# SNAFU

A static site for SNAFU — a global hub for fashion, culture, and rare 1/1 finds.
Plain HTML/CSS/vanilla JS, no build step, hand-editable. The only server-side
piece is a Stripe Checkout function (Netlify Function).

## Run it locally

### Static preview (no checkout)
Everything except Stripe checkout works from a plain static server:

```
python3 -m http.server 8000
# open http://localhost:8000/
```

### Full preview (with Stripe checkout)
Checkout needs the Netlify dev server so the function endpoint exists.

1. Install dependencies (gets the `stripe` package + Netlify CLI):
   ```
   npm install
   npm install -g netlify-cli   # if you don't have `netlify` yet
   ```
2. Add your Stripe **test** secret key:
   ```
   cp .env.example .env
   # edit .env and set STRIPE_SECRET_KEY=sk_test_...
   ```
   Get the key at https://dashboard.stripe.com/test/apikeys (it starts `sk_test_`).
3. Start it:
   ```
   netlify dev
   # opens http://localhost:8888/
   ```
4. Add a Shop piece to the cart, open the cart, click **Checkout**. On Stripe's
   page use the test card **4242 4242 4242 4242**, any future expiry, any CVC.
   Success returns to `/checkout/success.html`; cancel returns to
   `/checkout/cancel.html`.

## Deploy (Netlify)

1. Push to GitHub (already set up: `origin` → snafu-site).
2. In Netlify: **Add new site → Import from Git**, pick the repo. `netlify.toml`
   already sets publish dir `.` and functions dir `netlify/functions` — no build
   command needed.
3. In **Site settings → Environment variables**, add `STRIPE_SECRET_KEY` with your
   Stripe **test** key. (Switch to the live key only when you're ready to take real
   money — see below.)
4. Deploy. Point your domain at the site in Netlify's domain settings.

## How the code is organized

- `index.html` + section folders (`news/ gallery/ shop/ goods/ play/ cart/ checkout/`)
  — each page is small; shared ticker/header/footer come from `js/site.js`.
- `css/styles.css` — one file, numbered sections, design tokens in `:root`.
- `js/shop-data.js` — the Shop inventory (one source of truth). Used by the browser
  **and** required by the checkout function so prices are authoritative server-side.
- `js/cart.js` — client cart (localStorage `snafu_cart`).
- `netlify/functions/create-checkout-session.js` — creates the Stripe session.

Adding a Shop piece = adding one entry to `js/shop-data.js` (+ images later).

## Security notes

- The Stripe **secret key** lives only in the function's environment variable
  (`STRIPE_SECRET_KEY`), never in frontend code, never committed. `.env` is gitignored.
- The function builds line items from `js/shop-data.js` **by id** — it does not trust
  prices sent by the browser.
- The site uses Stripe **test mode** until you deliberately swap in a live
  `sk_live_...` key.

## Honest scope (v1)

- Stripe handles the **payment** only. Marking a piece sold, shipping, and
  fulfillment are **manual** for now (fine for one-of-one pieces). Set a piece's
  `status` to `"SOLD"` in `js/shop-data.js` after it sells.
- Inventory/sold-out automation, accounts, full search, and heavy filtering are
  later phases. If the Shop ever grows large, move inventory to a real commerce
  backend (e.g. Shopify headless, or Stripe + a small DB/admin) behind this shell
  rather than hand-editing a huge data file.

