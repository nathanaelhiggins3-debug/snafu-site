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
