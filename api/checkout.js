/* ============================================================
   SNAFU — Stripe Checkout (Vercel serverless function)

   Creates a Stripe Checkout Session for the items in the cart and
   returns the hosted-checkout URL for the browser to redirect to.

   SECURITY:
   - STRIPE_SECRET_KEY is read from process.env, set in Vercel dashboard
     (Project → Settings → Environment Variables). Never in frontend code.
   - Prices and names come from the server-side catalog (js/shop-data.js),
     looked up by id. We do NOT trust amounts sent by the browser.
   - Use Stripe TEST keys (sk_test_...) until you go live.
   ============================================================ */

const Stripe = require('stripe');
const catalog = require('../js/shop-data.js');

// 220 (number) or "$220" (string) → 22000 cents
function priceToCents(p) {
  if (typeof p === 'number') return Math.round(p * 100);
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' });
    return;
  }
  const stripe = Stripe(secret);

  // Vercel already parses JSON bodies when Content-Type is application/json.
  const payload = (req.body && typeof req.body === 'object') ? req.body : {};
  const requested = Array.isArray(payload.items) ? payload.items : [];
  if (!requested.length) {
    res.status(400).json({ error: 'Cart is empty.' });
    return;
  }

  // Build line items from the trusted catalog, by id.
  const line_items = [];
  for (const it of requested) {
    const piece = catalog.find((p) => p.id === it.id);
    if (!piece) continue;                       // unknown id — skip
    if (piece.sold === true) continue;          // already sold — not purchasable
    const amount = priceToCents(piece.price);   // price = deal price if deal
    if (amount <= 0) continue;                  // no real price — skip

    line_items.push({
      price_data: {
        currency: (piece.currency || 'usd').toLowerCase(),
        product_data: { name: piece.name },
        unit_amount: amount
      },
      quantity: 1 // Shop pieces are one-of-one
    });
  }

  if (!line_items.length) {
    res.status(400).json({ error: 'No purchasable items in cart.' });
    return;
  }

  // Absolute URLs derived from the request so this works on Vercel
  // preview URLs and the production domain alike.
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host  = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = proto + '://' + host;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line_items,
      success_url: origin + '/checkout/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  origin + '/checkout/cancel.html'
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
