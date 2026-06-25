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
    "When it's gone, it's gone"
  ];

  // --- Where does this page live? -----------------------------
  // Inside a one-level subfolder (e.g. /shop/, /cart/) links need
  // to step up with "../". The homepage needs no prefix. We match by
  // folder name (substring) so this also works when opened as a local
  // file:// path, not just on a web server.
  var path = window.location.pathname;
  var SUBDIRS = SECTIONS.map(function (s) { return s.slug; })
    .concat(["cart", "checkout"]); // non-nav subfolders
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
    return '<span class="ticker__item">' + line + '</span>';
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
  // Same links, larger, for the mobile drop-down menu.
  var navLinksMobile = SECTIONS.map(function (c) {
    var here = c.slug === current ? ' aria-current="page"' : "";
    return '<a class="mobile-menu__link" href="' + base + c.slug + '/"' + here + ">" + c.label + "</a>";
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
        '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' +
          '<span></span><span></span><span></span>' +
        "</button>" +
        '<a class="logo" href="' + base + 'index.html">SNAFU<span>.</span></a>' +
        '<nav class="nav">' + navLinks + "</nav>" +
        '<div class="site-header__right">' +
          '<a class="cart-link" href="' + base + 'cart/">Cart <span class="cart-count" data-cart-count>' + cartCount() + "</span></a>" +
          '<button class="stamp" type="button" aria-pressed="false">SITUATION: NORMAL</button>' +
        "</div>" +
      "</div>" +
      '<div class="mobile-menu" id="mobile-menu" hidden>' +
        '<nav class="mobile-menu__nav">' + navLinksMobile + "</nav>" +
        '<button class="stamp stamp--menu" type="button" aria-pressed="false">SITUATION: NORMAL</button>' +
      "</div>" +
    "</header>";

  // --- FOOTER -------------------------------------------------
  var year = new Date().getFullYear();
  var footer =
    '<footer class="site-footer">' +
      '<div class="wrap site-footer__bar">' +
        '<div class="site-footer__logo">SNAFU<span style="color:var(--red)">.</span></div>' +
        '<div class="code">Los Angeles &copy; ' + year + "</div>" +
      "</div>" +
    "</footer>";

  // --- Inject -------------------------------------------------
  // Ticker first, then header (so the ticker sits above it), footer last.
  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("afterbegin", ticker);
  document.body.insertAdjacentHTML("beforeend", footer);

  // --- SITUATION stamp toggle ---------------------------------
  // There can be two stamps (header bar + mobile menu); keep them in sync.
  var stamps = document.querySelectorAll(".stamp");
  var stampOn = false;
  function paintStamps() {
    for (var i = 0; i < stamps.length; i++) {
      stamps[i].classList.toggle("is-snafu", stampOn);
      stamps[i].textContent = stampOn ? "SITUATION: ALL F'D UP" : "SITUATION: NORMAL";
      stamps[i].setAttribute("aria-pressed", stampOn ? "true" : "false");
    }
  }
  for (var s = 0; s < stamps.length; s++) {
    stamps[s].addEventListener("click", function () { stampOn = !stampOn; paintStamps(); });
  }

  // --- Mobile hamburger menu ----------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function closeMenu() {
    menu.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
  }
  function openMenu() {
    menu.removeAttribute("hidden");
    toggle.setAttribute("aria-expanded", "true");
    toggle.classList.add("is-open");
  }
  toggle.addEventListener("click", function () {
    if (menu.hasAttribute("hidden")) openMenu(); else closeMenu();
  });
  // Tapping a menu link closes the menu (it then navigates).
  var mlinks = menu.querySelectorAll("a");
  for (var m = 0; m < mlinks.length; m++) mlinks[m].addEventListener("click", closeMenu);

  // --- Live cart badge ----------------------------------------
  // js/cart.js fires "snafu:cart" on add/remove; "storage" fires when
  // another tab changes the cart. Either way, re-read and update the count.
  function refreshBadge() {
    var c = cartCount();
    var els = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < els.length; i++) els[i].textContent = c;
  }
  window.addEventListener("snafu:cart", refreshBadge);
  window.addEventListener("storage", function (e) {
    if (e.key === "snafu_cart") refreshBadge();
  });
})();
