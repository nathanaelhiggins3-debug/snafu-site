/* ================================================================
   SNAFU — advertising pixels

   ONE source of truth for every third-party tracker on the site.
   Include with `<script src="/js/pixel.js" async></script>` from
   the <head> of every page. Base pixel fires PageView automatically.

   Fire custom events with:
     window.snafuTrack('EventName', { params })

   The wrapper is safe: if a pixel hasn't loaded (or was blocked by
   an extension) it silently no-ops, so it can be called from any
   render/click handler without try/catch.
   ================================================================ */

// ── META (Facebook / Instagram) — Pixel ID 1251941453631248 ──────
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1251941453631248');
fbq('track', 'PageView');

// ── TIKTOK (paste your ttq init here once you have the pixel ID) ──
// !function(w,d,t){w.TiktokAnalyticsObject=t; ...
// ttq.load('YOUR_TIKTOK_PIXEL_ID');
// ttq.page();

// ── Cross-pixel safe track wrapper ────────────────────────────────
// Usage:
//   snafuTrack('ViewContent',      { content_ids, content_name, value, currency })
//   snafuTrack('AddToCart',        { content_ids, content_name, value, currency })
//   snafuTrack('InitiateCheckout', { value, currency, num_items })
//   snafuTrack('Purchase',         { value, currency, content_ids })
window.snafuTrack = function (name, params) {
  params = params || {};
  try { if (typeof fbq === 'function') fbq('track', name, params); } catch (e) {}
  try { if (typeof ttq !== 'undefined' && ttq && typeof ttq.track === 'function') ttq.track(name, params); } catch (e) {}
};
