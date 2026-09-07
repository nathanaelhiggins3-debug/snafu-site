/* ============================================================
   SNAFU — auth data layer (window.SNAFUAuth)
   One shared script for every page. Talks to the live accounts
   backend at api.snafu.quest. UI lives elsewhere; this file is
   fetch + state only.

   CRITICAL: every request sends credentials:'include' so the
   httpOnly session cookie is stored and returned. The cookie is
   never readable from JS by design — session state comes from
   GET /auth/me and nowhere else. Do not stash tokens anywhere.
   ============================================================ */
(function () {
  if (window.SNAFUAuth) return; // one instance per page

  var API = 'https://api.snafu.quest';

  // ---- cached state -----------------------------------------
  var current = undefined;      // undefined = unknown, null = signed out, obj = user
  var mePromise = null;         // single in-flight /auth/me for the page lifetime
  var avatarsPromise = null;    // avatars list is static — cache it too
  var subscribers = [];

  function notify() {
    for (var i = 0; i < subscribers.length; i++) {
      try { subscribers[i](current); } catch (e) {}
    }
  }

  // ---- low-level request ------------------------------------
  // Resolves with parsed JSON on 2xx; rejects with an Error whose
  // .code / .message come from the {error, message?} body so the
  // UI can show message when present.
  function request(method, path, body) {
    var opts = {
      method: method,
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    return fetch(API + path, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok) return data;
        var err = new Error(data.message || data.error || ('HTTP ' + res.status));
        err.code = data.error || 'server_error';
        err.status = res.status;
        throw err;
      });
    }, function () {
      // network-level failure
      var err = new Error('Network error — check your connection and try again.');
      err.code = 'network';
      throw err;
    });
  }

  // ---- client-side validation (mirrors server rules) --------
  // Returns an error string or null. Kept in sync with server so
  // obvious mistakes are caught before a round-trip.
  function validateHandle(handle) {
    if (!handle) return 'Pick a handle.';
    if (handle.length < 3 || handle.length > 20) return 'Handle must be 3–20 characters.';
    if (!/^[A-Za-z0-9_]+$/.test(handle)) return 'Handle can only use letters, numbers, and _.';
    return null;
  }
  function validateEmail(email) {
    if (!email) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'That email does not look right.';
    return null;
  }
  function validatePassword(password, handle, email) {
    if (!password) return 'Set a password.';
    if (password.length < 10) return 'Password must be at least 10 characters.';
    var lower = password.toLowerCase();
    if (handle && lower.indexOf(handle.toLowerCase()) !== -1) {
      return 'Password cannot contain your handle.';
    }
    if (email) {
      var local = String(email).split('@')[0].toLowerCase();
      if (local && lower.indexOf(local) !== -1) {
        return 'Password cannot contain your email name.';
      }
    }
    return null;
  }

  // ---- public API -------------------------------------------

  // Cache /auth/me for the page lifetime. force=true refetches
  // (used after login/register/logout/profile updates).
  function me(force) {
    if (!force && current !== undefined) return Promise.resolve(current);
    if (!force && mePromise) return mePromise;
    mePromise = request('GET', '/auth/me').then(function (data) {
      current = data && data.user ? data.user : null;
      mePromise = null;
      notify();
      return current;
    }, function () {
      // treat any failure as signed-out rather than throwing to UI
      current = null;
      mePromise = null;
      notify();
      return null;
    });
    return mePromise;
  }

  function login(identifier, password) {
    var e = (!identifier ? 'Enter your handle or email.' : null) ||
            (!password ? 'Enter your password.' : null);
    if (e) return Promise.reject(makeErr(e, 'invalid_credentials'));
    return request('POST', '/auth/login', { handle: identifier, password: password })
      .then(applyUser);
  }

  function register(fields) {
    fields = fields || {};
    var handle = (fields.handle || '').trim();
    var email = (fields.email || '').trim();
    var password = fields.password || '';
    var e = validateHandle(handle) ||
            validateEmail(email) ||
            validatePassword(password, handle, email) ||
            (fields.avatar_id == null ? 'Pick an avatar.' : null);
    if (e) return Promise.reject(makeErr(e, 'invalid_input'));
    return request('POST', '/auth/register', {
      handle: handle, email: email, password: password, avatar_id: fields.avatar_id
    }).then(applyUser);
  }

  function logout() {
    return request('POST', '/auth/logout').then(function () {
      current = null;
      notify();
      return true;
    });
  }

  function updateProfile(patch) {
    return request('PATCH', '/auth/me', patch || {}).then(applyUser);
  }

  function getAvatars() {
    if (avatarsPromise) return avatarsPromise;
    avatarsPromise = request('GET', '/auth/avatars').then(function (data) {
      return (data && data.avatars) || [];
    }, function () {
      avatarsPromise = null; // allow retry on failure
      return [];
    });
    return avatarsPromise;
  }

  function getUser(handle) {
    return request('GET', '/users/' + encodeURIComponent(handle)).then(function (data) {
      return (data && data.user) || null;
    });
  }

  // subscribe(fn) -> unsubscribe. Fires immediately with the
  // current value (may be undefined until me() resolves).
  function subscribe(fn) {
    subscribers.push(fn);
    try { fn(current); } catch (e) {}
    return function () {
      var i = subscribers.indexOf(fn);
      if (i !== -1) subscribers.splice(i, 1);
    };
  }

  // Local path to an avatar image by id (1–12). Placeholders for now.
  function avatarSrc(id) {
    var n = Number(id);
    if (!n || n < 1) n = 1;
    return '/assets/avatars/av-' + (n < 10 ? '0' + n : n) + '.png';
  }

  // ---- helpers ----------------------------------------------
  function applyUser(data) {
    current = data && data.user ? data.user : current;
    notify();
    return current;
  }
  function makeErr(msg, code) {
    var err = new Error(msg); err.code = code || 'invalid_input'; return err;
  }

  window.SNAFUAuth = {
    me: me,
    login: login,
    register: register,
    logout: logout,
    updateProfile: updateProfile,
    getAvatars: getAvatars,
    getUser: getUser,
    subscribe: subscribe,
    avatarSrc: avatarSrc,
    validate: {
      handle: validateHandle,
      email: validateEmail,
      password: validatePassword
    },
    get current() { return current; }
  };

  // Kick off the session check once, immediately.
  me();
})();
