(function () {
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
      <article class="relic ${item.sold ? "sold" : ""}" data-id="${esc(item.id)}" style="position:relative">
        <button class="snafu-star snafu-star--corner" data-star-type="product"
                data-star-ref="/goods/#${esc(item.id)}" data-star-title="${esc(item.name)}"
                data-star-image="${esc(item.img || "")}" data-star-section="goods"></button>
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
            <button class="btn buy pending" data-id="${esc(item.id)}" disabled
                    title="Checkout is not open yet — add it to your pack and it will keep.">CHECKOUT SOON</button>
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

    if (!btn.classList.contains("pack")) return;

    // Goods are a production run, so this increments. js/cart.js owns storage
    // and fires "snafu:cart", which keeps the pack badge live.
    window.SNAFU_CART.add(item.id, "goods");

    const original = btn.textContent;
    btn.textContent = "ADDED";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
  });
})();
