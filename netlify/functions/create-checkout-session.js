/* ============================================================
   SNAFU — Stripe Checkout (Netlify Function)
   Creates a Stripe Checkout Session for the items in the cart and
   returns the hosted-checkout URL for the browser to redirect to.

   SECURITY:
   - The Stripe SECRET key is read from process.env.STRIPE_SECRET_KEY.
     It lives ONLY here (server-side env var), never in frontend code.
   - Prices/names come from the server-side catalog (js/shop-data.js),
     looked up by id. We do NOT trust amounts sent by the browser.
   - Use Stripe TEST keys until you go live.
   ============================================================ */

const Stripe = require("stripe");
const catalog = require("../../js/shop-data.js");

// "$2,400" -> 240000 cents
function priceToCents(p) {
  if (typeof p === "number") return Math.round(p * 100);
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed." }) };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." })
    };
  }
  const stripe = Stripe(secret);

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  const requested = Array.isArray(payload.items) ? payload.items : [];
  if (!requested.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty." }) };
  }

  // Build line items from the trusted catalog, by id.
  const line_items = [];
  for (const it of requested) {
    const piece = catalog.find((p) => p.id === it.id);
    if (!piece) continue;                       // unknown id — skip
    if (piece.status !== "AVAILABLE") continue; // sold/reserved — not purchasable
    const amount = priceToCents(piece.price);
    if (amount <= 0) continue;                  // no real price — skip
    line_items.push({
      price_data: {
        currency: (piece.currency || "usd").toLowerCase(),
        product_data: { name: piece.name },
        unit_amount: amount
      },
      quantity: 1 // Shop pieces are one-of-one
    });
  }

  if (!line_items.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "No purchasable items in cart." }) };
  }

  // Absolute URLs derived from the request, so this works on netlify dev
  // (http://localhost:8888) and on the deployed domain alike.
  const origin =
    event.headers.origin ||
    (event.headers.host ? "https://" + event.headers.host : "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: line_items,
      success_url: origin + "/checkout/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/checkout/cancel.html"
    });
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
