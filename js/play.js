/* SNAFU - PLAY : jungle snake. Vanilla JS, no libs. */
(function () {
  'use strict';

  // ---- config ----
  var COLS = 20, ROWS = 15, CELL = 32;           // logical: 640x480
  var W = COLS * CELL, H = ROWS * CELL;
  var TICK_START = 140, TICK_STEP = 4, TICK_FLOOR = 60;
  var SWIPE_MIN = 30;
  var HI_KEY = 'snafu.play.snake.hi';
  var LETTERS = 'SNAFU';

  // ---- leaderboard config ----
  var API_BASE = 'https://api.snafu.quest';
  var BOARD_LIMIT = 10;
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // ---- dialect (mirrors css vars, used for canvas draws) ----
  var C = {
    canopy: '#1a3a1e',
    leaf:   '#3d7a3d',
    moss:   '#6b8a3a',
    vine:   '#8fae55',
    bark:   '#4a3520',
    amber:  '#d4a04c',
    cream:  '#f2e4c4',
    ink:    '#0c1412',
    dust:   '#d4c896',
    red:    '#b8352b'
  };

  // ---- state ----
  var STATE = { TITLE: 0, READY: 1, PLAYING: 2, PAUSED: 3, OVER: 4, ENTER_INITIALS: 5 };
  var state = STATE.READY;

  var canvas, ctx, boardImg, boardReady = false;
  var snake, dir, nextDir, egg, score, hi, tickMs, acc, last;

  // ---- leaderboard state ----
  var board = [];              // cached top scores [{rank,initials,score}]
  var boardLoaded = false;     // at least one successful fetch
  var apiOnline = true;        // last network attempt succeeded
  var initials = [0, 0, 0];    // indices into ALPHA
  var initSlot = 0;            // active initials slot 0..2
  var submitting = false;      // POST in flight
  var submitted = false;       // this run already posted
  var lastRank = 0;            // rank achieved this run (0 = none)
  var okBtn = null;            // OK button hit-rect (logical coords)

  function loadHi() {
    var v = 0;
    try { v = parseInt(localStorage.getItem(HI_KEY), 10) || 0; } catch (e) {}
    return v;
  }
  function saveHi(v) {
    try { localStorage.setItem(HI_KEY, String(v)); } catch (e) {}
  }

  // ---- leaderboard network ----
  function fetchBoard() {
    var done = false;
    var to = setTimeout(function () { done = true; }, 4500);
    try {
      fetch(API_BASE + '/scores?limit=' + BOARD_LIMIT)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          clearTimeout(to);
          if (done) return;
          if (d && d.scores) { board = d.scores; boardLoaded = true; apiOnline = true; }
          else { apiOnline = false; }
        })
        .catch(function () { clearTimeout(to); apiOnline = false; });
    } catch (e) { clearTimeout(to); apiOnline = false; }
  }

  function qualifies() {
    if (score <= 0) return false;
    if (!boardLoaded || !apiOnline) return false;      // can't compare/submit offline
    if (board.length < BOARD_LIMIT) return true;
    return score > board[board.length - 1].score;
  }

  function submitScore() {
    if (submitting || submitted) return;
    submitting = true;
    var ini = ALPHA.charAt(initials[0]) + ALPHA.charAt(initials[1]) + ALPHA.charAt(initials[2]);
    try {
      fetch(API_BASE + '/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initials: ini, score: score })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          submitting = false; submitted = true;
          if (d && d.scores) {
            board = d.scores; boardLoaded = true; apiOnline = true;
            lastRank = d.rank || 0;
          } else { apiOnline = false; }
          state = STATE.OVER;
        })
        .catch(function () {
          submitting = false; submitted = true; apiOnline = false;
          state = STATE.OVER;
        });
    } catch (e) {
      submitting = false; submitted = true; apiOnline = false;
      state = STATE.OVER;
    }
  }

  function reset() {
    var cy = Math.floor(ROWS / 2);
    var cx = Math.floor(COLS / 2) - 5;             // left-center
    snake = [
      { x: cx,     y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    tickMs = TICK_START;
    acc = 0;
    spawnEgg();
  }

  function occupied(x, y) {
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
  }

  function spawnEgg() {
    var free = [];
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (!occupied(x, y)) free.push({ x: x, y: y });
      }
    }
    if (!free.length) { egg = null; return; }        // win edge case
    egg = free[(Math.random() * free.length) | 0];
  }

  function setDir(nx, ny) {
    // ignore direct reversal
    if (nx === -dir.x && ny === -dir.y) return;
    nextDir = { x: nx, y: ny };
  }

  function step() {
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // wall death
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return die();
    }
    // self death (tail tip moves away unless we grow; check against all but
    // moving tail only if not eating - simplest: check all current segments)
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        // allow moving into current tail tip which will vacate, unless eating
        if (!(i === snake.length - 1 && !(egg && head.x === egg.x && head.y === egg.y))) {
          return die();
        }
      }
    }

    snake.unshift(head);

    if (egg && head.x === egg.x && head.y === egg.y) {
      score++;
      tickMs = Math.max(TICK_FLOOR, tickMs - TICK_STEP);
      spawnEgg();
    } else {
      snake.pop();
    }
  }

  function die() {
    if (score > hi) { hi = score; saveHi(hi); }
    submitted = false;
    if (qualifies()) {
      initials = [0, 0, 0];
      initSlot = 0;
      submitting = false;
      lastRank = 0;
      state = STATE.ENTER_INITIALS;
    } else {
      state = STATE.OVER;
    }
  }

  // ---- rendering ----
  function drawBoard() {
    if (boardReady) {
      ctx.drawImage(boardImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = C.canopy;
      ctx.fillRect(0, 0, W, H);
      // faint mottling so placeholder isn't dead flat
      ctx.fillStyle = 'rgba(74,53,32,0.18)';
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          if (((x * 7 + y * 13) % 5) === 0) {
            ctx.fillRect(x * CELL + 6, y * CELL + 6, CELL - 12, CELL - 12);
          }
        }
      }
    }
    // subtle grid over the art
    ctx.strokeStyle = 'rgba(12,20,18,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 1; gx < COLS; gx++) {
      ctx.moveTo(gx * CELL + 0.5, 0);
      ctx.lineTo(gx * CELL + 0.5, H);
    }
    for (var gy = 1; gy < ROWS; gy++) {
      ctx.moveTo(0, gy * CELL + 0.5);
      ctx.lineTo(W, gy * CELL + 0.5);
    }
    ctx.stroke();
  }

  // beveled 16-bit cell: dark outline, base fill, top/left highlight, bottom/right shadow
  function bevelCell(x, y, base, hi, lo) {
    var gap = 2;
    var px = x * CELL + gap, py = y * CELL + gap, sz = CELL - gap * 2; // 28
    ctx.fillStyle = C.canopy; ctx.fillRect(px, py, sz, sz);           // outline
    var ix = px + 2, iy = py + 2, is = sz - 4;                        // 24 inner
    ctx.fillStyle = base; ctx.fillRect(ix, iy, is, is);
    ctx.fillStyle = hi;
    ctx.fillRect(ix, iy, is, 4); ctx.fillRect(ix, iy, 4, is);        // top + left
    ctx.fillStyle = lo;
    ctx.fillRect(ix, iy + is - 4, is, 4); ctx.fillRect(ix + is - 4, iy, 4, is); // bottom + right
  }

  function drawLetter(x, y, ch) {
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2 + 1;
    ctx.fillStyle = C.ink;   ctx.fillText(ch, cx + 1, cy + 1);
    ctx.fillStyle = C.cream; ctx.fillText(ch, cx, cy);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function drawEgg() {
    if (!egg) return;
    var px = egg.x * CELL, py = egg.y * CELL;
    // dark shell outline
    ctx.fillStyle = C.canopy;
    ctx.fillRect(px + 8, py + 5, 16, 22);
    ctx.fillRect(px + 6, py + 9, 20, 14);
    // amber body
    ctx.fillStyle = C.amber;
    ctx.fillRect(px + 9, py + 6, 14, 20);
    ctx.fillRect(px + 7, py + 10, 18, 12);
    // lower-right shadow
    ctx.fillStyle = '#a97a2e';
    ctx.fillRect(px + 16, py + 18, 7, 8);
    ctx.fillRect(px + 19, py + 12, 4, 10);
    // top-left highlight
    ctx.fillStyle = C.cream;
    ctx.fillRect(px + 11, py + 9, 4, 4);
  }

  function drawSnake() {
    for (var i = snake.length - 1; i >= 0; i--) {
      var s = snake[i];
      if (i === 0) {
        bevelCell(s.x, s.y, C.moss, C.vine, C.leaf);        // brighter head
        // eyes toward dir
        ctx.fillStyle = C.ink;
        var ex = s.x * CELL, ey = s.y * CELL;
        var ox = dir.x === 0 ? 0 : dir.x * 4;
        var oy = dir.y === 0 ? 0 : dir.y * 4;
        ctx.fillRect(ex + 10 + ox, ey + 10 + oy, 4, 4);
        ctx.fillRect(ex + 18 + ox, ey + 10 + oy, 4, 4);
      } else {
        bevelCell(s.x, s.y, C.leaf, C.moss, C.canopy);
        // one letter per egg eaten, trailing the head, cycling SNAFU
        if (i <= score) {
          drawLetter(s.x, s.y, LETTERS.charAt((i - 1) % 5));
        }
      }
    }
  }

  function drawHUD() {
    ctx.fillStyle = C.cream;
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    var txt = 'SCORE ' + pad(score) + '  HI ' + pad(Math.max(hi, score));
    ctx.textAlign = 'right';
    // shadow
    ctx.fillStyle = C.ink;   ctx.fillText(txt, W - 10 + 2, 10 + 2);
    ctx.fillStyle = C.cream; ctx.fillText(txt, W - 10, 10);
    ctx.textAlign = 'left';
  }

  function overlay(lines) {
    ctx.fillStyle = 'rgba(12,20,18,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var y = H / 2 - (lines.length - 1) * 20;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      ctx.font = l.big ? '24px "Press Start 2P", monospace'
                       : '12px "Press Start 2P", monospace';
      ctx.fillStyle = C.ink;    ctx.fillText(l.t, W / 2 + 2, y + 2);
      ctx.fillStyle = l.c || C.cream; ctx.fillText(l.t, W / 2, y);
      y += l.big ? 40 : 28;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function pad(n) {
    n = String(n);
    while (n.length < 3) n = '0' + n;
    return n;
  }

  // ---- leaderboard rendering ----
  function inRect(p, r) {
    return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }
  function toLogical(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) / r.width * W,
      y: (clientY - r.top) / r.height * H
    };
  }
  var SLOT_CENTERS = [250, 320, 390];
  function pickSlot(px) {
    var best = 0, bd = 1e9;
    for (var i = 0; i < 3; i++) {
      var d = Math.abs(px - SLOT_CENTERS[i]);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function drawBoardList(topY) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px "Press Start 2P", monospace';
    if (!boardLoaded) {
      ctx.fillStyle = C.dust;
      ctx.fillText(apiOnline ? 'LOADING...' : 'BOARD UNAVAILABLE', W / 2, topY);
      return;
    }
    if (board.length === 0) {
      ctx.fillStyle = C.dust;
      ctx.fillText('NO SCORES YET', W / 2, topY);
      return;
    }
    var y = topY;
    for (var i = 0; i < board.length; i++) {
      var row = board[i];
      var r = String(row.rank); while (r.length < 2) r = ' ' + r;
      var line = r + '  ' + row.initials + '  ' + pad(row.score);
      var hot = submitted && row.rank === lastRank;
      ctx.fillStyle = C.ink;               ctx.fillText(line, W / 2 + 1, y + 1);
      ctx.fillStyle = hot ? C.amber : C.cream; ctx.fillText(line, W / 2, y);
      y += 22;
    }
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(12,20,18,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.amber; ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', W / 2, 56);
    ctx.fillStyle = C.cream; ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('SCORE ' + pad(score) + '   HI ' + pad(Math.max(hi, score)), W / 2, 92);
    ctx.fillStyle = C.dust; ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('- TOP 10 -', W / 2, 126);
    drawBoardList(156);
    if (!apiOnline) {
      ctx.fillStyle = C.red; ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('OFFLINE - LOCAL SCORE ONLY', W / 2, 404);
    }
    ctx.fillStyle = C.dust; ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE / TAP TO RETRY', W / 2, 440);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function drawInitials() {
    ctx.fillStyle = 'rgba(12,20,18,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.amber; ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText('NEW HIGH SCORE', W / 2, 64);
    ctx.fillStyle = C.cream; ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('SCORE ' + pad(score), W / 2, 104);
    ctx.fillText('ENTER INITIALS', W / 2, 134);

    ctx.font = '40px "Press Start 2P", monospace';
    var y = 210;
    for (var i = 0; i < 3; i++) {
      var cx = SLOT_CENTERS[i];
      var ch = ALPHA.charAt(initials[i]);
      var active = (i === initSlot);
      ctx.fillStyle = C.ink; ctx.fillText(ch, cx + 2, y + 2);
      ctx.fillStyle = active ? C.amber : C.cream; ctx.fillText(ch, cx, y);
      if (active) { ctx.fillStyle = C.amber; ctx.fillRect(cx - 18, y + 30, 36, 4); }
    }

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = C.dust;
    ctx.fillText('UP/DOWN LETTER  ..  LEFT/RIGHT SLOT  ..  ENTER OK', W / 2, 292);

    var bw = 128, bh = 36, bx = W / 2 - bw / 2, by = 330;
    ctx.fillStyle = C.canopy; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = C.leaf;   ctx.fillRect(bx + 3, by + 3, bw - 6, bh - 6);
    ctx.fillStyle = C.cream;  ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(submitting ? '...' : 'OK', W / 2, by + bh / 2 + 1);
    okBtn = { x: bx, y: by, w: bw, h: bh };

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function render() {
    drawBoard();
    drawEgg();
    drawSnake();
    drawHUD();
    if (state === STATE.READY) {
      overlay([
        { t: 'JUNGLE SNAKE', big: true, c: C.amber },
        { t: 'PRESS SPACE / TAP TO START', c: C.cream }
      ]);
    } else if (state === STATE.PAUSED) {
      overlay([{ t: 'PAUSED', big: true, c: C.amber }]);
    } else if (state === STATE.ENTER_INITIALS) {
      drawInitials();
    } else if (state === STATE.OVER) {
      drawGameOver();
    }
  }

  // ---- loop ----
  function frame(t) {
    if (!last) last = t;
    var dt = t - last;
    last = t;
    if (state === STATE.PLAYING) {
      acc += dt;
      while (acc >= tickMs) {
        acc -= tickMs;
        step();
        if (state !== STATE.PLAYING) break;
      }
    }
    render();
    requestAnimationFrame(frame);
  }

  // ---- input ----
  function start() {
    reset();
    state = STATE.PLAYING;
    last = 0; acc = 0;
    submitted = false;
    lastRank = 0;
    fetchBoard();               // refresh board so it's current at game over
  }

  function primary() {
    if (state === STATE.READY || state === STATE.OVER) start();
    else if (state === STATE.PLAYING) state = STATE.PAUSED;
    else if (state === STATE.PAUSED) state = STATE.PLAYING;
  }

  function onKey(e) {
    var k = e.key.toLowerCase();

    // initials entry captures input first
    if (state === STATE.ENTER_INITIALS) {
      if (k === 'arrowup' || k === 'w') { initials[initSlot] = (initials[initSlot] + 25) % 26; e.preventDefault(); }
      else if (k === 'arrowdown' || k === 's') { initials[initSlot] = (initials[initSlot] + 1) % 26; e.preventDefault(); }
      else if (k === 'arrowleft' || k === 'a') { initSlot = (initSlot + 2) % 3; e.preventDefault(); }
      else if (k === 'arrowright' || k === 'd') { initSlot = (initSlot + 1) % 3; e.preventDefault(); }
      else if (k === 'enter' || k === ' ') { submitScore(); e.preventDefault(); }
      return;
    }

    if (k === 'arrowup' || k === 'w') { setDir(0, -1); e.preventDefault(); }
    else if (k === 'arrowdown' || k === 's') { setDir(0, 1); e.preventDefault(); }
    else if (k === 'arrowleft' || k === 'a') { setDir(-1, 0); e.preventDefault(); }
    else if (k === 'arrowright' || k === 'd') { setDir(1, 0); e.preventDefault(); }
    else if (k === ' ') { primary(); e.preventDefault(); }
    else if (k === 'p') {
      if (state === STATE.PLAYING) state = STATE.PAUSED;
      else if (state === STATE.PAUSED) state = STATE.PLAYING;
      e.preventDefault();
    }
  }

  // touch
  var tStartX = 0, tStartY = 0, tMoved = false, tCount = 0;
  function onTouchStart(e) {
    tCount = e.touches.length;
    if (tCount === 2) {                          // two-finger = pause toggle
      if (state === STATE.PLAYING) state = STATE.PAUSED;
      else if (state === STATE.PAUSED) state = STATE.PLAYING;
      e.preventDefault();
      return;
    }
    var t = e.touches[0];
    tStartX = t.clientX; tStartY = t.clientY; tMoved = false;
  }
  function onTouchMove(e) {
    if (tCount === 2) { e.preventDefault(); return; }
    var t = e.touches[0];
    var dx = t.clientX - tStartX, dy = t.clientY - tStartY;

    if (state === STATE.ENTER_INITIALS) {
      if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
      tMoved = true;
      if (Math.abs(dx) > Math.abs(dy)) initSlot = (initSlot + (dx > 0 ? 1 : 2)) % 3;
      else initials[initSlot] = (initials[initSlot] + (dy > 0 ? 1 : 25)) % 26;
      tStartX = t.clientX; tStartY = t.clientY;
      e.preventDefault();
      return;
    }

    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
    if (Math.abs(dx - dy) === 0) return;         // ignore perfect diagonal
    tMoved = true;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
    tStartX = t.clientX; tStartY = t.clientY;
    e.preventDefault();
  }
  function onTouchEnd(e) {
    if (tCount === 2) return;
    if (state === STATE.ENTER_INITIALS) {
      if (tMoved) return;
      var p = toLogical(tStartX, tStartY);
      if (inRect(p, okBtn)) { submitScore(); }
      else { initSlot = pickSlot(p.x); initials[initSlot] = (initials[initSlot] + 1) % 26; }
      return;
    }
    if (!tMoved) primary();                      // tap = start/retry/pause
  }

  // ---- resize: keep 4:3, fit viewport ----
  function fit() {
    var wrap = canvas.parentNode;
    var maxW = wrap.clientWidth;
    var maxH = Math.min(window.innerHeight * 0.72, maxW * (H / W));
    var w = maxW, h = w * (H / W);
    if (h > maxH) { h = maxH; w = h * (W / H); }
    canvas.style.width = Math.round(w) + 'px';
    canvas.style.height = Math.round(h) + 'px';
  }

  // ---- boot ----
  function boot() {
    canvas = document.getElementById('play-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    hi = loadHi();
    reset();

    boardImg = new Image();
    boardImg.onload = function () { boardReady = true; };
    boardImg.onerror = function () { boardReady = false; };
    boardImg.src = '/assets/play-board.png';

    document.addEventListener('keydown', onKey, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', function (e) {
      if (state === STATE.READY || state === STATE.OVER) { start(); return; }
      if (state === STATE.ENTER_INITIALS) {
        var p = toLogical(e.clientX, e.clientY);
        if (inRect(p, okBtn)) { submitScore(); }
        else { initSlot = pickSlot(p.x); initials[initSlot] = (initials[initSlot] + 1) % 26; }
      }
    });

    window.addEventListener('resize', fit);

    // on-screen d-pad (mobile)
    var dpad = document.getElementById('dpad');
    if (dpad) {
      var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      var dbtns = dpad.querySelectorAll('.dbtn');
      for (var bi = 0; bi < dbtns.length; bi++) {
        (function (btn) {
          btn.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            var d = DIRS[btn.getAttribute('data-dir')];
            if (!d) return;
            if (state === STATE.READY) { start(); setDir(d[0], d[1]); }
            else if (state === STATE.PLAYING) { setDir(d[0], d[1]); }
          });
        })(dbtns[bi]);
      }
    }

    fit();
    fetchBoard();               // prime the board on load
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
