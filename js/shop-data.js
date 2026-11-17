/* SNAFU shop data — the one place products live.
   Read by shop/, shop/product.html, shop/deals.html, cart/ and api/checkout.js.

   Fresh start (Nov 2026): the shop holds a small, tight set of pieces.
   Add one block per piece. Copy this template:

   {
     id: 'p101',                       // unique, used in the URL
     name: 'Velvet Blazer',            // what it is
     brand: 'Yohji Yamamoto',          // maker
     year: '1990s',                    // era
     size: 'M',
     measurements: { chest: 21, length: 29, sleeve: 25, shoulder: 18 },  // inches
     condition: 'Excellent. No flaws.',
     note: 'One line on why it matters.',
     price: 240,
     gender: 'mens',                   // 'mens' | 'womens' | 'unisex'
     cat: 'jackets',                   // 'tops' | 'bottoms' | 'jackets' | 'knits' | 'accessories'
     images: ['/assets/shop/p101-1.jpg', '/assets/shop/p101-2.jpg'],  // 3–5 photos, first = cover
     sold: false
   },

   Optional extras the product page also shows if present:
   material, color, closure, origin, authNote, originalPrice + deal:true.
*/
const SNAFU_SHOP = [
  {
    id: 'p021',
    sku: 'SNF-KNT-2607-005',
    name: 'Purple Stripe Mohair Sweater',
    brand: 'Vintage',
    year: '1990s',
    size: 'M',
    measurements: { chest: 21, length: 25, sleeve: 26, shoulder: 18 },
    material: 'Mohair blend',
    color: 'Purple, cream and gray stripe',
    closure: 'Pullover',
    condition: 'Very good. Mohair halo intact, no moth.',
    authNote: 'Hand-inspected. Mohair fiber confirmed by hand and halo. Original knit construction.',
    note: 'Warm and luminous — the sweater equivalent of morning light.',
    price: 180,
    gender: 'unisex',
    cat: 'knits',
    images: ['/assets/shop/p021-01.jpg', '/assets/shop/p021-02.jpg'],
    sold: false
  },
];

// Browser gets window.SNAFU_SHOP; Node (Vercel /api/checkout) gets module.exports.
if (typeof window !== 'undefined') {
  window.SNAFU_SHOP = SNAFU_SHOP;
  try { sessionStorage.removeItem('snafu.shop.catalog'); } catch (e) {}
}
if (typeof module !== 'undefined' && module.exports) module.exports = SNAFU_SHOP;
