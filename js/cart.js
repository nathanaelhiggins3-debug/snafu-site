/* ============================================================
   SNAFU — cart (mock, client-side)
   One source of truth for the shopping cart. Stores items in
   localStorage under "snafu_cart" so they persist across page
   loads and navigation. Checkout itself is real: the cart POSTs
   to the Netlify function, which builds the Stripe session from the
   server-side catalog. Every change fires a "snafu:cart" event so the
   header badge (built in site.js) updates live.

   An item looks like:
     { id, title, brand, price, image, qty }
   price may be a string like "$2,400" — priceToNumber() parses it.
   ============================================================ */

(function () {
  var KEY = "snafu_cart";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (e) { return []; }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    // Tell the page (header badge, cart view) the cart changed.
    window.dispatchEvent(new Event("snafu:cart"));
  }

  function priceToNumber(p) {
    if (typeof p === "number") return p;
    var n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function count() {
    return read().reduce(function (n, i) { return n + (i.qty || 1); }, 0);
  }

  function subtotal() {
    return read().reduce(function (s, i) {
      return s + priceToNumber(i.price) * (i.qty || 1);
    }, 0);
  }

  function has(id) {
    return read().some(function (i) { return i.id === id; });
  }

  // Add an item. Shop pieces are one-of-one, so a piece already in
  // the cart is left at qty 1 (no duplicate). Returns true if newly added.
  function add(item) {
    var items = read();
    if (has(item.id)) return false;
    items.push({
      id: item.id,
      title: item.title,
      brand: item.brand || "",
      price: item.price,
      image: item.image || null,
      qty: 1
    });
    write(items);
    return true;
  }

  function remove(id) {
    write(read().filter(function (i) { return i.id !== id; }));
  }

  function clear() { write([]); }

  window.SNAFU_CART = {
    read: read, count: count, subtotal: subtotal,
    has: has, add: add, remove: remove, clear: clear,
    priceToNumber: priceToNumber
  };
})();
