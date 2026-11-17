/* ============================================================
   SNAFU — bag checkout (Vercel serverless function)

   POST /api/checkout            { items: [{ id }] }
     Creates one Stripe Checkout Session for everything in the bag,
     with the same shipping rates, Stripe Tax and final-sale note as
     the single-piece Payment Links. Returns { url }.

   GET  /api/checkout?status=p021,p022
     Live availability. Returns { sold: [ids] }. A piece counts as sold
     when its Payment Link has been used up or switched off.

   GET  /api/checkout?confirm=<session_id>
     Called by the success page. If that session is paid, switches off
     the Payment Link of every piece in it, so a one-of-one can't sell
     twice (once through the bag, once through Buy now).

   SECURITY
   - STRIPE_SECRET_KEY lives only in Vercel env vars. Best as a
     restricted key with: Checkout Sessions (write), Payment Links
     (write), Prices (read), Products (read).
   - Prices come from Stripe (stripePrice in js/shop-data.js), never
     from the browser.
   ============================================================ */

const Stripe = require('stripe');
const catalog = require('../js/shop-data.js');

const SHIPPING_RATES = [
  'shr_1Ucs7YLwaRjGaOhuZlmEpvq6', // US Standard  $9
  'shr_1Ucs8ELwaRjGaOhuf8JZNpn1', // US Express   $25
  'shr_1Ucs8jLwaRjGaOhudA5V0PCD'  // International $40
];

const COUNTRIES = ['US', 'CA', 'MX', 'GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE',
  'AT', 'CH', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'JP', 'KR', 'TW', 'HK', 'SG', 'AU', 'NZ'];

function stripeClient(res) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({ error: 'Checkout is not configured yet.' });
    return null;
  }
  return Stripe(secret);
}

// true when the piece can no longer be bought
async function isSold(stripe, piece) {
  if (piece.sold === true) return true;
  if (!piece.paymentLinkId) return false;
  try {
    const link = await stripe.paymentLinks.retrieve(piece.paymentLinkId);
    if (!link.active) return true;
    const cs = link.restrictions && link.restrictions.completed_sessions;
    return !!(cs && cs.limit && cs.count >= cs.limit);
  } catch (e) {
    return false; // can't check: don't block the sale on a lookup error
  }
}

function origin(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return proto + '://' + host;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  /* ---------- GET: status / confirm ---------- */
  if (req.method === 'GET') {
    const q = req.query || {};
    const stripe = stripeClient(res);
    if (!stripe) return;

    if (q.status) {
      const ids = String(q.status).split(',').slice(0, 40);
      const pieces = catalog.filter((p) => ids.includes(p.id));
      const flags = await Promise.all(pieces.map((p) => isSold(stripe, p)));
      res.status(200).json({ sold: pieces.filter((p, i) => flags[i]).map((p) => p.id) });
      return;
    }

    if (q.confirm) {
      try {
        const session = await stripe.checkout.sessions.retrieve(String(q.confirm));
        if (session.payment_status !== 'paid') {
          res.status(200).json({ ok: false, items: [] });
          return;
        }
        const ids = String((session.metadata && session.metadata.items) || '').split(',').filter(Boolean);
        for (const id of ids) {
          const piece = catalog.find((p) => p.id === id);
          if (piece && piece.paymentLinkId) {
            try { await stripe.paymentLinks.update(piece.paymentLinkId, { active: false }); } catch (e) {}
          }
        }
        res.status(200).json({ ok: true, items: ids, total: (session.amount_total || 0) / 100 });
      } catch (e) {
        res.status(400).json({ ok: false, error: 'Unknown session.' });
      }
      return;
    }

    res.status(400).json({ error: 'Nothing asked.' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  /* ---------- POST: create the session ---------- */
  const stripe = stripeClient(res);
  if (!stripe) return;

  const payload = (req.body && typeof req.body === 'object') ? req.body : {};
  const requested = Array.isArray(payload.items) ? payload.items : [];
  const ids = [...new Set(requested.map((i) => i && i.id).filter(Boolean))];
  if (!ids.length) {
    res.status(400).json({ error: 'Your bag is empty.' });
    return;
  }

  const pieces = ids.map((id) => catalog.find((p) => p.id === id)).filter((p) => p && p.stripePrice);
  const soldFlags = await Promise.all(pieces.map((p) => isSold(stripe, p)));
  const sold = pieces.filter((p, i) => soldFlags[i]).map((p) => p.id);
  const open = pieces.filter((p, i) => !soldFlags[i]);

  if (sold.length) {
    res.status(409).json({ error: 'Already sold: ' + sold.join(', '), sold: sold });
    return;
  }
  if (!open.length) {
    res.status(400).json({ error: 'Nothing in your bag can be bought right now.' });
    return;
  }

  const base = origin(req);
  const itemList = open.map((p) => p.id).join(',');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: open.map((p) => ({ price: p.stripePrice, quantity: 1 })),
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: COUNTRIES },
      shipping_options: SHIPPING_RATES.map((id) => ({ shipping_rate: id })),
      phone_number_collection: { enabled: true },
      custom_text: {
        submit: { message: 'All sales are final. Every piece is one of one.' }
      },
      metadata: { items: itemList },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: base + '/checkout/success.html?items=' + itemList + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: base + '/cart/'
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
