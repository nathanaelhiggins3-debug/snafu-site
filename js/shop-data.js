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
     stripePrice: 'price_...',        // Stripe Price id (used by the bag checkout)
     paymentLinkId: 'plink_...',      // Stripe Payment Link id (the piece's sold lock)
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
    id: 'p025',
    sku: 'SNF-TEE-2611-002',
    name: '1991 Gulf War \u201cThat\u2019s All Folks\u201d Tee',
    brand: 'Newstar California (blank)',
    year: 'c. 1991',
    size: 'L',
    material: '100% cotton',
    color: 'Natural white; black and red-pink print',
    closure: 'Crewneck, single-stitch sleeves and hem',
    origin: 'Made in Dominican Republic',
    condition: 'Worn vintage with light overall age. Small hole/snag near the bottom hem, shown in the photos. Sold as is.',
    authNote: 'Original Newstar California neck tag: 100% cotton, made in Dominican Republic. Single-stitch sleeves and hem.',
    note: 'Iraq invaded Kuwait on August 2, 1990. The UN gave Iraq until January 15, 1991 to withdraw. The air war began January 17, and a ceasefire followed on February 28, after 42 days. CNN carried the first night live from Baghdad, and screen printers moved just as fast: one Maryland shop had Desert Storm shirts on press the night after the bombing started. This one is the parody kind. A hand-drawn map of the region, Kuwait underlined, an IRAQ signpost over a smoking crater, a mushroom cloud above it, and the Looney Tunes sign-off underneath. No nuclear weapon was used in the war; the cloud is the cartoon\u2019s punchline.',
    price: 75,
    gender: 'mens',
    cat: 'tops',
    cutouts: ['/assets/shop/p025-cut-front.webp', '/assets/shop/p025-cut-back.webp'],
    images: [
      '/assets/shop/p025-graphic.jpg',
      '/assets/shop/p025-tag.jpg',
      '/assets/shop/p025-sleeve.jpg',
      '/assets/shop/p025-front-hanging.jpg'
    ],
    stripePrice: 'price_1UdamuLwaRjGaOhuIlmuLJST',
    paymentLinkId: 'plink_1Udan1LwaRjGaOhuJCnVImnd',
    paymentLink: 'https://buy.stripe.com/bJe28s84q4u386w31N3sI04',
    added: '2026-11-19',
    sold: false
  },
  {
    id: 'p024',
    sku: 'SNF-TEE-2611-001',
    name: 'Bess NYC Snake Tee',
    brand: 'Bess NYC',
    year: 'c. 2008\u201315',
    size: 'Fits S (tagged 1)',
    material: 'Cotton jersey (no content tag)',
    color: 'Faded navy, white print',
    closure: 'Pullover, raw scoop neck',
    origin: 'New York',
    condition: 'Distressed as made. The holes, open armhole, raw neck and cracked print are how Bess finished these, now with real age on top. Sold as is: look through every photo.',
    authNote: 'Original Bess script print at the neck with the care line (wash cold, no bleach, no tumble dry) and size 1.',
    note: 'Bess was Doug Abraham\u2019s store and label, named for his wife and started as jewelry in 2000. In 2006 it moved into 292 Lafayette Street in SoHo, the room where Keith Haring ran the Pop Shop until it closed in 2005. Clothing followed, and Barneys picked it up. Abraham later became @bessnyc4, the collage account that cut fashion campaigns into horror and bondage, and a 2014 CFDA Instagrammer of the Year nominee. The store closed in 2015. This tee is the label at its most itself: a snake coiled around a striped egg, printed on navy that was wrecked before it was ever sold.',
    price: 300,
    gender: 'mens',
    cat: 'tops',
    cutouts: ['/assets/shop/p024-cut-front.webp', '/assets/shop/p024-cut-back.webp'],
    images: [
      '/assets/shop/p024-print.jpg',
      '/assets/shop/p024-tag.jpg',
      '/assets/shop/p024-armhole.jpg',
      '/assets/shop/p024-shoulder.jpg',
      '/assets/shop/p024-hem.jpg'
    ],
    stripePrice: 'price_1UcyScLwaRjGaOhu82bgYY2b',
    paymentLinkId: 'plink_1UcySoLwaRjGaOhuEhN1JsqI',
    paymentLink: 'https://buy.stripe.com/3cI28s98u7Gf72sgSD3sI03',
    added: '2026-11-17',
    sold: false
  },
  {
    id: 'p023',
    sku: 'SNF-SHT-2611-001',
    name: 'RRL Striped Dobby Shirt',
    brand: 'RRL',
    year: '2010s\u201320s',
    size: 'M (slim fit)',
    material: '100% cotton dobby',
    color: 'Ecru with blue and charcoal stripes',
    closure: 'Button front, chest pocket',
    origin: 'Made in India',
    condition: 'Clean pre-owned condition. No stains or holes found. Shown unpressed.',
    authNote: 'Full RRL label set: woven RRL & Co. Quality Shirtings neck label, Mr. Double RL Supply Co. New York placket label, and the Double RL Supply Co. stamp printed inside the collar band.',
    note: 'Ralph Lauren started RRL in 1993 and named it for the Double RL, the Colorado ranch he shares with his wife Ricky. The line rebuilds old workwear and shirting from the archive, and this is that idea in a dress shirt: a woven stripe in the spirit of an antique swatch, a shirred back yoke and a straight pocket. The neck label borrows the look of an old shirtmaker\u2019s union tag, crossed arrows and all. It\u2019s a nod, not a real union mark. The labels place it in RRL\u2019s modern dress-shirt run rather than the \u201990s, the same family as the striped dobby shirts that sold new for around $250.',
    price: 175,
    gender: 'mens',
    cat: 'tops',
    cutouts: ['/assets/shop/p023-cut-front.webp', '/assets/shop/p023-cut-back.webp'],
    images: [
      '/assets/shop/p023-label.jpg',
      '/assets/shop/p023-placket-label.jpg',
      '/assets/shop/p023-collar.jpg',
      '/assets/shop/p023-hanging.jpg',
      '/assets/shop/p023-front-open.jpg'
    ],
    stripePrice: 'price_1UcySaLwaRjGaOhuyhX7mRVA',
    paymentLinkId: 'plink_1UcySjLwaRjGaOhuIyPPRas3',
    paymentLink: 'https://buy.stripe.com/28EfZi98u9On1I8gSD3sI02',
    added: '2026-11-17',
    sold: false
  },
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
    stripePrice: 'price_1UctW2LwaRjGaOhuR9HAdDw1',
    paymentLinkId: 'plink_1UctW9LwaRjGaOhuALjRsg56',
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
    stripePrice: 'price_1Ucs4aLwaRjGaOhuIcX90vqZ',
    paymentLinkId: 'plink_1Ucs9VLwaRjGaOhuKfRDi7t4',
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
