/* ============================================================
   SNAFU — cart (client-side)

   The ONE module that touches cart storage. Nothing else may read
   or write localStorage for the cart — every page goes through
   window.SNAFU_CART.

   Storage key: "snafu_cart"
   Item shape:  { id, qty, source }   source is "shop" | "goods"

   Price, name and image are NEVER stored. They are resolved from the
   catalog at render time (resolve()), so a reprice in shop-data.js or
   goods-data.js lands everywhere immediately and a cart can never show
   a stale number.

   Every mutation fires a "snafu:cart" event so pack badges update live.

   NOTE: checkout is deliberately switched off — Stripe is not connected
   yet. There is no purchase path from the cart on purpose. The cart's
   job right now is to hold items correctly.
   ============================================================ */

(function () {
  var KEY = "snafu_cart";
  var OLD_KEY = "snafu.cart";   // legacy key, migrated away on first load

  /* ---------- storage ---------- */

  function readRaw() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    window.dispatchEvent(new Event("snafu:cart"));
  }

  /* ---------- catalogs ---------- */

  function catalogFor(source) {
    if (source === "goods") return Array.isArray(window.GOODS) ? window.GOODS : [];
    return Array.isArray(window.SNAFU_SHOP) ? window.SNAFU_SHOP : [];
  }

  function findIn(source, id) {
    var list = catalogFor(source);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // Goods ids are g###, shop ids are p###. Used only as a hint — resolve()
  // self-heals from the catalogs if an id is filed under the wrong source.
  function inferSource(id, hinted) {
    if (hinted === "shop" || hinted === "goods") return hinted;
    return /^g/i.test(String(id)) ? "goods" : "shop";
  }

  // Shop pieces are one-of-one. Goods are a production run.
  function isUnique(source) { return source !== "goods"; }

  /* ---------- normalise a catalog entry for display ---------- */

  function normalise(entry, source, qty) {
    var image, sub, href;
    if (source === "goods") {
      image = entry.img || "";
      sub = [entry.edition, entry.drop].filter(Boolean).join("  ·  ");
      href = "/goods/#" + entry.id;
    } else {
      image = entry.coverImage || (entry.images && entry.images[0]) || "";
      sub = [entry.year, entry.origin, entry.size].filter(Boolean).join("  ·  ");
      href = "/shop/product.html?id=" + entry.id;
    }
    return {
      id: entry.id,
      source: source,
      qty: qty,
      name: entry.name || entry.id,
      price: Number(entry.price) || 0,
      image: image,
      sub: sub,
      href: href,
      sold: entry.sold === true,
      unique: isUnique(source)
    };
  }

  /* ---------- public reads ---------- */

  function read() {
    return readRaw().map(function (i) {
      return {
        id: i.id,
        qty: Math.max(1, Number(i.qty) || 1),
        source: inferSource(i.id, i.source)
      };
    });
  }

  // Join the stored cart against the live catalogs. Items whose id is no
  // longer in ANY catalog are dropped — a pulled piece should not linger as
  // a ghost row.
  //
  // Pruning only happens when BOTH catalogs are loaded (i.e. on /cart/).
  // A Shop page has no window.GOODS and a Goods page has no window.SNAFU_SHOP,
  // so on those pages an unresolvable id means "catalog absent", not "item
  // gone" — it stays in storage untouched and is merely not displayed.
  function resolve() {
    var stored = read();
    var out = [];
    var healed = [];
    var changed = false;
    var canPrune = catalogFor("shop").length > 0 && catalogFor("goods").length > 0;

    stored.forEach(function (i) {
      var source = i.source;
      var entry = findIn(source, i.id);
      if (!entry) {
        // filed under the wrong source — look in the other catalog
        var other = source === "goods" ? "shop" : "goods";
        entry = findIn(other, i.id);
        if (entry) { source = other; changed = true; }
      }
      if (!entry) {
        if (canPrune) { changed = true; return; }   // genuinely gone — prune
        healed.push(i);                             // catalog just is not here
        return;
      }
      var qty = isUnique(source) ? 1 : i.qty;
      if (qty !== i.qty) changed = true;
      healed.push({ id: i.id, qty: qty, source: source });
      out.push(normalise(entry, source, qty));
    });

    if (changed) {
      try { localStorage.setItem(KEY, JSON.stringify(healed)); } catch (e) {}
    }
    return out;
  }

  function count() {
    return read().reduce(function (n, i) { return n + i.qty; }, 0);
  }

  // Computed from the catalog, never from stored numbers.
  function subtotal() {
    return resolve().reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function has(id) {
    return read().some(function (i) { return i.id === id; });
  }

  /* ---------- mutations ---------- */

  // add(id, source) or add({id, source}). Shop pieces are one-of-one, so a
  // piece already in the cart stays at qty 1. Goods increment.
  // Returns true if the cart changed.
  function add(id, source) {
    if (id && typeof id === "object") { source = id.source; id = id.id; }
    if (!id) return false;
    source = inferSource(id, source);

    var items = read();
    var found = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) { found = items[i]; break; }

    if (found) {
      if (isUnique(found.source)) return false;   // already claimed
      found.qty = found.qty + 1;
    } else {
      items.push({ id: id, qty: 1, source: source });
    }
    write(items);
    return true;
  }

  function setQty(id, n) {
    var items = read();
    var found = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) { found = items[i]; break; }
    if (!found) return;
    if (isUnique(found.source)) return;           // one-of-one: qty is not a dial
    n = Math.max(1, Number(n) || 1);
    if (n === found.qty) return;
    found.qty = n;
    write(items);
  }

  function remove(id) {
    write(read().filter(function (i) { return i.id !== id; }));
  }

  function clear() { write([]); }

  /* ---------- one-time migration off "snafu.cart" ---------- */

  // The old Shop/Goods cart wrote {id,qty} (and Goods {id,name,price,qty,
  // source}) under "snafu.cart"; the old cart page wrote {id,title,brand,
  // price,image,qty} under "snafu_cart". Fold both into the new shape,
  // dropping every stored price. Idempotent.
  function migrate() {
    var legacy;
    try { legacy = localStorage.getItem(OLD_KEY); } catch (e) { return; }
    if (legacy === null) return;

    var old = [];
    try { old = JSON.parse(legacy) || []; } catch (e) { old = []; }
    if (!Array.isArray(old)) old = [];

    var items = read();
    var seen = {};
    items.forEach(function (i) { seen[i.id] = i; });

    old.forEach(function (i) {
      if (!i || !i.id) return;
      var source = inferSource(i.id, i.source);
      var qty = isUnique(source) ? 1 : Math.max(1, Number(i.qty) || 1);
      if (seen[i.id]) {
        // in both carts — keep the larger qty
        if (qty > seen[i.id].qty) seen[i.id].qty = qty;
      } else {
        var entry = { id: i.id, qty: qty, source: source };
        seen[i.id] = entry;
        items.push(entry);
      }
    });

    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      localStorage.removeItem(OLD_KEY);
    } catch (e) {}
    window.dispatchEvent(new Event("snafu:cart"));
  }

  /* ---------- pack badge ---------- */

  // Any page can carry a badge by marking it up as:
  //   <a data-cart-badge href="/cart/">PACK <span data-cart-count>0</span></a>
  // This keeps the count live on add (via "snafu:cart") instead of only
  // on reload, and it is the only badge wiring on the site.
  function refreshBadges() {
    var n = count();
    var counts = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < counts.length; i++) counts[i].textContent = n;
    var badges = document.querySelectorAll("[data-cart-badge]");
    for (var j = 0; j < badges.length; j++) {
      badges[j].classList.toggle("empty-pack", n === 0);
      badges[j].setAttribute("aria-label", n === 1 ? "Pack: 1 item" : "Pack: " + n + " items");
    }
  }

  window.SNAFU_CART = {
    read: read, resolve: resolve, count: count, subtotal: subtotal,
    has: has, add: add, setQty: setQty, remove: remove, clear: clear,
    refreshBadges: refreshBadges
  };

  migrate();

  window.addEventListener("snafu:cart", refreshBadges);
  // another tab changed the cart
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key === KEY) {
      refreshBadges();
      window.dispatchEvent(new Event("snafu:cart"));
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshBadges);
  } else {
    refreshBadges();
  }
})();
