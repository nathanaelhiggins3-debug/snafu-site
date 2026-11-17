/* SNAFU shop data — the one place products live.
   Read by shop/, shop/product.html, shop/deals.html, cart/ and api/checkout.js.

   Fresh start (Nov 2026): the shop holds a small, tight set of pieces.
   Add one block per piece. Copy this template:

   {
     id: 'p101',                       // unique, used in the URL
     name: 'Yohji Yamamoto Velvet Blazer',  // brand first, then the piece
     brand: 'Yohji Yamamoto',          // maker
     year: '1990s',                    // era
     size: 'M',
     measurements: { chest: 21, length: 29, sleeve: 25, shoulder: 18 },  // inches
     condition: 'Excellent. No flaws.',
     note: 'One line on why it matters.',
     price: 240,
     gender: 'mens',                   // 'mens' | 'womens' | 'unisex'
     cat: 'jackets',                   // 'tops' | 'bottoms' | 'jackets' | 'knits' | 'accessories'
     cutouts: ['/assets/shop/p101-cut-front.webp'],  // background-removed main shots (Claude makes these)
     images: ['/assets/shop/p101-label.jpg'],         // detail shots: labels, tags, texture
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
    id: 'p022',
    sku: 'SNF-HDY-2611-001',
    name: 'GOA Double-Zip Hoodie',
    brand: 'GOA',
    year: '2000s',
    size: 'Fits slim S men\'s / XS (tagged F)',
    measurements: { 'pit to pit': 17.5, length: 23, sleeve: 23 },  // inches, flat; sleeve from underarm
    material: '100% cotton, heavyweight loopback',
    color: 'Faded beige-gray',
    closure: 'Double-zip front',
    origin: 'Japan',
    condition: 'True used condition. Broken in, with the fade original to the piece. No major flaws.',
    authNote: 'Signature GOA interior wash-instruction label intact. Original Japanese care tag.',
    note: 'The finish is the point: a sun-faded over-dye that settled into the body and sleeves on its own. Raglan sleeves, ribbed cuffs and hem, two zips. Early-2000s Japan, worn the way it was meant to be.',
    price: 150,
    gender: 'mens',
    cat: 'tops',
    cutouts: ['/assets/shop/p022-cut-front.webp', '/assets/shop/p022-cut-back.webp'],
    images: [
      '/assets/shop/p022-label.jpg',
      '/assets/shop/p022-collar.jpg',
      '/assets/shop/p022-hanging.jpg',
      '/assets/shop/p022-tag.jpg'
    ],
    paymentLink: 'https://buy.stripe.com/6oUaEYacy9On2Mc6dZ3sI01',  // plink_1UctW9LwaRjGaOhuALjRsg56 — limit 1 sale
    added: '2026-11-17',
    sold: false
  },
  {
    id: 'p021',
    sku: 'SNF-KNT-2607-005',
    name: 'beauty:beast Mohair Sweater',
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
    // cutouts: background-removed shots (front, back) shown clean on the page
    cutouts: ['/assets/shop/p021-cut-front.webp', '/assets/shop/p021-cut-back.webp'],
    images: [
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
