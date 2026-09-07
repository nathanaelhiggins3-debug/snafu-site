/* ============================================================
   SNAFU — account UI (header entry + auth modal)
   Injected on every page by js/site.js. Reuses the pixel-arcade
   language: Press Start 2P display, Pixelify Sans body, the
   --cream/--ink/--red/--gold/--px tokens each section already
   sets (with the same fallbacks site.js uses so it holds up on
   pages that don't define them).

   Depends on window.SNAFUAuth. Exposes window.SNAFU_openAuth.
   ============================================================ */
(function () {
  if (window.SNAFU_openAuth) return;
  var Auth = window.SNAFUAuth;
  if (!Auth) return; // auth layer must load first

  var PX = '3px';

  // ---- styles (once) ----------------------------------------
  if (!document.getElementById('snafu-account-styles')) {
    var style = document.createElement('style');
    style.id = 'snafu-account-styles';
    style.textContent = [
      /* header corner control — mirrors the CRT button furniture */
      '.snafu-acct { position: fixed; top: 8px; right: 8px; z-index: 101; }',
      '.snafu-acct__btn { display: inline-flex; align-items: center; gap: 8px;',
      '  min-height: 44px; padding: 6px 10px; cursor: pointer;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 9px; letter-spacing: .06em; line-height: 1;',
      '  color: var(--cream, #f2e4c4); background: rgba(12,10,7,.72);',
      '  border: var(--px, 3px) solid var(--cream, #f2e4c4);',
      '  box-shadow: 2px 2px 0 rgba(10,8,5,.6); text-decoration: none; }',
      '.snafu-acct__btn:hover { background: var(--red, #b8352b); }',
      '.snafu-acct__btn:focus-visible { outline: 2px solid var(--gold, #e3aa4d);',
      '  outline-offset: 2px; }',
      '.snafu-acct__av { width: 30px; height: 30px; display: block;',
      '  image-rendering: pixelated;',
      '  border: 2px solid var(--cream, #f2e4c4); background: var(--ink, #0c1412); }',
      '.snafu-acct__handle { max-width: 12ch; overflow: hidden;',
      '  text-overflow: ellipsis; white-space: nowrap;',
      '  font-family: var(--body, "Pixelify Sans", sans-serif);',
      '  font-size: 14px; letter-spacing: .02em; }',
      '@media (max-width: 420px) { .snafu-acct__handle { display: none; } }',

      /* modal overlay */
      '.snafu-modal { position: fixed; inset: 0; z-index: 10000; display: none;',
      '  align-items: flex-start; justify-content: center;',
      '  padding: 32px 14px 40px; overflow-y: auto;',
      '  background: rgba(6,8,7,.82); }',
      '.snafu-modal.is-open { display: flex; }',
      '.snafu-panel { position: relative; width: min(440px, 100%);',
      '  background: var(--ink, #0c1412); color: var(--cream, #f2e4c4);',
      '  border: var(--px, 3px) solid var(--cream, #f2e4c4);',
      '  box-shadow: calc(var(--px,3px)*2) calc(var(--px,3px)*2) 0 rgba(10,8,5,.7);',
      '  padding: 22px 20px 24px; }',
      '.snafu-panel__x { position: absolute; top: 6px; right: 8px;',
      '  background: none; border: none; cursor: pointer; padding: 8px;',
      '  min-width: 44px; min-height: 44px;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 14px; color: var(--cream, #f2e4c4); }',
      '.snafu-panel__x:hover { color: var(--red, #b8352b); }',
      '.snafu-panel h2 { font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 15px; line-height: 1.4; margin: 2px 0 4px; }',
      '.snafu-panel__sub { font-family: var(--body, "Pixelify Sans", sans-serif);',
      '  font-size: 14px; color: var(--gold, #e3aa4d); margin: 0 0 16px;',
      '  letter-spacing: .04em; }',

      '.snafu-field { display: block; margin: 0 0 12px; }',
      '.snafu-field > span { display: block; margin: 0 0 5px;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 8px; letter-spacing: .1em; color: var(--cream, #f2e4c4);',
      '  text-transform: uppercase; }',
      '.snafu-field input { width: 100%; min-height: 46px; padding: 10px 12px;',
      '  font-family: var(--body, "Pixelify Sans", sans-serif); font-size: 16px;',
      '  color: var(--ink, #0c1412); background: var(--cream, #f2e4c4);',
      '  border: var(--px, 3px) solid var(--cream, #f2e4c4); border-radius: 0; }',
      '.snafu-field input:focus-visible { outline: 3px solid var(--gold, #e3aa4d);',
      '  outline-offset: 2px; }',
      '.snafu-hint { font-family: var(--body, "Pixelify Sans", sans-serif);',
      '  font-size: 12px; color: rgba(242,228,196,.6); margin: -7px 0 12px; }',

      /* avatar picker */
      '.snafu-avpick { margin: 4px 0 14px; }',
      '.snafu-avgrid { display: grid; grid-template-columns: repeat(6, 1fr);',
      '  gap: 7px; }',
      '@media (max-width: 360px) { .snafu-avgrid { grid-template-columns: repeat(4, 1fr); } }',
      '.snafu-avgrid button { padding: 0; cursor: pointer; background: var(--ink, #0c1412);',
      '  border: var(--px, 3px) solid transparent; aspect-ratio: 1; }',
      '.snafu-avgrid img { width: 100%; height: 100%; display: block;',
      '  image-rendering: pixelated; }',
      '.snafu-avgrid button[aria-pressed="true"] { border-color: var(--red, #b8352b); }',
      '.snafu-avgrid button:focus-visible { outline: 2px solid var(--gold, #e3aa4d);',
      '  outline-offset: 1px; }',

      '.snafu-submit { width: 100%; min-height: 50px; margin-top: 4px; cursor: pointer;',
      '  font-family: var(--display, "Press Start 2P", monospace);',
      '  font-size: 11px; letter-spacing: .06em;',
      '  color: var(--ink, #0c1412); background: var(--gold, #e3aa4d);',
      '  border: var(--px, 3px) solid var(--cream, #f2e4c4);',
      '  box-shadow: 3px 3px 0 rgba(10,8,5,.6); }',
      '.snafu-submit:hover { background: var(--cream, #f2e4c4); }',
      '.snafu-submit:disabled { opacity: .6; cursor: default; }',
      '.snafu-submit:focus-visible { outline: 3px solid var(--gold, #e3aa4d);',
      '  outline-offset: 2px; }',

      '.snafu-err { min-height: 0; margin: 2px 0 12px; padding: 0;',
      '  font-family: var(--body, "Pixelify Sans", sans-serif); font-size: 14px;',
      '  color: #ffd7cf; }',
      '.snafu-err:not(:empty) { padding: 8px 10px;',
      '  border-left: var(--px, 3px) solid var(--red, #b8352b);',
      '  background: rgba(184,53,43,.18); }',

      '.snafu-swap { margin: 16px 0 0; text-align: center;',
      '  font-family: var(--body, "Pixelify Sans", sans-serif); font-size: 14px;',
      '  color: rgba(242,228,196,.75); }',
      '.snafu-swap button { background: none; border: none; cursor: pointer;',
      '  font: inherit; color: var(--gold, #e3aa4d); text-decoration: underline;',
      '  padding: 4px; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---- header account entry ---------------------------------
  var acct = document.createElement('div');
  acct.className = 'snafu-acct';
  document.body.appendChild(acct);

  function renderHeader(user) {
    if (user === undefined) { acct.innerHTML = ''; return; } // unknown: show nothing yet
    if (user) {
      acct.innerHTML =
        '<a class="snafu-acct__btn" href="/account/">' +
          '<img class="snafu-acct__av" alt="" src="' + Auth.avatarSrc(user.avatar_id) + '">' +
          '<span class="snafu-acct__handle">' + escapeHtml(user.handle) + '</span>' +
        '</a>';
    } else {
      acct.innerHTML =
        '<button class="snafu-acct__btn" type="button">SIGN IN</button>';
      acct.querySelector('button').addEventListener('click', function () { open('login'); });
    }
  }
  Auth.subscribe(renderHeader);

  // ---- modal ------------------------------------------------
  var mode = 'login';            // 'login' | 'signup'
  var pickedAvatar = 1;
  var lastFocus = null;
  var overlay = document.createElement('div');
  overlay.className = 'snafu-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  function open(which) {
    mode = which === 'signup' ? 'signup' : 'login';
    lastFocus = document.activeElement;
    render();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var first = overlay.querySelector('input');
    if (first) first.focus();
  }
  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function render() {
    var isSignup = mode === 'signup';
    var html = '<div class="snafu-panel">' +
      '<button class="snafu-panel__x" type="button" aria-label="Close">×</button>' +
      '<h2>' + (isSignup ? 'JOIN SNAFU' : 'SIGN IN') + '</h2>' +
      '<p class="snafu-panel__sub">' +
        (isSignup ? 'One step. You are in.' : 'Welcome back.') + '</p>' +
      '<div class="snafu-err" role="alert"></div>' +
      '<form novalidate>';

    if (isSignup) {
      html +=
        '<label class="snafu-field"><span>Handle</span>' +
          '<input name="handle" autocomplete="username" autocapitalize="none" ' +
          'spellcheck="false" maxlength="20" inputmode="text"></label>' +
        '<p class="snafu-hint">3–20 chars. Letters, numbers, underscore.</p>' +
        '<label class="snafu-field"><span>Email</span>' +
          '<input name="email" type="email" autocomplete="email" ' +
          'autocapitalize="none" spellcheck="false"></label>' +
        '<label class="snafu-field"><span>Password</span>' +
          '<input name="password" type="password" autocomplete="new-password"></label>' +
        '<p class="snafu-hint">10+ chars. Cannot contain your handle or email.</p>' +
        '<div class="snafu-avpick"><span class="snafu-field" ' +
          'style="margin:0"><span>Pick an avatar</span></span>' +
          '<div class="snafu-avgrid"></div></div>' +
        '<button class="snafu-submit" type="submit">CREATE ACCOUNT</button>';
    } else {
      html +=
        '<label class="snafu-field"><span>Handle or Email</span>' +
          '<input name="identifier" autocomplete="username" ' +
          'autocapitalize="none" spellcheck="false"></label>' +
        '<label class="snafu-field"><span>Password</span>' +
          '<input name="password" type="password" autocomplete="current-password"></label>' +
        '<button class="snafu-submit" type="submit">SIGN IN</button>';
    }

    html += '</form>' +
      '<p class="snafu-swap">' +
        (isSignup
          ? 'Already have an account? <button type="button" data-mode="login">Sign in</button>'
          : 'New here? <button type="button" data-mode="signup">Create an account</button>') +
      '</p></div>';

    overlay.innerHTML = html;

    overlay.querySelector('.snafu-panel__x').addEventListener('click', close);
    overlay.querySelector('.snafu-swap button').addEventListener('click', function () {
      open(this.getAttribute('data-mode'));
    });
    overlay.querySelector('form').addEventListener('submit', onSubmit);

    if (isSignup) buildAvatarGrid();
  }

  function buildAvatarGrid() {
    var grid = overlay.querySelector('.snafu-avgrid');
    pickedAvatar = 1;
    // render 12 immediately with local placeholders; label from API when ready
    function draw(names) {
      var out = '';
      for (var i = 1; i <= 12; i++) {
        var name = (names && names[i - 1] && names[i - 1].name) || ('Avatar ' + i);
        out += '<button type="button" aria-pressed="' + (i === 1) + '" ' +
          'data-id="' + i + '" aria-label="' + escapeHtml(name) + '" title="' +
          escapeHtml(name) + '"><img alt="" src="' + Auth.avatarSrc(i) + '"></button>';
      }
      grid.innerHTML = out;
      var btns = grid.querySelectorAll('button');
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener('click', function () {
          pickedAvatar = Number(this.getAttribute('data-id'));
          for (var k = 0; k < btns.length; k++) {
            btns[k].setAttribute('aria-pressed',
              btns[k] === this ? 'true' : 'false');
          }
        });
      }
    }
    draw(null);
    Auth.getAvatars().then(function (list) {
      if (list && list.length && overlay.querySelector('.snafu-avgrid') === grid) draw(list);
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var btn = form.querySelector('.snafu-submit');
    var errEl = overlay.querySelector('.snafu-err');
    errEl.textContent = '';
    btn.disabled = true;

    var done = function () { btn.disabled = false; };
    var fail = function (err) {
      errEl.textContent = (err && err.message) || 'Something went wrong. Try again.';
      done();
    };

    if (mode === 'signup') {
      Auth.register({
        handle: form.handle.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        avatar_id: pickedAvatar
      }).then(function () { done(); close(); }, fail);
    } else {
      Auth.login(form.identifier.value.trim(), form.password.value)
        .then(function () { done(); close(); }, fail);
    }
  }

  // ---- utils ------------------------------------------------
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.SNAFU_openAuth = open;
})();
