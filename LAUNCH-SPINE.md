# SNAFU Launch Spine

This is the operating roadmap for turning the existing SNAFU world into a
small, sharp, trustworthy media-commerce business. It is a sequencing document,
not a request to build every idea at once.

## The operating proposition

**SNAFU is a hand-filed hub for rare clothing, cultural signal, and objects that
earned their place.**

The site should make three promises on every visit:

1. A human chose what appears here and can say why.
2. The record around an object is as considered as the object itself.
3. If a visitor claims something, the transaction is dependable.

## What exists now

### Brand and public experience — complete foundation

- [x] Live domain: `snafu.quest` and public static site.
- [x] Distinct pixel-world identity: boot beat, clearing, forest/cave scenes,
  CRT mode, a persistent SNAFU wordmark, and section-specific worlds.
- [x] Core public routes: Home, News, Gallery, Shop, Goods, Play, About,
  Account, Privacy, Cart, Checkout success/cancel, and Admin.
- [x] Homepage now states the cultural and commerce premise in addition to the
  dictionary definition, with a direct route to the current market.
- [x] Shared account layer, saved/starred objects, new-since-last-visit badges,
  and Meta pixel events are present in the frontend.
- [x] A generated content manifest exists for return-visit badges; it currently
  tracks one published item, so the editorial system is a foundation rather
  than yet a deep publishing library.

### Commerce presentation — strong, still pre-launch

- [x] Product catalog in `js/shop-data.js`: SKU, price, tier/deal state,
  category, size, measurements, material, color, condition, authentication
  note, editorial note, images, and sold state.
- [x] Current Shop release data contains 20 available pieces: 16 Deals and 4
  mainline pieces. All 20 include measurements and at least one image.
- [x] Goods has a separate three-item Drop 001 data set with sizing and edition
  metadata; its image fields are still empty, so it is not release-complete.
- [x] Shop filters, market/deals views, product detail pages, related pieces,
  Pack/cart UI, and buy/add-to-pack actions.
- [x] Shop and Goods now share one cart key, item shape, resolver, and neutral
  `/cart/` destination; legacy carts migrate forward once.
- [x] Purchasing is intentionally disabled and visibly marked "CHECKOUT OPENING
  SOON." No customer can currently be charged or reserve an item.
- [x] Product pages now include a buyer-confidence checkpoint before a claim.
- [x] Stripe Checkout function scaffolding exists for Netlify and Vercel. Both
  build line items from the server-side catalog rather than trusting a browser
  price.
- [ ] Stripe is **not live-ready**: choose one deployment path, add a verified
  webhook, record orders, atomically reserve/mark sold inventory, send customer
  email, and create a fulfillment view before accepting real payments.
- [ ] Current checkout paths and catalog state conventions need a single audit:
  the Netlify function checks `status === "AVAILABLE"`, while the catalog and
  Vercel function use `sold`. Do not enable live keys until this is reconciled.
- [ ] Product photos need a release standard: front, back, label, construction,
  flaw/condition proof, and one styling/context frame where appropriate.

### Accounts and community — implemented frontend, backend contract to verify

- [x] Account signup/login/profile client layer talks to `api.snafu.quest` with
  credentialed HTTP-only cookie sessions.
- [x] Field Notes discussion desk, threads, comments, upvotes, reports,
  moderation/admin shell, and a privacy page exist in the frontend.
- [x] Play includes a leaderboard backed by the API.
- [ ] Confirm the DigitalOcean deployment source, database migrations, backups,
  uptime checks, rate limiting, email verification/password reset, CORS/cookie
  settings, admin authorization, and moderation retention. The frontend repo
  contains API clients; it does not establish that the server operations are
  production-ready.

### Engineering and deployment — capable, needs consolidation

- [x] Git repository, recent staged development history, static HTML/CSS/vanilla
  JS structure, local fonts/assets, content manifest generator, and Netlify
  configuration.
- [x] Separation of a static public site and stateful `api.snafu.quest` is a
  sensible long-term shape.
- [ ] Select **Netlify or Vercel** as the one commerce-function host. Keeping
  both checkout implementations invites drift.
- [ ] Add automated checks for key pages, mobile/desktop visual QA, broken links,
  carts, checkout handoff, and API health.
- [ ] Establish an environment/secrets register: owner, location, rotation plan,
  and which service uses each secret. Never put a secret in this repo.

## Product-detail standard

Every published Shop piece must have:

1. SKU, price, tier, sold/available state, and real first image.
2. Tagged size plus garment measurements in inches.
3. Material, construction/closure, color, origin/era when known.
4. Plain-language condition, including flaws—not vague “great vintage.”
5. Authentication/provenance note appropriate to the claim being made.
6. A single SNAFU editorial line: why this object earned its place.
7. Minimum photo set: front, back, label, detail/construction, condition proof.
8. Clear pre-claim information: one-of-one status, cleaning/readiness, fit
   responsibility, shipping timing/cost policy, and returns policy once set.

## Commerce operating map

```text
SOURCE / INTAKE
  -> photograph + measure + condition/authentication review
  -> product record drafted, human-approved, published

CUSTOMER CLAIM
  -> Pack/cart -> server validates catalog + availability
  -> Stripe Checkout -> Stripe webhook (verified signature)
  -> order recorded + item reserved/sold atomically
  -> receipt + fulfillment notification

FULFILLMENT
  -> pack / ship / tracking sent
  -> order state updated
  -> customer support, return/refund handling if policy allows
```

The DigitalOcean API should own durable state: users, sessions, forum data,
orders, inventory state, Stripe webhook events, moderation, and audit logs.
The static site should stay fast and simple; Stripe should process payment;
transactional email and image storage can remain specialist services.

## Build order

### Sprint 1 — Launch Spine (now)

- [x] Put the proposition and direct Shop route on the home screen.
- [x] Add a clear buyer-confidence block to product pages.
- [x] Audit the current catalog; see `PRODUCT-RELEASE-AUDIT.md` for the exact
  photo and first-release queue.
- [ ] Verify product data against the product-detail standard; fill the missing
  photo/provenance data for the first release set.
- [ ] Audit all checkout code without using live credentials; select its one host
  and write the canonical inventory-state contract.

### Sprint 2 — Transaction reliability

- [ ] Implement test-mode checkout against the selected host.
- [ ] Implement and test verified Stripe webhook/order/inventory handling.
- [ ] Build the smallest useful order/fulfillment admin view.
- [ ] Publish shipping, returns, privacy, and contact policies that match reality.

### Sprint 3 — Attention and return loops

- [ ] Publish a repeatable editorial rhythm: one dispatch, one object signal,
  one field question, and one commerce/drop moment per cycle.
- [ ] Add structured metadata, sitemap, social sharing images, analytics events,
  and performance/accessibility checks.
- [ ] Invite a small first community; moderate Field Notes as an editorial desk,
  not an unbounded forum.

### Sprint 4 — Scale only after proof

- [ ] Build an internal intake desk that turns garment photos and notes into a
  draft product record for human approval.
- [ ] Add saved-object alerts, drop notification preferences, and editorial
  collection pages.
- [ ] Only add deeper search, recommendation, marketplace, or broad community
  features when inventory, content cadence, and returning users justify them.
