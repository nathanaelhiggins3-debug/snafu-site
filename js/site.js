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