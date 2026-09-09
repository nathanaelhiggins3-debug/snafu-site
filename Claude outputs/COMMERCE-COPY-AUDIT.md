# SNAFU — Commerce Copy & Config Audit

Read-only audit of every customer-facing commerce statement and the checkout/inventory config. **No changes were made.** Stripe/checkout remain OFF. Paths are repo-relative; line numbers are from the versions on disk at audit time.

---

## 1. Exact current statements (file : line)

### Shipping / dispatch / handling
- `shop/product.html:540` — claim-check body: *"One piece, one buyer. Review the condition and measurements below; fit is personal. Every item is cleaned and ready to wear. **Shipping is calculated at checkout.**"*
- `checkout/success.html:23` — *"We file and pack by hand. You will get a confirmation and **shipping note** from us directly. Thank you for collecting with SNAFU."*
- **No stated shipping cost, no destinations, no dispatch/handling time anywhere.**

### Returns / refunds / damage / lost packages / condition disputes
- **None. There is no returns, refund, damaged-item, lost-package, or dispute statement anywhere in the audited files.** (Closest is `checkout/cancel.html:22` — *"No charge was made. Your cart is exactly as you left it — nothing is gone yet."* — that is a checkout-cancel state, not a policy.)

### Checkout / cart language
- `cart/index.html:273` — `CHECKOUT OPENING SOON` (a disabled status element, `cursor:not-allowed`, styles at `:155–164`).
- `cart/index.html:274–278` — *"Your pack is saved and will keep. **Purchasing is not open yet** — nothing here charges you, and nothing is reserved. Email nate@snafu.quest about a piece in the meantime."*
- `shop/product.html:526–529` — buy button reads `CHECKOUT SOON` (or `SOLD`), `disabled`; tooltip *"Checkout is not open yet — add it to your pack and it will keep."* / *"This piece is gone."*
- `checkout/success.html:22` — *"Payment confirmed in **test mode**. Your piece is held. Each one is one-of-one, so it is now off the board."*
- `checkout/cancel.html:22` — *"No charge was made…"* (above).
- Cart "checkout" is a non-interactive `<div role="status">`, not a button that calls the API — so checkout is genuinely inert on the frontend. Good.

### Contact / support
- Email `nate@snafu.quest` in every commerce footer: `shop/index.html:364`, `shop/product.html:378`, `cart/index.html:198`, `goods/index.html` (mailto in colophon), `privacy/index.html:88`.
- `cart/index.html:277` directs buyers to email "about a piece in the meantime."
- **No support page, no response-time expectation, no phone/other channel.** Email only.

### Inventory availability / sold
- `js/shop-data.js` — availability field is **`sold` (boolean)**; all 20 pieces are `sold: false` (schema note `:28`; per-item at `:66, 98, 129, 159, 188, 218, 246, 275, 302, 330, 359, 388, 419, 449, 480, 510, 542, 569, 599, 627`).
- `shop/index.html:142–144, 397` — `.card.sold` dims the card and prefixes the price with `SOLD`.
- `shop/product.html:135–136, 430–431, 526–528` — `SOLD` price prefix; buy disabled + *"This piece is gone."* when `sold`.
- `cart/index.html:224–234` — one-of-one rule shown as *"ONE OF ONE / only one exists"*; origin tags *"SHOP — 1 OF 1"* / *"SNAFU ORIGINAL."*
- `js/cart.js:61–62` — *"Shop pieces are one-of-one. Goods are a production run."*
- Goods: `goods/index.html:39` empty state *"The hoard is quiet right now. The next drop will fill it."* (`js/goods-data.js` has g001–g003 but per PRODUCT-RELEASE-AUDIT their images are empty).

---

## 2. Missing, contradictory, misleading, or not-implemented

1. **CRITICAL BUG — the two checkout functions disagree on the availability field.**
   - `api/checkout.js:51` → `if (piece.sold === true) continue;` — **correct** (matches catalog's `sold`).
   - `netlify/functions/create-checkout-session.js:55` → `if (piece.status !== "AVAILABLE") continue;` — **wrong**: `shop-data.js` has no `status` field, so this skips **every** item and every checkout returns *"No purchasable items in cart."* If Netlify is the host, checkout is broken out of the gate.
2. **No returns/refund/damaged/lost policy exists at all.** You cannot take real payments for one-of-one goods without at least a stated position on "arrived not as described / damaged / lost in transit." This is the biggest content gap.
3. **"Shipping is calculated at checkout"** (`product.html:540`) is a promise with **no implementation** — no shipping rates, zones, or Stripe shipping options are configured anywhere. Either configure shipping or change the copy.
4. **No dispatch/handling time** is stated. `success.html:23` promises a "shipping note … directly" but no window (e.g. "ships in 3–5 business days").
5. **No shipping destinations** stated (US-only? international?). Undefined scope is a support headache.
6. **`success.html:22` hardcodes "Payment confirmed in test mode."** When real payments go live, a real buyer would be told their payment was a test. Must become conditional or be rewritten at go-live.
7. **Two checkout hosts both present** (Netlify function + Vercel `api/checkout.js`). Keeping both invites exactly the drift in (1). Pick one, delete the other (also flagged in LAUNCH-SPINE).
8. **No order recording / webhook / inventory reservation.** Even the *correct* Vercel function only creates a Checkout Session — nothing marks the item `sold`, records the order, or emails the buyer. A sale today would charge the card and leave the piece showing available.
9. **`success.html:34–38`** notes the Purchase pixel is browser-side only and the canonical event "should be sent server-side from a Stripe webhook … once STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set" — i.e. acknowledged-but-not-implemented.
10. **No sales-tax handling** anywhere (CA seller). Not decided or configured.

---

## 3. Launch policy decision sheet — real-world choices only Nate can make

Payments cannot responsibly activate until each of these has an answer:

1. **Shipping price model:** free (baked into price) · single flat rate · calculated by weight/zone. → and the **amount** if flat.
2. **Shipping destinations:** US-only at launch, or international too?
3. **Carrier + tracking:** USPS / UPS / other; is tracking always provided?
4. **Dispatch/handling time to promise:** e.g. "ships within 3–5 business days."
5. **Returns stance:** all sales final · or a return window (how many days, who pays return shipping, any restocking)? (One-of-one means a "replacement" is impossible — only refund.)
6. **Damaged / lost-in-transit policy:** how many days to report, and remedy (refund, since no replacement exists).
7. **Condition-dispute policy:** "arrived not as described" — how handled.
8. **Sales tax:** collect via Stripe Tax, or handle manually / include in price?
9. **Checkout host:** Netlify **or** Vercel (whichever actually deploys the site).
10. **Business identity for Stripe:** legal/business name, bank account, statement descriptor.
11. **Transactional email:** which provider sends order confirmations (Resend / Postmark / SMTP)?

---

## 4. Recommended simplest first-launch setup

*This is a recommendation, not a description of what's currently built.*

- **Shipping:** US-only, **single flat rate** (e.g. a fixed $8–12 tracked-shipping fee) set as one Stripe shipping option. Simplest to reason about; no zone math. (Free shipping is even simpler if you'd rather bury it in price.)
- **Dispatch:** promise **"ships within 3–5 business days,"** USPS with tracking.
- **Returns:** **all sales final** (fits one-of-one vintage), **with one exception**: if a piece arrives damaged or materially not as described, buyer emails within **5 days** and you resolve with a **refund** (no replacement possible). State this plainly.
- **Lost in transit:** tracked shipping; if tracking shows non-delivery, handled case-by-case by email — refund if unrecoverable.
- **Tax:** turn on **Stripe Tax** for CA rather than hand-calculating.
- **Contact:** email-only is fine for launch — but add a one-line expected response time.
- **Host:** use **Vercel `api/checkout.js`** as the single function (its `sold` check already matches the catalog) and delete the Netlify function — *unless the site actually deploys on Netlify*, in which case fix the Netlify function to use `sold` and delete the Vercel one. One host only.
- **The non-negotiable backend minimum before live keys:** Stripe **webhook** (verified signature) that records the order, marks the piece `sold: true`, and triggers the confirmation email. Without it, a sale charges the card but never removes the item or notifies anyone.

---

## 5. Work needed after Nate decides (code + content)

**Content (once policies are chosen):**
- Write and publish a short **Shipping & Returns** statement (own page or a section), covering: shipping price/destinations, dispatch time, returns stance, damaged/lost, disputes, contact + response time.
- Link it in every commerce footer and reference it in the product `claim-check` block.
- Reconcile the `product.html:540` "Shipping is calculated at checkout" line to match the chosen model.
- Rewrite `success.html:22` "test mode" copy for live.

**Code (still no live keys until tested):**
- Pick one host; **fix the availability check to `sold`** in the kept function; delete the other.
- Add the chosen **shipping option(s)** + `shipping_address_collection` to the Checkout Session.
- Enable **Stripe Tax** (if chosen).
- Build the **Stripe webhook**: verify signature → record order → atomically mark `sold: true` → send confirmation email (this is the droplet/DB + email-provider work).
- Move the Purchase pixel to the server-side webhook event.
- Establish an **env/secrets register** (keys only in host env vars, never in the repo).
- **Test end-to-end in Stripe test mode** across the full flow before switching to live keys.

---

*Audit only. Nothing here has been applied. Next step is yours: answer the decision sheet, then this becomes a work order.*
