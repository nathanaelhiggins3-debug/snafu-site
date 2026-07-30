/* SNAFU shop data.
   One source of truth. Read by shop/index.html, shop/deals.html,
   shop/product.html, shop/cart.html.
   Add a piece: paste one object. Grid + detail regenerate.

   ── FULL SCHEMA (per brief) ────────────────────────────────────
   id             'p001'                   internal id, used in URL
   sku            'SNF-JKT-2607-001'       SNAFU inventory SKU
   name           'Girbaud Cord Duster'    display name
   brand          'François Girbaud'       brand/maker
   year           '1990s'                  era
   origin         'Japan'                  country
   price          220                      what buyer pays (deal price if deal)
   originalPrice  340                      DEAL ONLY: shown struck-through
   deal           true                     DEAL ONLY: orange border, appears in deals.html
   gender         'mens' | 'womens' | 'unisex'
   cat            'jackets' | 'tops' | 'bottoms' | 'knits' | 'accessories'
   size           'M'                      tagged size
   measurements   { chest, length, sleeve, shoulder }   in inches
   material       'Cotton pinwale corduroy'
   color          'Wheat'
   closure        'Full zip, dual-slider'
   condition      'Very good, minor wear at cuffs.'
   authNote       'Original woven tag, YKK zips, deadstock lining.'
   note           editorial one-liner (THE SNAFU LINE on the product page)
   coverImage     'assets/covers/SNF-JKT-2607-001_cover.png'   pixel cover
   images         ['assets/real/SNF-JKT-2607-001_real_01.jpg', ...]  real photos
   alsoListedOn   [{ platform: 'Grailed', url: 'https://...' }]
   sold           false

   Every field except `id`, `name`, `price`, `cat`, `gender` is optional —
   product.html renders whatever's present, skips what isn't.
*/
const SNAFU_SHOP = [
  {
    id: 'p001',
    sku: 'SNF-JKT-2607-001',
    name: 'Placeholder Jacket',
    brand: 'Unbranded',
    price: 220,
    gender: 'mens',
    cat: 'jackets',
    year: '1990s',
    origin: 'Japan',
    size: 'M',
    measurements: { chest: 22, length: 28, sleeve: 25, shoulder: 19 },
    material: 'Cotton twill',
    color: 'Faded olive',
    closure: 'Snap front',
    condition: 'Very good, minor wear at cuffs.',
    authNote: 'Original woven tag, period-correct hardware, deadstock lining intact.',
    note: 'A workwear silhouette with the shoulders cut for someone who actually worked.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p002',
    sku: 'SNF-TOP-2607-001',
    name: 'Placeholder Tee',
    brand: 'Unbranded',
    price: 28,
    originalPrice: 45,
    deal: true,
    gender: 'mens',
    cat: 'tops',
    year: '2001',
    origin: 'USA',
    size: 'L',
    measurements: { chest: 21, length: 29, sleeve: 8, shoulder: 18 },
    material: 'Cotton jersey',
    color: 'Washed black',
    closure: 'Pullover',
    condition: 'Excellent, soft hand.',
    authNote: 'Single-stitch hem, original tag, no repro flags.',
    note: 'The kind of graphic you saw on the floor of a college dorm in 2003.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p003',
    sku: 'SNF-BTM-2607-001',
    name: 'Placeholder Trouser',
    brand: 'Unbranded',
    price: 120,
    gender: 'mens',
    cat: 'bottoms',
    year: '1980s',
    origin: 'Italy',
    size: 'W32 L30',
    measurements: { waist: 32, inseam: 30, rise: 11, hem: 8 },
    material: 'Wool gabardine',
    color: 'Charcoal',
    closure: 'Hook + zip, button fly interior',
    condition: 'Good, minor fade.',
    authNote: 'Union tag present, original buttons, no re-hem.',
    note: "A cut that hasn't been made in twenty years and can't be faked.",
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p004',
    sku: 'SNF-ACC-2607-001',
    name: 'Placeholder Cap',
    brand: 'Unbranded',
    price: 18,
    originalPrice: 35,
    deal: true,
    gender: 'unisex',
    cat: 'accessories',
    year: '1990s',
    origin: 'USA',
    size: 'One size',
    material: 'Cotton canvas',
    color: 'Dust',
    closure: 'Snap-back, six panel',
    condition: 'Very good.',
    authNote: 'Original snap plate, no fade on interior sweatband.',
    note: 'A cap the color of dust.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p005',
    sku: 'SNF-TOP-2607-002',
    name: 'Placeholder Blouse',
    brand: 'Unbranded',
    price: 85,
    gender: 'womens',
    cat: 'tops',
    year: '1970s',
    origin: 'France',
    size: 'S',
    measurements: { chest: 18, length: 24, sleeve: 22, shoulder: 15 },
    material: 'Silk crepe',
    color: 'Cream',
    closure: 'Full button front, mother-of-pearl',
    condition: 'Very good, one small pull at seam.',
    authNote: 'Original French tag, hand-finished hem, period-correct buttons.',
    note: 'A shape that pretends nothing has changed since 1974.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p006',
    sku: 'SNF-BTM-2607-002',
    name: 'Placeholder Skirt',
    brand: 'Unbranded',
    price: 95,
    gender: 'womens',
    cat: 'bottoms',
    year: '1990s',
    origin: 'Japan',
    size: 'S',
    measurements: { waist: 26, length: 22, hem: 44 },
    material: 'Wool blend',
    color: 'Slate',
    closure: 'Side zip, hook top',
    condition: 'Excellent.',
    authNote: 'Original Japanese care label, YKK zip, no alterations.',
    note: 'Weight in the hem you feel when you sit down.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: true
  },
  {
    id: 'p007',
    sku: 'SNF-JKT-2607-002',
    name: 'Placeholder Coat',
    brand: 'Unbranded',
    price: 340,
    gender: 'womens',
    cat: 'jackets',
    year: '1980s',
    origin: 'Italy',
    size: 'M',
    measurements: { chest: 21, length: 42, sleeve: 24, shoulder: 17 },
    material: 'Wool melton',
    color: 'Camel',
    closure: 'Double-breasted, horn buttons',
    condition: 'Very good, lining intact.',
    authNote: 'Original Italian union label, horn buttons original set, hand-tacked lining.',
    note: 'The kind of coat that stops a conversation for a second.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  },
  {
    id: 'p008',
    sku: 'SNF-ACC-2607-002',
    name: 'Placeholder Scarf',
    brand: 'Unbranded',
    price: 55,
    gender: 'womens',
    cat: 'accessories',
    year: 'unknown',
    origin: 'unknown',
    size: 'One size',
    material: 'Silk twill',
    color: 'Multi',
    closure: '—',
    condition: 'Good, minor age spots.',
    authNote: 'Hand-rolled edges, silk hand confirmed, no printed reproductions.',
    note: 'Silk that predates whoever cataloged it.',
    coverImage: '',
    images: [],
    alsoListedOn: [],
    sold: false
  }
];

// Isomorphic export — browser gets window.SNAFU_SHOP, Node (Vercel /api/) gets module.exports.
if (typeof window !== 'undefined') window.SNAFU_SHOP = SNAFU_SHOP;
if (typeof module !== 'undefined' && module.exports) module.exports = SNAFU_SHOP;
