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
     paymentLink: 'https://buy.stripe.com/...',  // Stripe Payment Link, limited to 1 sale
     added: '2026-11-16',             // date listed — drives "last added" on the shop
     sold: false
   },

   When a piece sells: set sold: true (and deactivate its Stripe link).

   Optional extras the product page also shows if present:
   material, color, closure, origin, authNote, originalPrice + deal:true.
*/
const SNAFU_SHOP = [
  {
    id: 'p021',
    sku: 'SNF-KNT-2607-005',
    name: 'Striped Mohair Sweater',
    brand: 'beauty:beast',
    year: '20+ years old',
    size: 'M (tagged 3 / L, Japanese sizing)',
    measurements: { chest: 22.5, length: 24, sleeve: 26.5, shoulder: 17.5 },  // inches, flat
    measurementsCm: { chest: 57, length: 61, sleeve: 67, shoulder: 44.5 },
    material: '55% mohair, 15% wool, 30% nylon',
    color: 'Lavender, cream, gray and charcoal stripe',
    closure: 'Pullover',
    origin: 'Made in Japan',
    condition: 'Good used condition. No noticeable flaws or stains.',
    authNote: 'Original beauty:beast neck label and Japanese care tag present. Made in Japan.',
    note: 'Rare beauty:beast knit from over two decades ago. Loose mohair gauge, soft halo, colour-blocked stripes front to back.',
    price: 200,
    gender: 'unisex',
    cat: 'knits',
    images: [
      '/assets/shop/p021-1-front.jpg',
      '/assets/shop/p021-2-back.jpg',
      '/assets/shop/p021-3-label.jpg',
      '/assets/shop/p021-4-tag.jpg',
      '/assets/shop/p021-5-texture.jpg'
    ],
    paymentLink: 'https://buy.stripe.com/aFaaEYesO6Cb5Yoauf3sI00',  // plink_1Ucs9VLwaRjGaOhuKfRDi7t4 — limit 1 sale
    added: '2026-11-16',
    sold: false
  },
];

// Browser gets window.SNAFU_SHOP; Node (Vercel /api/checkout) gets module.exports.
if (typeof window !== 'undefined') {
  window.SNAFU_SHOP = SNAFU_SHOP;
  try { sessionStorage.removeItem('snafu.shop.catalog'); } catch (e) {}
}
if (typeof module !== 'undefined' && module.exports) module.exports = SNAFU_SHOP;
