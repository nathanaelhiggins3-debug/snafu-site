/* SNAFU shop data.
   One source of truth. Read by shop/index.html, shop/deals.html,
   shop/product.html, shop/cart.html, and api/checkout.js (Node).

   ── FULL SCHEMA (per brief) ────────────────────────────────────
   id             'p001'                     internal id, used in URL
   sku            'SNF-JKT-2607-002'         SNAFU inventory SKU
   name           'Beige Linen Blazer'       display name
   brand          'Vintage'                  brand/maker
   year           '2000s'                    era
   origin         'unknown'                  country
   price          32                         what buyer pays (deal price if deal)
   originalPrice  65                         DEAL ONLY: shown struck-through
   deal           true                       DEAL ONLY: orange border + deals page
   gender         'mens'|'womens'|'unisex'
   cat            'tops'|'jackets'|'knits'|'bottoms'|'accessories'
   size           'M'                        tagged size
   measurements   { chest, length, sleeve, shoulder }  inches
   material       'Linen blend'
   color          'Beige heather'
   closure        'Button front'
   condition      'Very good, minor fray at cuffs.'
   authNote       'Original construction, no repro flags.'
   note           'The SNAFU line — one editorial sentence.'
   coverImage     ''                         mainline: 16-bit pixel cover path
   images         ['/assets/deals/xxx.jpg']  real photos (hero + scroll)
   alsoListedOn   []                         [{platform, url}, ...]
   sold           false

   For deals: coverImage stays '' (deals don't get 16-bit covers — only
   mainline items do). The card + product page hero pull from images[0].

   Every field except id, name, price, cat, gender is optional — product.html
   renders whatever's present, skips what isn't.
*/
const SNAFU_SHOP = [

  // ── DEALS: JACKETS ──────────────────────────────────────────
  {
    id: 'p001',
    sku: 'SNF-JKT-2607-002',
    name: 'Beige Linen Blazer',
    brand: 'Vintage',
    price: 42,
    originalPrice: 65,
    deal: true,
    gender: 'womens',
    cat: 'jackets',
    year: '2000s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 24, sleeve: 24, shoulder: 16 },
    material: 'Linen blend',
    color: 'Beige heather',
    closure: 'Button front',
    condition: 'Very good. Minor fray at cuff edges — the good kind.',
    authNote: 'Hand-inspected. Original construction, no repro flags.',
    note: 'A blazer that looks like it already knows the room.',
    coverImage: '',
    images: [
      '/assets/deals/snf-jkt-2607-002_real_01.jpg',
      '/assets/deals/snf-jkt-2607-002_real_02.jpg',
      '/assets/deals/snf-jkt-2607-002_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p002',
    sku: 'SNF-JKT-2607-003',
    name: 'Rust Polka-Dot Fitted Blazer',
    brand: '1t',
    price: 65,
    originalPrice: 110,
    deal: true,
    gender: 'womens',
    cat: 'jackets',
    year: '2010s',
    origin: 'unknown',
    size: 'S',
    measurements: { chest: 18, length: 22, sleeve: 24, shoulder: 15 },
    material: 'Cotton blend',
    color: 'Rust with charcoal dots',
    closure: 'Two-button front',
    condition: 'Excellent. Tailoring intact, lining clean.',
    authNote: '1t label present. Structured lining and shoulder construction original.',
    note: 'The label reads "Random Imperfections Are Symptoms Of Life." Then it made this jacket.',
    coverImage: '',
    images: [
      '/assets/deals/snf-jkt-2607-003_real_01.jpg',
      '/assets/deals/snf-jkt-2607-003_real_02.jpg',
      '/assets/deals/snf-jkt-2607-003_real_03.jpg',
      '/assets/deals/snf-jkt-2607-003_real_04.jpg',
      '/assets/deals/snf-jkt-2607-003_real_05.jpg',
      '/assets/deals/snf-jkt-2607-003_real_06.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p003',
    sku: 'SNF-JKT-2607-004',
    name: 'Black Asymmetric-Zip Leather Jacket',
    brand: 'Vintage',
    price: 75,
    originalPrice: 135,
    deal: true,
    gender: 'womens',
    cat: 'jackets',
    year: '2010s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 23, sleeve: 25, shoulder: 16 },
    material: 'Leather',
    color: 'Black',
    closure: 'Asymmetric YKK zip',
    condition: 'Very good. Supple leather, no cracks or peeling.',
    authNote: 'Real leather confirmed. Original YKK hardware, lining intact.',
    note: 'Cut for movement. Priced like you\'ll actually wear it.',
    coverImage: '',
    images: [
      '/assets/deals/snf-jkt-2607-004_real_01.jpg',
      '/assets/deals/snf-jkt-2607-004_real_02.jpg',
      '/assets/deals/snf-jkt-2607-004_real_03.jpg',
      '/assets/deals/snf-jkt-2607-004_real_04.jpg',
      '/assets/deals/snf-jkt-2607-004_real_05.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p004',
    sku: 'SNF-JKT-2607-005',
    name: 'Mauve Tweed Cropped Blazer',
    brand: 'Vintage',
    price: 52,
    originalPrice: 85,
    deal: true,
    gender: 'womens',
    cat: 'jackets',
    year: '2000s',
    origin: 'unknown',
    size: 'S',
    measurements: { chest: 19, length: 21, sleeve: 24, shoulder: 15 },
    material: 'Wool tweed',
    color: 'Mauve heather',
    closure: 'One-button front',
    condition: 'Very good. Cropped fit holds shape.',
    authNote: 'Hand-inspected. Original lining and lapel construction.',
    note: 'A blazer for the version of you that shows up on time.',
    coverImage: '',
    images: [
      '/assets/deals/snf-jkt-2607-005_real_01.jpg',
      '/assets/deals/snf-jkt-2607-005_real_02.jpg',
      '/assets/deals/snf-jkt-2607-005_real_03.jpg',
      '/assets/deals/snf-jkt-2607-005_real_04.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p005',
    sku: 'SNF-JKT-2607-006',
    name: 'Bronze Metallic Leather Moto',
    brand: 'Vintage',
    price: 68,
    originalPrice: 115,
    deal: true,
    gender: 'womens',
    cat: 'jackets',
    year: '2010s',
    origin: 'unknown',
    size: 'S',
    measurements: { chest: 18, length: 22, sleeve: 25, shoulder: 15 },
    material: 'Metallic leather',
    color: 'Bronze / gold',
    closure: 'Center zip',
    condition: 'Very good. Metallic finish intact, no flaking.',
    authNote: 'Real leather confirmed. Metallic coating original, not repainted.',
    note: 'For when you want to be found.',
    coverImage: '',
    images: [
      '/assets/deals/snf-jkt-2607-006_real_01.jpg',
      '/assets/deals/snf-jkt-2607-006_real_02.jpg',
      '/assets/deals/snf-jkt-2607-006_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },

  // ── DEALS: TOPS ─────────────────────────────────────────────
  {
    id: 'p006',
    sku: 'SNF-TOP-2607-001',
    name: 'Chuck E. Cheese Graphic Tee',
    brand: 'Chuck E. Cheese',
    price: 32,
    originalPrice: 40,
    deal: true,
    gender: 'unisex',
    cat: 'tops',
    year: '2000s',
    origin: 'USA',
    size: 'M',
    measurements: { chest: 20, length: 28, sleeve: 8, shoulder: 17 },
    material: 'Cotton jersey',
    color: 'Kelly green',
    closure: 'Pullover',
    condition: 'Very good. Broken-in cotton hand, print sharp.',
    authNote: 'Hand-inspected. Original print, single-stitch hem intact.',
    note: 'Where a kid can be a kid. Or you.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-001_real_01.jpg',
      '/assets/deals/snf-top-2607-001_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p007',
    sku: 'SNF-TOP-2607-002',
    name: 'Fendi Monster-Eyes Polo',
    brand: 'Fendi',
    price: 58,
    originalPrice: 95,
    deal: true,
    gender: 'mens',
    cat: 'tops',
    year: '2010s',
    origin: 'Italy',
    size: 'M',
    measurements: { chest: 20, length: 27, sleeve: 9, shoulder: 17 },
    material: 'Cotton piqué',
    color: 'Navy',
    closure: 'Button placket',
    condition: 'Very good. Collar print sharp, no pilling.',
    authNote: 'Fendi branding on inner collar, monster-eyes print verified.',
    note: 'A polo that stares back.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-002_real_01.jpg',
      '/assets/deals/snf-top-2607-002_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p008',
    sku: 'SNF-TOP-2607-003',
    name: 'Cream Floral Open-Front Blouse',
    brand: 'Vintage',
    price: 38,
    originalPrice: 55,
    deal: true,
    gender: 'womens',
    cat: 'tops',
    year: '1980s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 22, sleeve: 23, shoulder: 15 },
    material: 'Rayon',
    color: 'Cream with purple abstract print',
    closure: 'Hook & eye front',
    condition: 'Very good. Vintage drape intact.',
    authNote: 'Hand-inspected. Original construction and print.',
    note: 'A print that keeps happening.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-003_real_01.jpg',
      '/assets/deals/snf-top-2607-003_real_02.jpg',
      '/assets/deals/snf-top-2607-003_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p009',
    sku: 'SNF-TOP-2607-004',
    name: 'Blue-Gray Button Henley',
    brand: 'Vintage',
    price: 34,
    originalPrice: 45,
    deal: true,
    gender: 'mens',
    cat: 'tops',
    year: '2000s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 27, sleeve: 25, shoulder: 17 },
    material: 'Cotton knit',
    color: 'Muted blue-gray',
    closure: 'Button placket',
    condition: 'Very good. Buttons all present.',
    authNote: 'Hand-inspected. Original construction, no repro flags.',
    note: 'Long sleeve, short opinions.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-004_real_01.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p010',
    sku: 'SNF-TOP-2607-005',
    name: 'Pink Stripe Rugby Polo',
    brand: 'Vintage',
    price: 36,
    originalPrice: 50,
    deal: true,
    gender: 'womens',
    cat: 'tops',
    year: '2000s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 24, sleeve: 24, shoulder: 16 },
    material: 'Cotton jersey',
    color: 'Magenta and white stripe',
    closure: 'Button placket',
    condition: 'Very good. Bold stripes still saturated.',
    authNote: 'Hand-inspected. Original construction.',
    note: 'Ready for a boat you don\'t own.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-005_real_01.jpg',
      '/assets/deals/snf-top-2607-005_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p011',
    sku: 'SNF-TOP-2607-006',
    name: 'American Studies 2005-2006 Fishbowl Tee',
    brand: 'Vintage',
    price: 35,
    originalPrice: 48,
    deal: true,
    gender: 'unisex',
    cat: 'tops',
    year: '2005',
    origin: 'USA',
    size: 'M',
    measurements: { chest: 20, length: 28, sleeve: 8, shoulder: 17 },
    material: 'Cotton',
    color: 'Faded black',
    closure: 'Pullover',
    condition: 'Very good. Faded to the right point.',
    authNote: 'Original print. Handmade-look line art, dated on garment.',
    note: 'A class you don\'t remember taking.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-006_real_01.jpg',
      '/assets/deals/snf-top-2607-006_real_02.jpg',
      '/assets/deals/snf-top-2607-006_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p012',
    sku: 'SNF-TOP-2607-007',
    name: 'Dark Gray Silk Button-Up',
    brand: 'Vintage',
    price: 40,
    originalPrice: 62,
    deal: true,
    gender: 'mens',
    cat: 'tops',
    year: '1990s',
    origin: 'unknown',
    size: 'L',
    measurements: { chest: 22, length: 30, sleeve: 25, shoulder: 18 },
    material: 'Silk',
    color: 'Charcoal gray',
    closure: 'Button front',
    condition: 'Very good. Silk hand confirmed.',
    authNote: 'Silk hand and drape verified. Original buttons.',
    note: 'A shirt for talking quieter.',
    coverImage: '',
    images: [
      '/assets/deals/snf-top-2607-007_real_01.jpg',
      '/assets/deals/snf-top-2607-007_real_02.jpg',
      '/assets/deals/snf-top-2607-007_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },

  // ── DEALS: KNITS ────────────────────────────────────────────
  {
    id: 'p013',
    sku: 'SNF-KNT-2607-001',
    name: 'Sky Blue Cashmere V-Neck',
    brand: 'Vintage',
    price: 44,
    originalPrice: 70,
    deal: true,
    gender: 'unisex',
    cat: 'knits',
    year: '1990s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 25, sleeve: 24, shoulder: 16 },
    material: 'Cashmere blend',
    color: 'Sky blue',
    closure: 'Pullover',
    condition: 'Very good. Soft hand, no moth or pilling.',
    authNote: 'Hand-inspected. Cashmere hand confirmed.',
    note: 'The color of a good afternoon.',
    coverImage: '',
    images: [
      '/assets/deals/snf-knt-2607-001_real_01.jpg',
      '/assets/deals/snf-knt-2607-001_real_02.jpg',
      '/assets/deals/snf-knt-2607-001_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p014',
    sku: 'SNF-KNT-2607-002',
    name: 'Rust Knit Raglan Crewneck',
    brand: 'Vintage',
    price: 40,
    originalPrice: 60,
    deal: true,
    gender: 'unisex',
    cat: 'knits',
    year: '1990s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 21, length: 25, sleeve: 26, shoulder: 17 },
    material: 'Wool blend',
    color: 'Rust orange',
    closure: 'Pullover',
    condition: 'Very good. Warm hand, no fade.',
    authNote: 'Hand-inspected. Original ribbing intact.',
    note: 'Not the loud kind of orange. The one that means fall.',
    coverImage: '',
    images: [
      '/assets/deals/snf-knt-2607-002_real_01.jpg',
      '/assets/deals/snf-knt-2607-002_real_02.jpg',
      '/assets/deals/snf-knt-2607-002_real_03.jpg',
      '/assets/deals/snf-knt-2607-002_real_04.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p015',
    sku: 'SNF-KNT-2607-003',
    name: 'Gray Color-Block Cowl Sweater',
    brand: 'Vintage',
    price: 46,
    originalPrice: 72,
    deal: true,
    gender: 'womens',
    cat: 'knits',
    year: '2000s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 21, length: 24, sleeve: 22, shoulder: 17 },
    material: 'Wool blend',
    color: 'Two-tone gray',
    closure: 'Pullover, cowl neck with hood',
    condition: 'Very good. Structured drape.',
    authNote: 'Hand-inspected. Original knit construction.',
    note: 'Architectural without saying anything.',
    coverImage: '',
    images: [
      '/assets/deals/snf-knt-2607-003_real_01.jpg',
      '/assets/deals/snf-knt-2607-003_real_02.jpg',
      '/assets/deals/snf-knt-2607-003_real_03.jpg',
      '/assets/deals/snf-knt-2607-003_real_04.jpg',
      '/assets/deals/snf-knt-2607-003_real_05.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p016',
    sku: 'SNF-KNT-2607-004',
    name: 'Puma Retro Cream Side-Stripe Sweater',
    brand: 'Puma',
    price: 42,
    originalPrice: 65,
    deal: true,
    gender: 'unisex',
    cat: 'knits',
    year: '2000s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 20, length: 25, sleeve: 25, shoulder: 17 },
    material: 'Cotton knit',
    color: 'Cream with red and gray side stripe',
    closure: 'Pullover crewneck',
    condition: 'Very good. Puma logo embroidered, no fade.',
    authNote: 'Puma cat logo embroidered, side stripe original panel construction.',
    note: 'Track-day pullover for people who never track.',
    coverImage: '',
    images: [
      '/assets/deals/snf-knt-2607-004_real_01.jpg',
      '/assets/deals/snf-knt-2607-004_real_02.jpg',
      '/assets/deals/snf-knt-2607-004_real_03.jpg',
      '/assets/deals/snf-knt-2607-004_real_04.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },

  // ── MAINLINE: JACKETS ───────────────────────────────────────
  // Regular-priced premium archive pieces. coverImage will point at the
  // 16-bit pixel cover once Nate runs it through Retro Diffusion. Until
  // then, the card + product hero fall back to the first real photo.
  {
    id: 'p017',
    sku: 'SNF-JKT-2607-007',
    name: 'JPG Jean Paul Gaultier Denim Jacket',
    brand: 'Jean Paul Gaultier',
    price: 340,
    deal: false,
    gender: 'unisex',
    cat: 'jackets',
    year: '1990s',
    origin: 'France',
    size: 'M',
    measurements: { chest: 21, length: 22, sleeve: 25, shoulder: 17 },
    material: 'Cotton denim',
    color: 'Indigo wash',
    closure: 'Button front',
    condition: 'Very good. Denim broken in, no repairs.',
    authNote: 'JPG Jeans label on back yoke, original hardware, French construction.',
    note: 'Archive JPG. Cut to a specific decade.',
    coverImage: '',
    images: [
      '/assets/mainline/snf-jkt-2607-007_real_01.jpg',
      '/assets/mainline/snf-jkt-2607-007_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p018',
    sku: 'SNF-JKT-2607-008',
    name: 'Andrea Jovine Paisley Tapestry Vest',
    brand: 'Andrea Jovine',
    price: 165,
    deal: false,
    gender: 'womens',
    cat: 'jackets',
    year: '1990s',
    origin: 'USA',
    size: 'S',
    measurements: { chest: 18, length: 22, sleeve: 0, shoulder: 14 },
    material: 'Tapestry cotton blend',
    color: 'Multi paisley',
    closure: 'Front frog closures',
    condition: 'Excellent. Tapestry weave crisp, colors saturated.',
    authNote: 'Andrea Jovine label present. Original tapestry weave, no repro flags.',
    note: 'A vest with more happening than most jackets.',
    coverImage: '',
    images: [
      '/assets/mainline/snf-jkt-2607-008_real_01.jpg',
      '/assets/mainline/snf-jkt-2607-008_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },

  // ── MAINLINE: TOPS ──────────────────────────────────────────
  {
    id: 'p019',
    sku: 'SNF-TOP-2607-008',
    name: 'Acne Studios White Stripe Shirt',
    brand: 'Acne Studios',
    price: 220,
    deal: false,
    gender: 'mens',
    cat: 'tops',
    year: '2010s',
    origin: 'Morocco',
    size: 'M',
    measurements: { chest: 22, length: 30, sleeve: 26, shoulder: 18 },
    material: 'Cotton',
    color: 'White on white stripe',
    closure: 'Button front',
    condition: 'Excellent. Sharp collar, no yellowing.',
    authNote: 'Acne Studios interior label ("Made in Morocco"), original construction, monogram embroidery on chest.',
    note: "Acne Studios' answer to a business meeting.",
    coverImage: '',
    images: [
      '/assets/mainline/snf-top-2607-008_real_01.jpg',
      '/assets/mainline/snf-top-2607-008_real_02.jpg',
      '/assets/mainline/snf-top-2607-008_real_03.jpg'
    ],
    alsoListedOn: [],
    sold: false
  },
  // ── MAINLINE: KNITS ─────────────────────────────────────────
  {
    id: 'p021',
    sku: 'SNF-KNT-2607-005',
    name: 'Purple Stripe Mohair Sweater',
    brand: 'Vintage',
    price: 180,
    deal: false,
    gender: 'unisex',
    cat: 'knits',
    year: '1990s',
    origin: 'unknown',
    size: 'M',
    measurements: { chest: 21, length: 25, sleeve: 26, shoulder: 18 },
    material: 'Mohair blend',
    color: 'Purple, cream, and gray stripe',
    closure: 'Pullover',
    condition: 'Very good. Mohair halo intact, no moth.',
    authNote: 'Hand-inspected. Mohair fiber confirmed by hand and halo. Original knit construction.',
    note: 'Warm and luminous — the sweater equivalent of morning light.',
    coverImage: '',
    images: [
      '/assets/mainline/snf-knt-2607-005_real_01.jpg',
      '/assets/mainline/snf-knt-2607-005_real_02.jpg'
    ],
    alsoListedOn: [],
    sold: false
  }
];

// Isomorphic export — browser gets window.SNAFU_SHOP, Node (Vercel /api/) gets module.exports.
if (typeof window !== 'undefined') window.SNAFU_SHOP = SNAFU_SHOP;
if (typeof module !== 'undefined' && module.exports) module.exports = SNAFU_SHOP;
