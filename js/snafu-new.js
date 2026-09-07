/* ============================================================
   SNAFU — "new since your last visit" badge injector
   Reads /content-manifest.json (built by scripts/gen-manifest.mjs)
   and compares each piece's publish date against previous_visit_at
   from /auth/me. Items newer than the last visit get a small NEW
   badge on their link in any nav/index listing on the page.

   If previous_visit_at is null (first visit, or signed out), shows
   nothing. Depends on window.SNAFUAuth.
   ============================================================ */
(function () {
  if (window.__snafuNew) return;
  window.__snafuNew = true;
  var Auth = window.SNAFUAuth;
  if (!Auth) return;

  if (!document.getElementById('snafu-new-styles')) {
    var style = document.createElement('style');
    style.id = 'snafu-new-styles';
    style.textContent = [
      '.snafu-has-new { position: relative; }',
      '.snafu-new-badge { position: absolute; top: 6px; right: 6px; z-index: 4;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 8px; letter-spacing: .1em; line-height: 1;',
      '  color: var(--ink, #0c1412); background: var(--gold, #e3aa4d);',
      '  border: 2px solid var(--ink, #0c1412); padding: 4px 5px 3px;',
      '  box-shadow: 2px 2px 0 rgba(2,2,0,.5); pointer-events: none; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function badge(link) {
    if (link.querySelector('.snafu-new-badge')) return;
    link.classList.add('snafu-has-new');
    var b = document.createElement('span');
    b.className = 'snafu-new-badge';
    b.textContent = 'NEW';
    b.setAttribute('aria-label', 'New since your last visit');
    link.appendChild(b);
  }

  // Match any anchor pointing at the piece's path (with or without a
  // trailing slash, absolute or relative).
  function mark(path) {
    var clean = path.replace(/\/$/, '');          // e.g. /news/editorial/worn-in
    if (clean.length < 2) return;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      var h = href.replace(/[?#].*$/, '').replace(/\/$/, '');
      if (!h) continue;
      // exact, or a relative link ending on the same path segment boundary
      var boundaryOK = h.length > clean.length &&
        h.slice(-clean.length) === clean &&
        h.charAt(h.length - clean.length - 1) === '/';
      if (h === clean || boundaryOK) badge(links[i]);
    }
  }

  function run() {
    var prev = Auth.previousVisit();
    if (!prev) return;                       // first visit / signed out → nothing
    var prevMs = new Date(prev).getTime();
    if (!prevMs) return;

    fetch('/content-manifest.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.items) return;
        data.items.forEach(function (item) {
          if (!item.published) return;
          if (new Date(item.published).getTime() > prevMs) mark(item.path);
        });
      })
      .catch(function () { /* manifest missing → no badges */ });
  }

  // Needs the user (for previous_visit_at) and the DOM (to mark links).
  Auth.me().then(function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else { run(); }
  });
})();
