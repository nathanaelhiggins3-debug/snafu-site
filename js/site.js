(function () {
  /* SNAFU top bar + menu — one menu on every page.
     MENU (left) · SNAFU. (center) · SIGN IN (right, from snafu-account.js).
     To add or remove a section, edit LINKS below. */
  var LINKS = [
    { href: '/',         label: 'Home',    blurb: 'The clearing' },
    { href: '/news/',    label: 'News',    blurb: 'Dispatches' },
    { href: '/gallery/', label: 'Gallery', blurb: 'The feed' },
    { href: '/shop/',    label: 'Shop',    blurb: 'Current market' },
    { href: '/about/',   label: 'About',   blurb: 'The premise' }
  ];
  var MINOR = [
    { href: 'https://instagram.com/snafusau', label: 'Instagram' },
    { href: '/cart/', label: 'Bag' },
    { href: '/shipping/', label: 'Shipping' },
    { href: '/play/',    label: 'Play' },
    { href: '/account/', label: 'Account' },
    { href: '/privacy/', label: 'Privacy' }
  ];

  if (!document.getElementById('snafu-topnav-styles')) {
    var style = document.createElement('style');
    style.id = 'snafu-topnav-styles';
    style.textContent = `
      .snafu-topnav {
        position: fixed; top: 0; left: 0; right: 0; z-index: 100;
        height: 52px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
        padding: 0 8px;
        background: rgba(12,20,18,.9);
        border-bottom: 2px solid rgba(242,228,196,.14);
        -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
      }
      .snafu-topnav .snafu-mark {
        grid-column: 2;
        font-family: 'Press Start 2P', monospace;
        font-size: 16px; line-height: 1; letter-spacing: .04em;
        color: #f2e4c4; text-decoration: none; padding: 8px 6px;
        text-shadow: 2px 2px 0 #b8352b, 4px 4px 0 #0c1412;
      }
      .snafu-menu-btn {
        grid-column: 1; justify-self: start;
        display: inline-flex; align-items: center; gap: 8px;
        min-height: 36px; padding: 0 10px; cursor: pointer;
        font-family: 'Press Start 2P', monospace; font-size: 9px; letter-spacing: .1em;
        color: #f2e4c4; background: transparent; border: 2px solid rgba(242,228,196,.7);
      }
      .snafu-menu-btn i { display: block; width: 12px; height: 2px; background: currentColor; box-shadow: 0 -4px 0 currentColor, 0 4px 0 currentColor; }
      .snafu-menu-btn[aria-expanded="true"] { background: #f2e4c4; color: #0c1412; }
      .snafu-menu-btn[aria-expanded="true"] i { height: 2px; box-shadow: none; transform: rotate(45deg); }
      .snafu-menu-btn:focus-visible, .snafu-menu a:focus-visible { outline: 2px solid #e3aa4d; outline-offset: 2px; }
      .snafu-menu {
        position: fixed; top: 52px; left: 0; right: 0; z-index: 99;
        max-height: calc(100dvh - 52px); overflow-y: auto;
        background: #0c1412; border-bottom: 3px solid #f2e4c4;
        box-shadow: 0 18px 40px rgba(0,0,0,.55);
        padding: 8px 0 18px;
        transform: translateY(-8px); opacity: 0; visibility: hidden;
        transition: opacity .15s steps(3), transform .15s steps(3), visibility 0s .15s;
      }
      .snafu-menu.open { transform: none; opacity: 1; visibility: visible; transition: opacity .15s steps(3), transform .15s steps(3); }
      .snafu-menu ul { list-style: none; margin: 0 auto; padding: 0; max-width: 560px; }
      .snafu-menu li a {
        display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
        padding: 15px 20px; text-decoration: none; color: #f2e4c4;
        font-family: 'Press Start 2P', monospace; font-size: 14px; letter-spacing: .04em;
        border-bottom: 1px solid rgba(242,228,196,.1);
      }
      .snafu-menu li a span { font-family: 'Pixelify Sans', monospace; font-size: 13px; letter-spacing: .08em; color: #e3aa4d; }
      .snafu-menu li a[aria-current="page"] { color: #e3aa4d; }
      .snafu-menu li a b { font-weight: normal; }
      .snafu-menu li a[aria-current="page"] b::before { content: '\\25B8 '; color: #b8352b; }
      .snafu-menu li a:active, .snafu-menu li a:hover { background: #f2e4c4; color: #0c1412; }
      .snafu-menu li a:hover span { color: #b8352b; }
      .snafu-menu .minor { display: flex; justify-content: center; gap: 22px; max-width: 560px; margin: 16px auto 0; }
      .snafu-menu .minor a { font-family: 'Press Start 2P', monospace; font-size: 9px; letter-spacing: .12em; color: rgba(242,228,196,.75); text-decoration: none; padding: 8px 2px; }
      .snafu-menu-scrim { position: fixed; inset: 52px 0 0; z-index: 98; background: rgba(2,4,5,.55); display: none; }
      .snafu-menu-scrim.open { display: block; }
      body.has-snafu-topnav { padding-top: 52px; }
      body.snafu-menu-open { overflow: hidden; }
      /* The menu replaces the old in-scene "Back to the clearing" buttons. */
      .path-back[href="/"] { display: none !important; }

      /* ---- Readability layer (all pages) ----
         One crisp pixel shadow on big titles instead of stacked outlines + ghost drops.
         Small text gets no shadow and normal tracking. Long reading text uses the
         phone's own clean font; pixel type stays for titles, labels and buttons. */
      .title h1, h1.wordmark, .descent-heading h2, .latest-head h2 {
        text-shadow: 3px 3px 0 #0c1412 !important;
      }
      .title .lede, .pron, .definition, .brand-line, .start, .shop-now, .cue,
      .descent-heading .eyebrow, .latest-label, .end .marker, .end .colophon,
      .eyebrow, .sec-title, .curation-eyebrow {
        text-shadow: none !important;
      }
      .title {
        background: rgba(12,20,18,.78);
        border: 2px solid rgba(242,228,196,.16);
        padding: 16px 18px 18px;
        max-width: min(92vw, 640px);
      }
      .title .lede { letter-spacing: .03em !important; line-height: 1.45; margin-top: 14px !important; }
      /* Type: keep the pixel fonts. Pixelify Sans for everything you read, just set
         clean: no shadow, near-normal tracking, real size and line height. */
      .sec p, .curation-body, .post-caption, .post-note, .piece p, .hero-line,
      .index-intro, .definition, .brand-line, .doc p, .title .lede {
        font-family: 'Pixelify Sans', monospace !important;
        font-weight: 500 !important;
        letter-spacing: .02em !important;
        text-shadow: none !important;
        -webkit-font-smoothing: none;
      }
      .sec p, .curation-body, .doc p { font-size: 18px !important; line-height: 1.65 !important; }
      .hero-line { font-size: 21px !important; line-height: 1.5 !important; }
      .title .lede { font-size: 16px !important; line-height: 1.5 !important; }
      .post-caption { font-size: 18px !important; line-height: 1.5 !important; }
      .post-note { font-size: 16px !important; line-height: 1.55 !important; }
      .definition, .brand-line { font-size: 18px !important; line-height: 1.5 !important; }
      .hero-line em, .sec em { font-style: normal !important; color: #e3aa4d; }
      /* Labels: tighter tracking so they read as words, not letters. */
      .eyebrow, .sec-title, .curation-eyebrow, .latest-label, .descent-heading .eyebrow, .end .marker {
        letter-spacing: .1em !important;
      }
      /* Scroll hints ("Read ▾", "Enter ▾") retired; the content is already in view. */
      .arrive .cue, .title-screen .cue { display: none !important; }
      /* CRT toggle sits in the menu instead of floating over content. */
      .snafu-crt-btn.in-menu { position: static !important; margin: 0; padding: 8px 2px !important; border: 0 !important;
        background: none !important; box-shadow: none !important; font-family: 'Press Start 2P', monospace; font-size: 9px;
        letter-spacing: .12em; color: rgba(242,228,196,.75); cursor: pointer; }
      .snafu-crt-btn.in-menu::after { display: none !important; }
      .snafu-crt-btn.in-menu[aria-pressed="true"] { color: #e3aa4d; }
      .snafu-menu-tip { max-width: 560px; margin: 14px auto 0; padding: 0 20px; text-align: center;
        font-family: 'Pixelify Sans', monospace; font-size: 13px; color: rgba(242,228,196,.6); }
      .snafu-menu-tip b { color: #e3aa4d; font-weight: 500; }
      /* The bag link only shows once something is in it. */
      [data-cart-badge].empty-pack { display: none !important; }

      /* Follow strip — every page, above the footer */
      .snafu-follow { position: relative; z-index: 5; background: #0c1412; border-top: 3px solid #f2e4c4;
        padding: 34px 18px 30px; text-align: center; }
      .snafu-follow h2 { font-family: 'Press Start 2P', monospace; font-size: 13px; letter-spacing: .06em; color: #f2e4c4; margin: 0 0 10px; }
      .snafu-follow p { font-family: 'Pixelify Sans', monospace; font-size: 16px; line-height: 1.5; color: #e8d29a; margin: 0 auto 16px; max-width: 420px; }
      .snafu-follow form { display: flex; gap: 8px; max-width: 420px; margin: 0 auto; }
      .snafu-follow input[type=email] { flex: 1; min-width: 0; padding: 12px; font: 16px 'Pixelify Sans', monospace; color: #0c1412;
        background: #f2e4c4; border: 3px solid #f2e4c4; border-radius: 0; }
      .snafu-follow button, .snafu-follow .ig { font-family: 'Press Start 2P', monospace; font-size: 10px; letter-spacing: .06em; padding: 0 14px;
        min-height: 46px; border: 3px solid #e3aa4d; background: #e3aa4d; color: #0c1412; cursor: pointer; border-radius: 0; }
      .snafu-follow .ig { display: inline-flex; align-items: center; margin-top: 14px; background: transparent; color: #f2e4c4;
        border-color: #f2e4c4; text-decoration: none; }
      .snafu-follow .msg { min-height: 1.4em; margin: 10px 0 0; font-size: 14px; }
      .snafu-follow .hp { position: absolute; left: -9999px; }

      /* New here? — home, first visit only */
      .snafu-welcome { position: relative; z-index: 2; max-width: 820px; margin: 0 auto; padding: 6vh 16px 0; }
      .snafu-welcome > div { position: relative; background: rgba(12,10,7,.92); border: 3px solid #e3aa4d; padding: 18px 18px 16px;
        box-shadow: 6px 6px 0 rgba(10,8,5,.6); }
      .snafu-welcome h2 { font-family: 'Press Start 2P', monospace; font-size: 12px; color: #e3aa4d; margin: 0 0 12px; }
      .snafu-welcome ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
      .snafu-welcome li { font-family: 'Pixelify Sans', monospace; font-size: 16px; line-height: 1.45; color: #f2e4c4; }
      .snafu-welcome li b { color: #e3aa4d; font-weight: 500; }
      .snafu-welcome .x { position: absolute; top: 8px; right: 8px; width: 36px; height: 36px; background: none; border: 2px solid rgba(242,228,196,.5);
        color: #f2e4c4; font: 14px monospace; cursor: pointer; }
      @media (prefers-reduced-motion: reduce) { .snafu-menu, .snafu-menu.open { transition: none; } }
    `;
    document.head.appendChild(style);
  }
  if (!document.querySelector('.snafu-topnav')) {
    var here = location.pathname.replace(/index\.html$/, '');
    function isHere(href) { return href === '/' ? here === '/' : here.indexOf(href) === 0 || here + '/' === href; }
    var nav = document.createElement('nav');
    nav.className = 'snafu-topnav';
    nav.setAttribute('aria-label', 'Site');
    nav.innerHTML = '<button class="snafu-menu-btn" type="button" aria-expanded="false" aria-controls="snafu-menu"><i></i>MENU</button>' +
      '<a class="snafu-mark" href="/" aria-label="SNAFU home">SNAFU.</a>';
    var menu = document.createElement('div');
    menu.className = 'snafu-menu'; menu.id = 'snafu-menu';
    menu.innerHTML = '<ul>' + LINKS.map(function (l) {
      return '<li><a href="' + l.href + '"' + (isHere(l.href) ? ' aria-current="page"' : '') + '><b>' + l.label + '</b><span>' + l.blurb + '</span></a></li>';
    }).join('') + '</ul><div class="minor">' + MINOR.map(function (l) { return '<a href="' + l.href + '">' + l.label + '</a>'; }).join('') + '</div>' +
      '<p class="snafu-menu-tip">Keep SNAFU on your phone: tap Share, then <b>Add to Home Screen</b>.</p>';
    var scrim = document.createElement('div');
    scrim.className = 'snafu-menu-scrim';
    document.body.prepend(scrim); document.body.prepend(menu); document.body.prepend(nav);
    document.body.classList.add('has-snafu-topnav');
    var btn = nav.querySelector('.snafu-menu-btn');
    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open); scrim.classList.toggle('open', open);
      document.body.classList.toggle('snafu-menu-open', open);
      if (open) { var f = menu.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setOpen(false); btn.focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }


  /* Follow strip: Instagram + first-look email list, above every footer. */
  if (!document.querySelector('.snafu-follow') && !/^\/(desk|admin|looks-desk)\b/.test(location.pathname)) {
    var foot = document.querySelector('body > footer:last-of-type') || document.querySelector('footer') || document.querySelector('[role=contentinfo]');
    var f = document.createElement('section');
    f.className = 'snafu-follow';
    f.setAttribute('aria-label', 'Follow SNAFU');
    f.innerHTML = '<h2>GET FIRST LOOK</h2>' +
      '<p>New pieces, stories and drops land as they are found. Be the first to know.</p>' +
      '<form novalidate><label class="hp">Leave empty <input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<input type="email" name="email" placeholder="your@email.com" autocomplete="email" required aria-label="Email address">' +
      '<button type="submit">JOIN</button></form><p class="msg" role="status"></p>' +
      '<a class="ig" href="https://instagram.com/snafusau" rel="noopener">FOLLOW @SNAFUSAU</a>';
    if (foot && foot.parentNode) foot.parentNode.insertBefore(f, foot); else document.body.appendChild(f);
    var form = f.querySelector('form'), msg = f.querySelector('.msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = form.querySelector('button'); b.disabled = true; msg.textContent = 'Joining…'; msg.style.color = '#e8d29a';
      fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.value, website: form.website.value, from: location.pathname }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.message || 'Try again.'); }); })
        .then(function () { form.reset(); msg.textContent = 'You\'re in. First look is yours.'; msg.style.color = '#a8dfb4';
          if (window.fbq) try { fbq('track', 'Lead'); } catch (x) {} })
        .catch(function (err) { msg.textContent = err.message; msg.style.color = '#ffb4a6'; })
        .finally(function () { b.disabled = false; });
    });
  }

  /* New here? — explains SNAFU once, on the home page, then never again. */
  if (location.pathname === '/' || location.pathname === '/index.html') {
    var seen = false;
    try { seen = localStorage.getItem('snafu.welcomed') === '1'; } catch (e) {}
    var latest = document.getElementById('latest');
    if (!seen && latest) {
      var w = document.createElement('section');
      w.className = 'snafu-welcome';
      w.setAttribute('aria-label', 'New here');
      w.innerHTML = '<div><button class="x" type="button" aria-label="Close">✕</button><h2>NEW HERE?</h2><ul>' +
        '<li><b>Read</b> — stories, shows and interviews in News.</li>' +
        '<li><b>Scroll</b> — the Gallery feed, updated all the time.</li>' +
        '<li><b>Shop</b> — curated pieces, hand-picked. When they are gone, they are gone.</li>' +
        '<li><b>Save</b> — tap ☆ on anything to keep it on your shelf.</li></ul></div>';
      latest.parentNode.insertBefore(w, latest);
      w.querySelector('.x').addEventListener('click', function () {
        try { localStorage.setItem('snafu.welcomed', '1'); } catch (e) {}
        w.remove();
      });
    }
  }

  /* Account layer (auth + modal + stars + NEW badges). Pulled in via the
     shared loader so full-chrome pages and bare reader pages stay in sync.
     The loader self-guards against double-init. */
  if (!document.getElementById('snafu-account-layer-js')) {
    const s = document.createElement('script');
    s.id = 'snafu-account-layer-js';
    s.src = '/js/account-layer.js';
    document.head.appendChild(s);
  }
})();

/* ------------------------------------------------------------------
   SNAFU CRT MODE (per "SNAFU CRT Mode" spec)
   A toggle that flips the clean render into tube mode. Default off.
   Phone build: scanlines + vignette. Desktop adds the aperture-grille
   mask and a soft glow pass. Barrel distortion is intentionally
   skipped: transforming the page breaks fixed elements, and restraint
   reads as accurate. Remembered in localStorage ("snafu.crt").
   ------------------------------------------------------------------ */
(function () {
  var KEY = 'snafu.crt';
  var on = false;
  try { on = localStorage.getItem(KEY) === 'on'; } catch (e) {}

  if (!document.getElementById('snafu-crt-styles')) {
    var style = document.createElement('style');
    style.id = 'snafu-crt-styles';
    style.textContent = [
      '.snafu-crt-overlay { position: fixed; inset: 0; z-index: 9990;',
      '  pointer-events: none; display: none; }',
      'body.snafu-crt-on .snafu-crt-overlay { display: block; }',
      /* scanlines: the phosphor-gap signature. kept faint on purpose. */
      '.snafu-crt-overlay::before { content: ""; position: absolute;',
      '  inset: 0;',
      '  background: repeating-linear-gradient(0deg,',
      '    rgba(4,6,5,.13) 0, rgba(4,6,5,.13) 1px,',
      '    transparent 1px, transparent 3px);',
      '  animation: snafu-crt-flicker 3.2s steps(2, end) infinite; }',
      /* vignette: tube brightness falloff toward the corners. */
      '.snafu-crt-overlay::after { content: ""; position: absolute;',
      '  inset: 0;',
      '  background: radial-gradient(ellipse 75% 70% at 50% 50%,',
      '    transparent 55%, rgba(8,10,8,.30) 100%); }',
      '@keyframes snafu-crt-flicker {',
      '  0%, 100% { opacity: 1; } 50% { opacity: .93; } }',
      /* desktop only: aperture-grille RGB strips + soft glow pass. */
      '@media (min-width: 900px) and (hover: hover) {',
      '  .snafu-crt-overlay { backdrop-filter:',
      '    blur(.4px) brightness(1.04) saturate(1.08); }',
      '  .snafu-crt-overlay::before { background:',
      '    repeating-linear-gradient(90deg,',
      '      rgba(255,40,60,.035) 0, rgba(255,40,60,.035) 1px,',
      '      rgba(40,255,120,.035) 1px, rgba(40,255,120,.035) 2px,',
      '      rgba(40,90,255,.035) 2px, rgba(40,90,255,.035) 3px),',
      '    repeating-linear-gradient(0deg,',
      '      rgba(4,6,5,.13) 0, rgba(4,6,5,.13) 1px,',
      '      transparent 1px, transparent 3px); } }',
      '@media (prefers-reduced-motion: reduce) {',
      '  .snafu-crt-overlay::before { animation: none; } }',
      /* the toggle itself: corner furniture, micro system text. */
      '.snafu-crt-btn { position: fixed; left: 10px; bottom: 10px;',
      '  z-index: 9991;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 8px; letter-spacing: .08em; line-height: 1;',
      '  color: var(--cream, #f2e4c4); background: rgba(12,10,7,.72);',
      '  border: 2px solid var(--cream, #f2e4c4); padding: 7px 8px 6px;',
      '  cursor: pointer; box-shadow: 2px 2px 0 rgba(10,8,5,.6); }',
      '.snafu-crt-btn[aria-pressed="true"] {',
      '  color: var(--cream, #f2e4c4);',
      '  background: var(--red, #b8352b);',
      '  border-color: var(--cream, #f2e4c4); }',
      '.snafu-crt-btn:focus-visible { outline: 2px solid',
      '  var(--gold, #e3aa4d); outline-offset: 2px; }',
      /* hover/focus tooltip so CRT is not a mystery button. */
      '.snafu-crt-btn::after { content: attr(data-tip); position: absolute;',
      '  left: 0; bottom: calc(100% + 8px); width: max-content; max-width: 62vw;',
      '  font-family: var(--body, "Pixelify Sans", monospace); font-size: 11px;',
      '  letter-spacing: 0; line-height: 1.4; text-align: left; text-transform: none;',
      '  color: var(--cream, #f2e4c4); background: rgba(12,10,7,.96);',
      '  border: 2px solid var(--cream, #f2e4c4); padding: 8px 10px;',
      '  box-shadow: 2px 2px 0 rgba(10,8,5,.6);',
      '  opacity: 0; transform: translateY(4px); pointer-events: none;',
      '  transition: opacity .12s steps(2), transform .12s steps(2); }',
      '.snafu-crt-btn:hover::after, .snafu-crt-btn:focus-visible::after {',
      '  opacity: 1; transform: translateY(0); }'
    ].join('\n');
    document.head.appendChild(style);
  }

  if (!document.querySelector('.snafu-crt-overlay')) {
    var overlay = document.createElement('div');
    overlay.className = 'snafu-crt-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var btn = document.createElement('button');
    btn.className = 'snafu-crt-btn';
    btn.type = 'button';
    btn.textContent = 'CRT';
    btn.setAttribute('aria-label', 'Toggle CRT mode — retro-TV filter over the site');
    btn.title = 'CRT mode — retro-TV filter: scanlines + glow over the whole site. Tap to toggle.';
    btn.setAttribute('data-tip', 'CRT mode — retro-TV filter: scanlines + glow over the whole site. Tap to toggle.');

    function apply() {
      document.body.classList.toggle('snafu-crt-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'CRT: ON' : 'CRT: OFF';
    }
    btn.addEventListener('click', function () {
      on = !on;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      apply();
    });
    apply();
    var slot = document.querySelector('.snafu-menu .minor');
    if (slot) { btn.classList.add('in-menu'); slot.appendChild(btn); }
    else document.body.appendChild(btn);
  }
})();