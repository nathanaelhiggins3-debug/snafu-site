/* ============================================================
   SNAFU — shared site chrome
   Builds the broadcast TICKER, the HEADER, and the FOOTER once,
   here, and injects them into every page. Edit once → every page
   updates. No frameworks, no build step.
   ============================================================ */

(function () {
  // The four sections. Order here = order in the nav.
  var SECTIONS = [
    { slug: "news",    label: "News"    },
    { slug: "gallery", label: "Gallery" },
    { slug: "shop",    label: "Shop"    },
    { slug: "goods",   label: "Goods"   },
    { slug: "play",    label: "Play"    }
  ];

  // The lines that scroll across the broadcast ticker.
  // Edit / add freely — they loop forever.
  var BROADCAST = [
    "SNAFU — Los Angeles",
    "New in Shop: three 1/1 pieces filed this week",
    "Goods drop incoming — sign up for first access",
    "When it's gone, it's gone",
    "Global hub for fashion, culture & rare finds",
    "Situation: developing"
  ];

  // --- Where does this page live? -----------------------------
  // Inside a one-level subfolder (e.g. /shop/, /cart/) links need
  // to step up with "../". The homepage needs no prefix. We match by
  // folder name (substring) so this also works when opened as a local
  // file:// path, not just on a web server.
  var path = window.location.pathname;
  var SUBDIRS = SECTIONS.map(function (s) { return s.slug; })
    .concat(["cart", "checkout", "brands", "about"]); // non-nav subfolders
  var current = null; // which SECTION nav link to mark active (sections only)
  for (var i = 0; i < SECTIONS.length; i++) {
    if (path.indexOf("/" + SECTIONS[i].slug + "/") !== -1) current = SECTIONS[i].slug;
  }
  var inSubdir = SUBDIRS.some(function (d) { return path.indexOf("/" + d + "/") !== -1; });
  var base = inSubdir ? "../" : "";

  // --- BROADCAST TICKER ---------------------------------------
  // Build one run of items, then duplicate it so the scroll loops
  // seamlessly (the CSS slides exactly one copy's width).
  var oneRun = BROADCAST.map(function (line) {
    return '<span class="ticker__item">' + line + ' <span class="orn">&#10022;</span></span>';
  }).join("");
  var ticker =
    '<div class="ticker" aria-hidden="true">' +
      '<div class="ticker__track">' + oneRun + oneRun + "</div>" +
    "</div>";

  // --- NAV ----------------------------------------------------
  var navLinks = SECTIONS.map(function (c) {
    var here = c.slug === current ? ' aria-current="page"' : "";
    return '<a href="' + base + c.slug + '/"' + here + ">" + c.label + "</a>";
  }).join("");

  // --- CART COUNT ---------------------------------------------
  // Forward-compatible: reads the cart localStorage that Phase 2's
  // js/cart.js will manage. Until then it simply reads 0.
  function cartCount() {
    try {
      var c = JSON.parse(localStorage.getItem("snafu_cart") || "[]");
      return c.reduce(function (n, i) { return n + (i.qty || 1); }, 0);
    } catch (e) { return 0; }
  }

  // --- HEADER -------------------------------------------------
  var header =
    '<header class="site-header">' +
      '<div class="wrap site-header__bar">' +
        '<a class="logo" href="' + base + 'index.html">SNAFU<span>.</span></a>' +
        '<nav class="nav">' + navLinks + "</nav>" +
        '<div class="site-header__right">' +
          '<a class="cart-link" href="' + base + 'cart/">Cart <span class="cart-count" data-cart-count>' + cartCount() + "</span></a>" +
          '<button class="stamp" type="button" aria-pressed="false">SITUATION: NORMAL</button>' +
        "</div>" +
      "</div>" +
    "</header>";

  // --- FOOTER -------------------------------------------------
  var year = new Date().getFullYear();
  var footer =
    '<footer class="site-footer">' +
      '<div class="wrap site-footer__bar">' +
        '<div class="site-footer__logo">SNAFU<span style="color:var(--red)">.</span></div>' +
        '<div class="code">A global hub for fashion, culture &amp; rare 1/1 finds</div>' +
        '<div class="code">Los Angeles <span class="orn">&#8224;</span> &copy; ' + year + "</div>" +
      "</div>" +
    "</footer>";

  // --- Inject -------------------------------------------------
  // Ticker first, then header (so the ticker sits above it), footer last.
  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("afterbegin", ticker);
  document.body.insertAdjacentHTML("beforeend", footer);

  // --- SITUATION stamp toggle ---------------------------------
  var stamp = document.querySelector(".stamp");
  stamp.addEventListener("click", function () {
    var snafu = stamp.classList.toggle("is-snafu");
    stamp.textContent = snafu ? "SITUATION: ALL F'D UP" : "SITUATION: NORMAL";
    stamp.setAttribute("aria-pressed", snafu ? "true" : "false");
  });
})();
