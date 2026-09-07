/* ============================================================
   SNAFU — forum data layer (window.SNAFUForum)
   Shared by the Field Notes discussion desk, the thread page,
   and /admin/. Fetch + helpers only; each page owns its markup.

   Every call goes through SNAFUAuth.api, so there is exactly one
   place in the codebase that knows the API base and sends
   credentials:'include'. Do not add a bare fetch() here.

   HOUSE RULES BAKED IN
   - Downvotes are off server-side. vote() only ever sends 1 or 0,
     and voteButton() renders a single up arrow. If a thread ever
     comes back with downvotes_enabled true, that's a server change
     and a deliberate UI change here — not an accident.
   - Stars are for saving things (js/snafu-stars.js). Comments and
     threads get votes. The two never mix.
   ============================================================ */
(function () {
  if (window.SNAFUForum) return;
  var Auth = window.SNAFUAuth;
  if (!Auth) return; // auth layer must load first

  // ---- endpoints --------------------------------------------
  function getTake()            { return Auth.api('GET', '/take'); }
  function setSide(side)        { return Auth.api('POST', '/take/side', { side: side }); }

  function getThreads(section)  {
    return Auth.api('GET', '/threads?section=' + encodeURIComponent(section));
  }
  function createThread(fields) { return Auth.api('POST', '/threads', fields); }
  function getThread(id)        { return Auth.api('GET', '/threads/' + encodeURIComponent(id)); }

  function addComment(threadId, body, parentId) {
    var payload = { body: body };
    // parent_id is omitted entirely for a top-level comment
    if (parentId != null) payload.parent_id = parentId;
    return Auth.api('POST', '/threads/' + encodeURIComponent(threadId) + '/comments', payload);
  }
  function editComment(id, body) {
    return Auth.api('PATCH', '/comments/' + encodeURIComponent(id), { body: body });
  }
  function deleteComment(id) {
    return Auth.api('DELETE', '/comments/' + encodeURIComponent(id));
  }

  // value: 1 sets the upvote, 0 clears it. Never anything else.
  function vote(targetType, targetId, value) {
    return Auth.api('POST', '/votes', {
      target_type: targetType,
      target_id: targetId,
      value: value ? 1 : 0
    });
  }
  function report(targetType, targetId, reason) {
    return Auth.api('POST', '/reports', {
      target_type: targetType,
      target_id: targetId,
      reason: reason || undefined
    });
  }

  // ---- admin ------------------------------------------------
  var admin = {
    reports: function () { return Auth.api('GET', '/admin/reports'); },
    resolveReport: function (id, status) {
      return Auth.api('PATCH', '/admin/reports/' + encodeURIComponent(id), { status: status });
    },
    patchThread: function (id, patch) {
      return Auth.api('PATCH', '/admin/threads/' + encodeURIComponent(id), patch);
    },
    banUser: function (handle, days) {
      return Auth.api('PATCH', '/admin/users/' + encodeURIComponent(handle), { ban_days: days });
    },
    postTake: function (body) { return Auth.api('POST', '/admin/take', { body: body }); }
  };

  // ---- auth gate --------------------------------------------
  // requireAuth('Sign up to take a side') resolves with the user —
  // immediately if signed in, otherwise after the modal completes.
  // Only the LATEST intent is held: tap AGREE, close the modal, tap
  // NAH, then sign in, and you get NAH. The abandoned promise simply
  // never settles, which is the same as nothing happening.
  var pending = null;
  var wasSignedIn = undefined;

  function requireAuth(context) {
    if (Auth.current) return Promise.resolve(Auth.current);
    return Auth.me().then(function (user) {
      if (user) return user;
      return new Promise(function (resolve) {
        pending = resolve;
        if (window.SNAFU_openAuth) {
          window.SNAFU_openAuth('signup', { context: context || 'Sign up to join in' });
        }
      });
    });
  }

  Auth.subscribe(function (user) {
    if (user === undefined) return;
    var signedIn = !!user;
    var became = signedIn && wasSignedIn === false;
    wasSignedIn = signedIn;
    if (became && pending) {
      var resolve = pending;
      pending = null;
      resolve(user);
    } else if (!signedIn) {
      pending = null;
    }
  });

  // ---- rendering helpers ------------------------------------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // "just now" → "6m" → "3h" → "2d" → "16 Jun"
  function relTime(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    if (!then) return '';
    var secs = Math.floor((Date.now() - then) / 1000);
    if (secs < 45) return 'just now';
    if (secs < 3600) return Math.max(1, Math.round(secs / 60)) + 'm';
    if (secs < 86400) return Math.round(secs / 3600) + 'h';
    if (secs < 604800) return Math.round(secs / 86400) + 'd';
    var d = new Date(then);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var stamp = d.getDate() + ' ' + months[d.getMonth()];
    return d.getFullYear() === new Date().getFullYear()
      ? stamp
      : stamp + ' ' + d.getFullYear();
  }

  function plural(n, one, many) {
    return n + ' ' + (Math.abs(n) === 1 ? one : many);
  }

  // avatar + handle + optional role badge
  function byline(handle, avatarId, role) {
    if (!handle) {
      return '<span class="fm-by"><span class="fm-tomb-handle">[removed]</span></span>';
    }
    var out = '<span class="fm-by">' +
      '<img class="fm-av" alt="" src="' + esc(Auth.avatarSrc(avatarId)) + '">' +
      '<span class="fm-handle">' + esc(handle) + '</span>';
    if (role && role !== 'user') out += '<span class="fm-role">' + esc(role) + '</span>';
    return out + '</span>';
  }

  // The one and only vote control. Up arrow + score, nothing else.
  function voteButton(targetType, targetId, score, myVote) {
    var on = Number(myVote) === 1;
    return '<button class="fm-vote' + (on ? ' is-voted' : '') + '" type="button"' +
      ' data-vote-type="' + esc(targetType) + '" data-vote-id="' + esc(targetId) + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' aria-label="' + (on ? 'Remove your upvote' : 'Upvote') + '">' +
      '<span class="fm-vote__a" aria-hidden="true">&#9650;</span>' +
      '<span class="fm-vote__n">' + esc(score == null ? 0 : score) + '</span>' +
      '</button>';
  }

  // Delegated so it survives every re-render. Bind once per container.
  function wireVotes(root, context) {
    if (root.__fmVotes) return;
    root.__fmVotes = true;
    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.fm-vote') : null;
      if (!btn || !root.contains(btn)) return;
      e.preventDefault();
      if (btn.getAttribute('aria-disabled') === 'true') return;

      var type = btn.getAttribute('data-vote-type');
      var id = btn.getAttribute('data-vote-id');
      requireAuth(context || 'Sign up to vote').then(function () {
        var on = btn.classList.contains('is-voted');
        var num = btn.querySelector('.fm-vote__n');
        var before = Number(num.textContent) || 0;

        // optimistic — the arrow has to answer instantly on a phone
        setVoted(btn, !on, before + (on ? -1 : 1));
        btn.setAttribute('aria-disabled', 'true');

        vote(type, id, on ? 0 : 1).then(function (res) {
          setVoted(btn, Number(res.my_vote) === 1, res.score);
          btn.removeAttribute('aria-disabled');
        }, function () {
          setVoted(btn, on, before);   // revert
          btn.removeAttribute('aria-disabled');
        });
      });
    });
  }

  function setVoted(btn, on, score) {
    btn.classList.toggle('is-voted', !!on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Remove your upvote' : 'Upvote');
    var num = btn.querySelector('.fm-vote__n');
    if (num && score != null) num.textContent = score;
  }

  window.SNAFUForum = {
    getTake: getTake,
    setSide: setSide,
    getThreads: getThreads,
    createThread: createThread,
    getThread: getThread,
    addComment: addComment,
    editComment: editComment,
    deleteComment: deleteComment,
    vote: vote,
    report: report,
    admin: admin,
    requireAuth: requireAuth,
    esc: esc,
    relTime: relTime,
    plural: plural,
    byline: byline,
    voteButton: voteButton,
    wireVotes: wireVotes
  };
})();
