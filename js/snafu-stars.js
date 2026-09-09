/* ============================================================
   SNAFU — star button component (window.SNAFUStars)
   A 16-bit star that saves a piece to the signed-in user's shelves.

   Markup (pages only need this — no per-page JS):
     <button class="snafu-star"
             data-star-type="product|article|exhibit"
             data-star-ref="/shop/thing/"        (leading slash, the site path)
             data-star-title="Thing"
             data-star-image="/assets/x.png"
             data-star-section="shop"></button>

   Behavior:
   - On load, ONE batched POST /stars/state resolves the fill for every star
     on the page. Never one request per button. Late-rendered stars (JS grids)
     are caught by a MutationObserver and batched too.
   - Optimistic: fill on tap, revert if the request fails.
   - Signed out: tap opens the auth modal with context; the intent is held and
     the star completes automatically after signup/login.

   Depends on window.SNAFUAuth (api, subscribe, current) and, for the signed-out
   flow, window.SNAFU_openAuth.
   ============================================================ */
(function () {
  if (window.SNAFUStars) return;
  var Auth = window.SNAFUAuth;
  if (!Auth) return;

  // ---- styles (once) ----------------------------------------
  if (!document.getElementById('snafu-star-styles')) {
    var style = document.createElement('style');
    style.id = 'snafu-star-styles';
    style.textContent = [
      '.snafu-star { -webkit-appearance: none; appearance: none; background: none;',
      '  border: none; cursor: pointer; padding: 8px; margin: 0;',
      '  min-width: 44px; min-height: 44px; display: inline-flex;',
      '  align-items: center; justify-content: center; line-height: 0;',
      '  color: var(--cream, #f2e4c4); }',
      '.snafu-star:focus-visible { outline: 2px solid var(--gold, #e3aa4d);',
      '  outline-offset: 2px; }',
      '.snafu-star__i { width: 26px; height: 26px; display: block;',
      '  image-rendering: pixelated; shape-rendering: crispEdges;',
      '  transition: transform 90ms steps(2, end); }',
      /* unstarred: hollow, inherits text color */
      '.snafu-star__i path { fill: none; stroke: currentColor; stroke-width: 1.4; }',
      /* starred: filled yellow with a hard ink edge */
      '.snafu-star.is-starred { color: var(--gold, #e3aa4d); }',
      '.snafu-star.is-starred .snafu-star__i path { fill: var(--gold, #e3aa4d);',
      '  stroke: var(--ink, #0c1412); stroke-width: 1; }',
      '.snafu-star.is-starred .snafu-star__i { transform: scale(1.12); }',
      '.snafu-star[aria-disabled="true"] { opacity: .5; cursor: default; }',
      // corner overlay on a product/goods card — top-LEFT to clear the DEAL badge
      '.snafu-star--corner { position: absolute; top: 2px; left: 2px; z-index: 3;',
      '  filter: drop-shadow(2px 2px 0 rgba(2,2,0,.6)); }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // blocky 5-point star, 16x16 grid
  var STAR_SVG = '<svg class="snafu-star__i" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M8 1 L10 6 L15 6 L11 9 L13 14 L8 11 L3 14 L5 9 L1 6 L6 6 Z"/></svg>';

  // ---- state ------------------------------------------------
  var known = [];                 // buttons we've wired
  var pending = null;             // {btn} intent held across the auth modal
  var wasSignedIn = undefined;    // track auth transitions
  var scanQueued = false;

  function keyOf(btn) {
    return btn.getAttribute('data-star-type') + ':' + btn.getAttribute('data-star-ref');
  }
  function payloadOf(btn) {
    return {
      item_type: btn.getAttribute('data-star-type'),
      item_ref: btn.getAttribute('data-star-ref'),
      title: btn.getAttribute('data-star-title') || undefined,
      image: btn.getAttribute('data-star-image') || undefined,
      section: btn.getAttribute('data-star-section') || undefined
    };
  }
  function idOf(btn) {
    return { item_type: btn.getAttribute('data-star-type'),
             item_ref: btn.getAttribute('data-star-ref') };
  }

  function setStarred(btn, on) {
    btn.classList.toggle('is-starred', !!on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = on ? 'Saved — tap to remove' : 'Save this';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  // ---- initial + incremental state resolution ---------------
  // Batches every not-yet-resolved star into ONE POST /stars/state.
  function resolveState(btns) {
    var items = btns.map(idOf);
    if (!items.length) return Promise.resolve();
    return Auth.api('POST', '/stars/state', { items: items }).then(function (res) {
      var state = (res && res.state) || {};
      btns.forEach(function (btn) {
        var s = state[keyOf(btn)];
        if (s) setStarred(btn, s.starred);
      });
    }, function () { /* leave as unstarred on failure */ });
  }

  function wire(btn) {
    if (btn.__snafuStar) return;
    btn.__snafuStar = true;
    btn.type = btn.type || 'button';
    if (!btn.innerHTML.trim()) btn.innerHTML = STAR_SVG;
    setStarred(btn, false);
    btn.addEventListener('click', onClick);
    known.push(btn);
  }

  // Scan the DOM for stars, wire new ones, and batch a single state call
  // for the newly found set.
  function scan() {
    scanQueued = false;
    var found = [];
    var all = document.querySelectorAll('.snafu-star, [data-star-ref]');
    for (var i = 0; i < all.length; i++) {
      var btn = all[i];
      if (!btn.__snafuStar) { wire(btn); found.push(btn); }
    }
    if (found.length) resolveState(found);
  }
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    // microtask-ish debounce so a grid of N cards yields ONE state call
    (window.requestAnimationFrame || window.setTimeout)(scan, 0);
  }

  // ---- click / toggle ---------------------------------------
  function onClick(e) {
    e.preventDefault();
    e.stopPropagation(); // stars often overlay a card <a>
    var btn = e.currentTarget;
    if (btn.getAttribute('aria-disabled') === 'true') return;

    if (Auth.current === undefined) {
      // Session lookup is still in flight. Hold the intent until auth resolves
      // instead of briefly treating an already-signed-in visitor as signed out.
      pending = { btn: btn };
      return;
    }

    if (!Auth.current) {
      // signed out — hold intent, open the modal, complete after auth
      pending = { btn: btn };
      if (window.SNAFU_openAuth) {
        window.SNAFU_openAuth('signup', { context: 'Sign up to save this' });
      }
      return;
    }
    toggle(btn);
  }

  function toggle(btn) {
    var starred = btn.classList.contains('is-starred');
    // optimistic flip
    setStarred(btn, !starred);
    btn.setAttribute('aria-disabled', 'true');

    var req = starred
      ? Auth.api('DELETE', '/stars', idOf(btn))
      : Auth.api('POST', '/stars', payloadOf(btn));

    req.then(function () {
      btn.removeAttribute('aria-disabled');
    }, function () {
      setStarred(btn, starred);         // revert
      btn.removeAttribute('aria-disabled');
    });
  }

  // ---- auth transitions -------------------------------------
  // When the user becomes signed in, complete a held intent and refresh
  // the fill state of every star on the page (their stars may exist server-side).
  Auth.subscribe(function (user) {
    if (user === undefined) return;
    var signedIn = !!user;
    var firstResolution = wasSignedIn === undefined;
    var became = signedIn && wasSignedIn === false;
    var loggedOut = !signedIn && wasSignedIn === true;
    wasSignedIn = signedIn;

    if (firstResolution && pending && pending.btn) {
      if (signedIn) {
        var firstBtn = pending.btn; pending = null;
        // Resolve the existing server state first, then honor this as a real
        // toggle. This covers a click that lands before the initial state batch.
        resolveState([firstBtn]).then(function () { toggle(firstBtn); });
      } else if (window.SNAFU_openAuth) {
        window.SNAFU_openAuth('signup', { context: 'Sign up to save this' });
      }
      return;
    }

    if (became) {
      if (known.length) resolveState(known);  // one batched refresh
      if (pending && pending.btn) {
        var btn = pending.btn; pending = null;
        // complete the original intent if it isn't already starred
        if (!btn.classList.contains('is-starred')) toggle(btn);
      }
    } else if (loggedOut) {
      pending = null;
      known.forEach(function (b) { setStarred(b, false); });
    }
  });

  // ---- observe late-rendered stars (JS grids, filters) ------
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) { queueScan(); return; }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.SNAFUStars = { scan: scan };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else { scan(); }
})();
