(function () {
  const CART_KEY = "snafu.cart";
  const items = Array.isArray(window.GOODS) ? window.GOODS : [];
  const mount = document.getElementById("relics");
  const empty = document.getElementById("empty");

  if (!items.length) {
    if (empty) empty.hidden = false;
    return;
  }

  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const money = (n) => "$" + Number(n).toLocaleString("en-US");

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function writeCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }
  function addToCart(item) {
    const cart = readCart();
    const found = cart.find(x => x.id === item.id);
    if (found) { found.qty = (found.qty || 1) + 1; }
    else { cart.push({ id: item.id, name: item.name, price: item.price, qty: 1, source: "goods" }); }
    writeCart(cart);
  }

  function relicCard(item) {
    const stats = [
      ["EDITION",  item.edition],
      ["MATERIAL", item.materials],
      ["DROP",     item.drop],
      ["MADE IN",  item.madeIn],
      ["SIZES",    item.sizes]
    ].filter(([, v]) => v);

    const media = item.img
      ? `<div class="relic-media"><img src="${esc(item.img)}" alt="${esc(item.name)}"></div>`
      : `<div class="relic-media placeholder" aria-label="${esc(item.name)}"></div>`;

    return `
      <article class="relic ${item.sold ? "sold" : ""}" data-id="${esc(item.id)}">
        ${media}
        <div class="relic-body">
          <div class="relic-eyebrow">SNAFU ORIGINAL</div>
          <h3 class="relic-name">${esc(item.name)}</h3>
          <div class="relic-price">${money(item.price)}</div>
          <dl class="relic-stats">
            ${stats.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}
          </dl>
          ${item.note ? `<p class="relic-note">${esc(item.note)}</p>` : ""}
          <div class="relic-actions">
            <button class="btn buy" data-id="${esc(item.id)}" ${item.sold ? "disabled" : ""}>BUY NOW</button>
            <button class="btn secondary pack" data-id="${esc(item.id)}" ${item.sold ? "disabled" : ""}>ADD TO PACK</button>
          </div>
        </div>
      </article>
    `;
  }

  mount.innerHTML = items.map(relicCard).join("");

  mount.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const item = items.find(x => x.id === id);
    if (!item || item.sold) return;

    addToCart(item);

    if (btn.classList.contains("buy")) {
      window.location.href = "/checkout";
    } else if (btn.classList.contains("pack")) {
      const original = btn.textContent;
      btn.textContent = "ADDED";
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
    }
  });
})();
