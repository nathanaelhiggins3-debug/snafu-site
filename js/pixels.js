/**
 * SNAFU — Ad Platform Pixels
 * Shared tracking file, included on every page via:
 *   <script src="/js/pixels.js"></script>
 * placed right before </head>.
 *
 * SETUP: replace the two placeholder IDs below once your Meta and
 * TikTok ad accounts issue real Pixel IDs. Nothing else needs to
 * change — every page pulls from this one file.
 *
 * VERIFY: install the "Meta Pixel Helper" and "TikTok Pixel Helper"
 * Chrome extensions, then visit snafu.quest and confirm both show a
 * green/active badge before spending any ad dollars.
 */

// ===== META PIXEL =====
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'REPLACE_WITH_META_PIXEL_ID');
fbq('track', 'PageView');

// ===== TIKTOK PIXEL =====
!function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = w[t] = w[t] || [];
  ttq.methods = ["page","track","identify","instances","debug","on","off",
    "once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer = function (t, e) {
    t[e] = function () {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.instance = function (t) {
    for (var e = ttq._i[t] || [], n = 0; n < e.length; n++) ttq.setAndDefer(e, e[n]);
    return e;
  };
  ttq.load = function (e, n) {
    var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
    var o = n && n.partner;
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = i;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date;
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    var a = document.createElement("script");
    a.type = "text/javascript";
    a.async = !0;
    a.src = i + "?sdkid=" + e + "&lib=" + t;
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(a, s);
  };
  ttq.load('REPLACE_WITH_TIKTOK_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');

/**
 * OPTIONAL — conversion + engagement event helpers.
 * Call these from the relevant pages once real transactions exist.
 * Safe to leave unused for now; avoid calling before both Pixel IDs
 * above are real, or these will silently fail with no error.
 */

// Fire when someone views a product page.
function snafuTrackViewContent(itemName, itemId, priceUSD, category) {
  if (window.fbq) {
    fbq('track', 'ViewContent', {
      content_name: itemName,
      content_ids: [itemId],
      content_type: 'product',
      content_category: category || '',
      currency: 'USD',
      value: priceUSD
    });
  }
  if (window.ttq) {
    ttq.track('ViewContent', {
      content_id: itemId,
      content_name: itemName,
      content_category: category || '',
      currency: 'USD',
      value: priceUSD
    });
  }
}

// Fire on add-to-cart.
function snafuTrackAddToCart(itemName, itemId, priceUSD, category) {
  if (window.fbq) {
    fbq('track', 'AddToCart', {
      content_name: itemName,
      content_ids: [itemId],
      content_type: 'product',
      content_category: category || '',
      currency: 'USD',
      value: priceUSD
    });
  }
  if (window.ttq) {
    ttq.track('AddToCart', {
      content_id: itemId,
      content_name: itemName,
      content_category: category || '',
      currency: 'USD',
      value: priceUSD
    });
  }
}

// Fire when someone starts checkout (before payment info entered).
function snafuTrackInitiateCheckout(itemIds, totalUSD, numItems) {
  if (window.fbq) {
    fbq('track', 'InitiateCheckout', {
      content_ids: itemIds,
      content_type: 'product',
      currency: 'USD',
      value: totalUSD,
      num_items: numItems
    });
  }
  if (window.ttq) {
    ttq.track('InitiateCheckout', {
      content_id: itemIds,
      currency: 'USD',
      value: totalUSD
    });
  }
}

// Fire on completed purchase (checkout confirmation page).
function snafuTrackPurchase(itemIds, totalUSD) {
  if (window.fbq) {
    fbq('track', 'Purchase', {
      content_ids: itemIds,
      content_type: 'product',
      currency: 'USD',
      value: totalUSD
    });
  }
  if (window.ttq) {
    ttq.track('CompletePayment', {
      content_id: itemIds,
      currency: 'USD',
      value: totalUSD
    });
  }
}

// Fire on email/newsletter signup — high-value for building
// lookalike audiences before Shop has real transaction volume.
function snafuTrackLead(sourcePage) {
  if (window.fbq) {
    fbq('track', 'Lead', { content_name: sourcePage || '' });
  }
  if (window.ttq) {
    ttq.track('SubmitForm', { content_name: sourcePage || '' });
  }
}

// Fire on internal site search, if/when Shop search exists.
function snafuTrackSearch(query) {
  if (window.fbq) {
    fbq('track', 'Search', { search_string: query });
  }
  if (window.ttq) {
    ttq.track('Search', { search_string: query });
  }
}

// Fire when someone clicks a tunnel — SNAFU-specific engagement
// signal, not a standard e-commerce event. Useful later for
// building a "deep engager" custom audience distinct from anyone
// who just landed and bounced.
function snafuTrackTunnelClick(fromPage, toPage) {
  if (window.fbq) {
    fbq('trackCustom', 'TunnelClick', {
      from: fromPage,
      to: toPage
    });
  }
  if (window.ttq) {
    ttq.track('TunnelClick', {
      from: fromPage,
      to: toPage
    });
  }
}

// Fire when someone reads a substantial portion of an editorial
// article (e.g. scrolled past 75%) — distinguishes real readers
// from bounces for the Priya-persona audience specifically.
function snafuTrackArticleEngaged(articleSlug) {
  if (window.fbq) {
    fbq('trackCustom', 'ArticleEngaged', { article: articleSlug });
  }
  if (window.ttq) {
    ttq.track('ArticleEngaged', { article: articleSlug });
  }
}
