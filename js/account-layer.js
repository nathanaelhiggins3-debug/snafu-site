/* ============================================================
   SNAFU — account layer loader
   Loads the shared account features in dependency order, once:
     snafu-auth  →  snafu-account (modal + header entry)
                 →  snafu-stars   (star buttons)
                 →  snafu-new     (NEW badges)

   This is the "account layer only" bundle — NO topnav, NO CRT.
   - Pages with the full chrome get this via js/site.js.
   - Deliberately-bare pages (articles, news desks, product) include
     THIS file directly, so they get auth + modal + stars without the
     centered wordmark or CRT toggle.
   Every target file also self-guards, so double-loading is harmless.
   ============================================================ */
(function () {
  if (window.__snafuAccountLayer) return;
  window.__snafuAccountLayer = true;

  function loadOnce(id, src, onload) {
    var existing = document.getElementById(id);
    if (existing) { if (onload) onload(); return; }
    var s = document.createElement('script');
    s.id = id;
    s.src = src;
    if (onload) s.addEventListener('load', onload);
    document.head.appendChild(s);
  }

  loadOnce('snafu-auth-js', '/js/snafu-auth.js', function () {
    loadOnce('snafu-account-js', '/js/snafu-account.js', function () {
      loadOnce('snafu-stars-js', '/js/snafu-stars.js');
    });
    loadOnce('snafu-new-js', '/js/snafu-new.js');
  });
})();
