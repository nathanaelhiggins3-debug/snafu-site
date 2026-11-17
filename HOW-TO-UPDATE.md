# How to update snafu.quest

| What | Where | How |
|---|---|---|
| Gallery post | Phone → snafu.quest/desk/ | Add photos, caption, Post. Edit, reorder or delete from the same page. Live instantly. |
| Shop piece | `js/shop-data.js` + photos in `assets/shop/` | Copy the template block at the top of the file, fill it in, push. |
| Goods (SNAFU objects) | `js/goods-data.js` | Same as Shop. |
| Editorial | `news/editorial/<slug>/index.html` | Write in the template. To publish, move its card out of the DRAFTS comment in `news/editorial/index.html`. |

Rules
- Nothing half-written goes public. Drafts stay unlisted and noindexed until they are done.
- Empty fields never show. Leave a field blank rather than writing a placeholder.
- Desk setup (password, storage) is in `DESK-SETUP.md`.

| Menu (every page) | `js/site.js` → `LINKS` | Add or remove a section in one place. Goods returns here once Drop 001 is real. |
| News list | `news/index.html` → `.pieces` | Add a new `<a class="piece">` at the top when a piece publishes. |
| Home "Latest" | automatic | Shows the 3 newest Gallery posts and the first unsold shop piece. Update the dispatch row in `index.html` when you publish. |

## Selling a piece (Stripe Payment Links)
1. Stripe → Payment Links → New. Product = piece name, price, 1–3 photos.
2. Options: turn on **Limit the number of payments → 1**, **Collect customers' addresses → Shipping**, add your shipping rate.
3. After payment → Redirect to `https://snafu.quest/checkout/success.html`.
4. Copy the link into the piece's `paymentLink` in `js/shop-data.js`. The button becomes BUY NOW.
5. When it sells: set `sold: true` and deactivate the link in Stripe.

## Email list
Sign-ups from the "Get first look" strip are stored in Vercel Blob. While signed in to the Desk, open `/api/subscribe` to see them.
