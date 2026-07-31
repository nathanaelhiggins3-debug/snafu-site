(function () {
  if (!document.getElementById('snafu-topnav-styles')) {
    const style = document.createElement('style');
    style.id = 'snafu-topnav-styles';
    style.textContent = `
      .snafu-topnav {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 100;
        display: flex;
        justify-content: center;
        padding: 14px 0 10px;
        pointer-events: none;
      }
      .snafu-topnav a {
        pointer-events: auto;
        font-family: var(--display, 'Press Start 2P', monospace);
        font-size: clamp(16px, 2.4vw, 22px);
        line-height: 1;
        letter-spacing: .04em;
        color: var(--cream, #f2e4c4);
        text-decoration: none;
        padding: 8px 14px;
        /* No box — the heavy multi-layer text-shadow below provides enough
           stroke to keep the wordmark legible on any background. */
        text-shadow:
          calc(var(--px, 3px) * -1) 0 0 var(--ink, #0c1412),
          var(--px, 3px) 0 0 var(--ink, #0c1412),
          0 calc(var(--px, 3px) * -1) 0 var(--ink, #0c1412),
          0 var(--px, 3px) 0 var(--ink, #0c1412),
          var(--px, 3px) var(--px, 3px) 0 var(--red, #b8352b),
          calc(var(--px, 3px) * 2) calc(var(--px, 3px) * 2) 0 var(--ink, #0c1412),
          calc(var(--px, 3px) * 4) calc(var(--px, 3px) * 5) 0 rgba(10,8,5,.45);
        transition: transform 80ms steps(2, end);
      }
      .snafu-topnav a:hover {
        transform: translateY(calc(var(--px, 3px) * -1));
      }
      body.has-snafu-topnav { padding-top: 56px; }
      @media (max-width: 600px) {
        body.has-snafu-topnav { padding-top: 48px; }
      }
    `;
    document.head.appendChild(style);
  }
  if (!document.querySelector('.snafu-topnav')) {
    const nav = document.createElement('nav');
    nav.className = 'snafu-topnav';
    nav.innerHTML = '<a href="/" aria-label="SNAFU home">SNAFU.</a>';
    document.body.prepend(nav);
    document.body.classList.add('has-snafu-topnav');
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
      '.snafu-crt-btn { position: fixed; right: 10px; bottom: 10px;',
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
      '  var(--gold, #e3aa4d); outline-offset: 2px; }'
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
    btn.setAttribute('aria-label', 'Toggle CRT mode');

    function apply() {
      document.body.classList.toggle('snafu-crt-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    btn.addEventListener('click', function () {
      on = !on;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      apply();
    });
    apply();
    document.body.appendChild(btn);
  }
})();