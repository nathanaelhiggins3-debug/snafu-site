// snafu.quest – Snake game
'use strict';

// ----- constants -----
var COLS = 20;
var ROWS = 15;
var CELL = 32;
var W = COLS * CELL;
var H = ROWS * CELL;

var C = {
  CANOPY: '#2b4d3b',
  LEAF: '#5a8f4c',
  MOSS: '#8cb26a',
  VINE: '#b4c78a',
  BARK: '#6b4c3b',
  AMBER: '#d4a24e',
  CREAM: '#f4e8c1',
  INK: '#1e2b2b',
  DUST: '#b8b0a0'
};

var FPS = 8;
var DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
var DX = [0,1,0,-1];
var DY = [-1,0,1,0];

var STATE = { TITLE:0, READY:1, PLAYING:2, PAUSED:3, OVER:4, ENTER_INITIALS:5 };
var state = STATE.READY;
var score = 0;
var hi = 0;
var HI_KEY = 'snafu.play.snake.hi';

var snake = [];
var dir = DIRS.RIGHT;
var nextDir = DIRS.RIGHT;
var egg = null;
var grow = 0;

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

// ----- API config -----
var API_BASE = 'https://api.snafu.quest';
var cachedTopScores = null;
var scoresFetchInProgress = false;
var scoresFetchFailed = false;

// ----- initials entry -----
var initials = ['A','A','A'];
var cursorPos = 0;

// ----- helpers -----
function loadHi() {
  var stored = localStorage.getItem(HI_KEY);
  if (stored) {
    var v = parseInt(stored, 10);
    if (!isNaN(v) && v > 0) hi = v;
  }
}
function saveHi() {
  if (hi > 0) localStorage.setItem(HI_KEY, String(hi));
}

// ----- fetch top scores (non‑blocking) -----
function fetchScores() {
  if (scoresFetchInProgress) return;
  scoresFetchInProgress = true;
  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, 3000);

  fetch(API_BASE + '/scores?limit=10', { signal: controller.signal })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.scores) {
        cachedTopScores = data.scores;
        scoresFetchFailed = false;
      } else {
        scoresFetchFailed = true;
      }
    })
    .catch(function() {
      scoresFetchFailed = true;
    })
    .finally(function() {
      clearTimeout(timeoutId);
      scoresFetchInProgress = false;
    });
}

function scoreQualifies(score) {
  if (score <= 0) return false;
  if (!cachedTopScores) return true;
  if (cachedTopScores.length < 10) return true;
  var lowest = cachedTopScores[cachedTopScores.length - 1].score;
  return score > lowest;
}

function submitScore(initialsStr, cb) {
  var payload = { initials: initialsStr, score: score };
  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, 4000);

  fetch(API_BASE + '/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal
  })
  .then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  })
  .then(function(data) {
    if (data.ok && data.scores) {
      cachedTopScores = data.scores;
      cb(null, data.rank);
    } else {
      cb(new Error('Invalid response'));
    }
  })
  .catch(function(err) {
    cb(err);
  })
  .finally(function() {
    clearTimeout(timeoutId);
  });
}

// ----- game logic -----
function initGame() {
  var midX = Math.floor(COLS/2);
  var midY = Math.floor(ROWS/2);
  snake = [
    {x: midX, y: midY},
    {x: midX-1, y: midY},
    {x: midX-2, y: midY}
  ];
  dir = DIRS.RIGHT;
  nextDir = DIRS.RIGHT;
  score = 0;
  grow = 0;
  placeEgg();
}

function placeEgg() {
  var occupied = {};
  snake.forEach(function(s) { occupied[s.x+','+s.y] = true; });
  var free = [];
  for (var y=0; y<ROWS; y++) {
    for (var x=0; x<COLS; x++) {
      if (!occupied[x+','+y]) free.push({x:x, y:y});
    }
  }
  if (free.length === 0) return false;
  var idx = Math.floor(Math.random() * free.length);
  egg = free[idx];
  return true;
}

function step() {
  if (state !== STATE.PLAYING) return;
  dir = nextDir;
  var head = snake[0];
  var newHead = { x: head.x + DX[dir], y: head.y + DY[dir] };
  if (newHead.x < 0) newHead.x = COLS-1;
  if (newHead.x >= COLS) newHead.x = 0;
  if (newHead.y < 0) newHead.y = ROWS-1;
  if (newHead.y >= ROWS) newHead.y = 0;

  for (var i=0; i<snake.length; i++) {
    if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
      die();
      return;
    }
  }

  snake.unshift(newHead);
  var ate = (egg && newHead.x === egg.x && newHead.y === egg.y);
  if (ate) {
    score++;
    if (score > hi) { hi = score; saveHi(); }
    if (!placeEgg()) {
      die();
      return;
    }
    grow++;
  } else {
    if (grow > 0) {
      grow--;
    } else {
      snake.pop();
    }
  }
}

function die() {
  state = STATE.OVER;
  var qualifies = scoreQualifies(score);
  if (qualifies && score > 0) {
    if (cachedTopScores === null) {
      state = STATE.ENTER_INITIALS;
      initials = ['A','A','A'];
      cursorPos = 0;
      if (!scoresFetchInProgress) fetchScores();
      return;
    } else {
      var lowest = cachedTopScores.length < 10 ? 0 : cachedTopScores[cachedTopScores.length-1].score;
      if (score > lowest || cachedTopScores.length < 10) {
        state = STATE.ENTER_INITIALS;
        initials = ['A','A','A'];
        cursorPos = 0;
        return;
      }
    }
  }
  state = STATE.OVER;
}

// ----- input -----
function onKey(e) {
  var key = e.key;
  var ctrl = e.ctrlKey || e.metaKey;
  if (ctrl) return;

  if (state === STATE.ENTER_INITIALS) {
    e.preventDefault();
    if (key === 'ArrowUp') {
      var ch = initials[cursorPos].charCodeAt(0);
      ch = (ch - 65 + 1) % 26 + 65;
      initials[cursorPos] = String.fromCharCode(ch);
    } else if (key === 'ArrowDown') {
      var ch2 = initials[cursorPos].charCodeAt(0);
      ch2 = (ch2 - 65 - 1 + 26) % 26 + 65;
      initials[cursorPos] = String.fromCharCode(ch2);
    } else if (key === 'ArrowLeft') {
      cursorPos = (cursorPos - 1 + 3) % 3;
    } else if (key === 'ArrowRight') {
      cursorPos = (cursorPos + 1) % 3;
    } else if (key === 'Enter') {
      var initialsStr = initials.join('');
      submitScore(initialsStr, function(err) {
        state = STATE.OVER;
        if (err) scoresFetchFailed = true;
        render();
      });
    }
    return;
  }

  if (key === ' ' || key === 'Space') {
    e.preventDefault();
    primary();
    return;
  }
  if (key === 'p' || key === 'P') {
    if (state === STATE.PLAYING) state = STATE.PAUSED;
    else if (state === STATE.PAUSED) state = STATE.PLAYING;
    return;
  }
  var d = -1;
  if (key === 'ArrowUp' || key === 'w' || key === 'W') d = DIRS.UP;
  else if (key === 'ArrowDown' || key === 's' || key === 'S') d = DIRS.DOWN;
  else if (key === 'ArrowLeft' || key === 'a' || key === 'A') d = DIRS.LEFT;
  else if (key === 'ArrowRight' || key === 'd' || key === 'D') d = DIRS.RIGHT;
  if (d >= 0) {
    e.preventDefault();
    if (state === STATE.PLAYING || state === STATE.READY) {
      if ((d === DIRS.UP && dir !== DIRS.DOWN) ||
          (d === DIRS.DOWN && dir !== DIRS.UP) ||
          (d === DIRS.LEFT && dir !== DIRS.RIGHT) ||
          (d === DIRS.RIGHT && dir !== DIRS.LEFT)) {
        nextDir = d;
      }
    }
  }
}

// ----- touch -----
var touchStartX = 0, touchStartY = 0, touchStartTime = 0;
function onTouchStart(e) {
  e.preventDefault();
  var t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartTime = Date.now();
  if (state === STATE.ENTER_INITIALS) {
    handleInitialsTap(t.clientX, t.clientY);
  }
}
function onTouchMove(e) {
  e.preventDefault();
  if (state !== STATE.PLAYING && state !== STATE.READY) return;
  var t = e.touches[0];
  var dx = t.clientX - touchStartX;
  var dy = t.clientY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  var d = -1;
  if (Math.abs(dx) > Math.abs(dy)) {
    d = (dx > 0) ? DIRS.RIGHT : DIRS.LEFT;
  } else {
    d = (dy > 0) ? DIRS.DOWN : DIRS.UP;
  }
  if (state === STATE.PLAYING || state === STATE.READY) {
    if ((d === DIRS.UP && dir !== DIRS.DOWN) ||
        (d === DIRS.DOWN && dir !== DIRS.UP) ||
        (d === DIRS.LEFT && dir !== DIRS.RIGHT) ||
        (d === DIRS.RIGHT && dir !== DIRS.LEFT)) {
      nextDir = d;
    }
  }
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}
function onTouchEnd(e) {
  e.preventDefault();
  if (Date.now() - touchStartTime < 300) {
    if (state !== STATE.ENTER_INITIALS) {
      primary();
    }
  }
}

function handleInitialsTap(clientX, clientY) {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var cx = (clientX - rect.left) * scaleX;
  var cy = (clientY - rect.top) * scaleY;

  function getSlotIndex(x, y) {
    var slotW = 64, slotH = 64, gap = 40;
    var totalW = 3*slotW + 2*gap;
    var startX = (W - totalW) / 2;
    var startY = 220;
    for (var i=0; i<3; i++) {
      var sx = startX + i*(slotW+gap);
      var sy = startY;
      if (x >= sx && x <= sx+slotW && y >= sy && y <= sy+slotH) {
        return i;
      }
    }
    var okX = W/2 - 40, okY = 340, okW = 80, okH = 40;
    if (x >= okX && x <= okX+okW && y >= okY && y <= okY+okH) {
      return -2;
    }
    return -1;
  }
  var idx = getSlotIndex(cx, cy);
  if (idx >= 0 && idx < 3) {
    var ch = initials[idx].charCodeAt(0);
    ch = (ch - 65 + 1) % 26 + 65;
    initials[idx] = String.fromCharCode(ch);
    cursorPos = idx;
  } else if (idx === -2) {
    var initialsStr = initials.join('');
    submitScore(initialsStr, function(err) {
      state = STATE.OVER;
      if (err) scoresFetchFailed = true;
      render();
    });
  }
}

function primary() {
  if (state === STATE.TITLE) {
    state = STATE.READY;
    initGame();
    render();
    return;
  }
  if (state === STATE.READY) {
    state = STATE.PLAYING;
    return;
  }
  if (state === STATE.OVER) {
    state = STATE.READY;
    initGame();
    render();
    return;
  }
  if (state === STATE.PAUSED) {
    state = STATE.PLAYING;
    return;
  }
}

// ----- rendering -----
function render() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.CANOPY;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = C.MOSS;
  ctx.lineWidth = 0.5;
  for (var x=0; x<=W; x+=CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (var y=0; y<=H; y+=CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  snake.forEach(function(seg, i) {
    var color = (i === 0) ? C.VINE : C.LEAF;
    ctx.fillStyle = color;
    ctx.fillRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2);
  });

  if (egg) {
    ctx.fillStyle = C.AMBER;
    ctx.beginPath();
    ctx.arc(egg.x*CELL+CELL/2, egg.y*CELL+CELL/2, CELL/2-2, 0, 2*Math.PI);
    ctx.fill();
  }

  ctx.fillStyle = C.CREAM;
  ctx.font = '16px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('SCORE ' + score, 8, 8);
  ctx.textAlign = 'right';
  ctx.fillText('HI ' + hi, W-8, 8);

  if (state === STATE.TITLE) {
    overlay(['SNAFU', 'PRESS SPACE']);
  } else if (state === STATE.READY) {
    overlay(['READY?', 'PRESS SPACE']);
  } else if (state === STATE.PAUSED) {
    overlay(['PAUSED']);
  } else if (state === STATE.OVER) {
    renderGameOver();
  } else if (state === STATE.ENTER_INITIALS) {
    renderInitialsEntry();
  }
}

function overlay(lines) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.CREAM;
  ctx.font = '24px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  var lineHeight = 48;
  var startY = H/2 - (lines.length-1)*lineHeight/2;
  lines.forEach(function(line, i) {
    ctx.fillText(line, W/2, startY + i*lineHeight);
  });
}

function renderGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '24px "Press Start 2P"';
  ctx.fillStyle = C.CREAM;
  ctx.fillText('GAME OVER', W/2, 30);
  ctx.font = '16px "Press Start 2P"';
  ctx.fillStyle = C.AMBER;
  ctx.fillText('SCORE: ' + score, W/2, 80);
  ctx.fillStyle = C.CREAM;
  ctx.fillText('HI: ' + hi, W/2, 110);

  if (cachedTopScores && cachedTopScores.length > 0) {
    var y0 = 160;
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = C.CREAM;
    ctx.textAlign = 'left';
    var xLeft = 80;
    ctx.fillText('RANK', xLeft, y0);
    ctx.fillText('INITIALS', xLeft+80, y0);
    ctx.fillText('SCORE', xLeft+200, y0);
    var rowHeight = 22;
    var maxRows = Math.min(cachedTopScores.length, 10);
    for (var i=0; i<maxRows; i++) {
      var entry = cachedTopScores[i];
      var y = y0 + (i+1)*rowHeight;
      ctx.fillStyle = C.CREAM;
      ctx.fillText(String(entry.rank), xLeft, y);
      ctx.fillText(entry.initials, xLeft+80, y);
      ctx.fillText(String(entry.score), xLeft+200, y);
    }
    if (scoresFetchFailed) {
      ctx.fillStyle = C.AMBER;
      ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText('OFFLINE - scores may be stale', W/2, y0 + (maxRows+1)*rowHeight + 10);
    }
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = C.DUST;
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('Leaderboard unavailable', W/2, 160);
  }

  ctx.fillStyle = C.CREAM;
  ctx.font = '14px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS SPACE / TAP TO RETRY', W/2, H-30);
}

function renderInitialsEntry() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = C.CREAM;
  ctx.font = '20px "Press Start 2P"';
  ctx.fillText('ENTER INITIALS', W/2, 40);

  var slotW = 64, slotH = 64, gap = 40;
  var totalW = 3*slotW + 2*gap;
  var startX = (W - totalW) / 2;
  var startY = 160;
  for (var i=0; i<3; i++) {
    var x = startX + i*(slotW+gap);
    var y = startY;
    ctx.strokeStyle = (i === cursorPos) ? C.AMBER : C.DUST;
    ctx.lineWidth = (i === cursorPos) ? 4 : 2;
    ctx.strokeRect(x, y, slotW, slotH);
    ctx.fillStyle = C.INK;
    ctx.fillRect(x+2, y+2, slotW-4, slotH-4);
    ctx.fillStyle = C.CREAM;
    ctx.font = '36px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials[i], x+slotW/2, y+slotH/2);
  }

  var okX = W/2 - 40, okY = startY + slotH + 30, okW = 80, okH = 36;
  ctx.fillStyle = C.BARK;
  ctx.fillRect(okX, okY, okW, okH);
  ctx.strokeStyle = C.CREAM;
  ctx.lineWidth = 2;
  ctx.strokeRect(okX, okY, okW, okH);
  ctx.fillStyle = C.CREAM;
  ctx.font = '14px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OK', W/2, okY+okH/2);

  ctx.fillStyle = C.DUST;
  ctx.font = '10px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('ARROWS: change letter, move cursor', W/2, okY+okH+20);
  ctx.fillText('ENTER: submit', W/2, okY+okH+40);

  if (scoresFetchFailed) {
    ctx.fillStyle = C.AMBER;
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('OFFLINE - submission may fail', W/2, 130);
  }
}

// ----- game loop -----
function loop() {
  step();
  render();
}

// ----- boot -----
function boot() {
  loadHi();
  initGame();
  state = STATE.READY;
  fetchScores();
  document.addEventListener('keydown', onKey);
  canvas.addEventListener('touchstart', onTouchStart);
  canvas.addEventListener('touchmove', onTouchMove);
  canvas.addEventListener('touchend', onTouchEnd);
  setInterval(loop, 1000/FPS);
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}