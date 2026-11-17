// SNAFU Gallery feed — posts API.
// GET  /api/posts                      → { posts }  (public, newest first)
// POST /api/posts  {action:'login'}     → sets the Desk cookie (same password as the old Looks Desk)
// POST /api/posts?upload=1  (raw image body, editor only) → { photo: {src,w,h} }
// POST /api/posts  {action:'create'|'update'|'delete'|'move'|'logout'}
// Storage: Vercel Blob (snafu/posts.json + snafu/posts/*.jpg). Falls back to content/posts.json.
const crypto = require('crypto');
const seed = require('../content/posts.json');

const COOKIE = 'snafu_looks_desk';
const MAX_AGE = 60 * 60 * 24 * 30; // stay signed in on your phone for 30 days
const LIST_PATH = 'snafu/posts.json';
const BLOB_API = 'https://vercel.com/api/blob';
const MAX_IMAGE = 4 * 1024 * 1024;

function send(res, status, body, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  Object.entries(headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(body));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('That file is too large.')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJson(req) {
  const buf = await readBody(req, 100000);
  try { return JSON.parse(buf.toString('utf8') || '{}'); } catch { throw new Error('Invalid request.'); }
}
function cookie(req) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function sign(v) { return crypto.createHmac('sha256', process.env.LOOKS_EDITOR_SESSION_SECRET || '').update(v).digest('base64url'); }
function isEditor(req) {
  const [expires, sig] = cookie(req).split('.');
  if (!expires || !sig || !process.env.LOOKS_EDITOR_SESSION_SECRET || Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
function editorCookie() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  return COOKIE + '=' + encodeURIComponent(expires + '.' + sign(expires)) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + MAX_AGE;
}
function validPassword(pw) {
  const expected = process.env.LOOKS_EDITOR_PASSWORD || '';
  if (!expected || typeof pw !== 'string') return false;
  const a = Buffer.from(pw), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function sameOrigin(req) {
  if (!req.headers.origin) return true;
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
function storeId() { return String(process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3] || ''; }
function blobHeaders(extra) {
  return {
    authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN,
    'x-vercel-blob-store-id': storeId(),
    'x-api-version': '12',
    'x-api-blob-request-id': crypto.randomUUID(),
    'x-api-blob-request-attempt': '0',
    ...extra,
  };
}
async function blobPut(pathname, body, contentType, overwrite) {
  const r = await fetch(BLOB_API + '?pathname=' + encodeURIComponent(pathname), {
    method: 'PUT',
    headers: blobHeaders({
      'content-type': contentType,
      'x-content-type': contentType,
      'x-add-random-suffix': '0',
      'x-allow-overwrite': overwrite ? '1' : '0',
      'x-cache-control-max-age': overwrite ? '0' : '31536000',
    }),
    body,
  });
  if (!r.ok) throw new Error('Storage could not save that.');
  return r.json();
}

const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
function cleanPhoto(p) {
  if (!p || typeof p !== 'object') return null;
  const src = clean(p.src, 400);
  if (!/^(\/assets\/|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/)/i.test(src)) return null;
  return { src, w: Math.max(1, Math.round(Number(p.w) || 1)), h: Math.max(1, Math.round(Number(p.h) || 1)) };
}
function cleanPost(input, id) {
  const photos = (Array.isArray(input.photos) ? input.photos : []).map(cleanPhoto).filter(Boolean).slice(0, 10);
  if (!photos.length) return null;
  return {
    id,
    date: clean(input.date, 10) || new Date().toISOString().slice(0, 10),
    title: clean(input.title, 120),
    caption: clean(input.caption, 600),
    note: clean(input.note, 3000),
    photos,
  };
}

async function loadPosts() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seed.posts;
  try {
    const r = await fetch('https://' + storeId() + '.public.blob.vercel-storage.com/' + LIST_PATH + '?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return seed.posts;
    const data = await r.json();
    return Array.isArray(data.posts) ? data.posts : seed.posts;
  } catch { return seed.posts; }
}
async function savePosts(posts) {
  await blobPut(LIST_PATH, JSON.stringify({ posts }, null, 1), 'application/json', true);
  return posts;
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      res.setHeader('CDN-Cache-Control', 'no-store');
      return send(res, 200, { posts: await loadPosts() });
    }
    if (req.method !== 'POST') return send(res, 405, { message: 'Method not allowed.' }, { Allow: 'GET, POST' });
    if (!sameOrigin(req)) return send(res, 403, { message: 'This request came from another site.' });

    const url = new URL(req.url, 'http://x');
    if (url.searchParams.get('upload')) {
      if (!isEditor(req)) return send(res, 401, { message: 'Please sign in again.' });
      if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 503, { message: 'Photo storage is not connected in Vercel yet.' });
      const type = String(req.headers['content-type'] || '');
      if (!/^image\/(jpeg|png|webp)$/.test(type)) return send(res, 400, { message: 'Send a JPEG, PNG or WebP.' });
      const buf = await readBody(req, MAX_IMAGE);
      const ext = type.split('/')[1].replace('jpeg', 'jpg');
      const out = await blobPut('snafu/posts/' + Date.now().toString(36) + '-' + crypto.randomBytes(5).toString('hex') + '.' + ext, buf, type, false);
      return send(res, 200, { photo: { src: out.url, w: Number(url.searchParams.get('w')) || 1, h: Number(url.searchParams.get('h')) || 1 } });
    }

    const body = await readJson(req);
    if (body.action === 'login') {
      if (!process.env.LOOKS_EDITOR_PASSWORD) return send(res, 503, { message: 'The Desk password is not set in Vercel yet.' });
      if (!validPassword(body.password)) return send(res, 401, { message: 'That password is not right.' });
      return send(res, 200, { posts: await loadPosts() }, { 'Set-Cookie': editorCookie() });
    }
    if (body.action === 'logout') return send(res, 200, { ok: true }, { 'Set-Cookie': COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
    if (body.action === 'check') return send(res, isEditor(req) ? 200 : 401, isEditor(req) ? { posts: await loadPosts() } : { message: 'Signed out.' });
    if (!isEditor(req)) return send(res, 401, { message: 'Please sign in again.' });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 503, { message: 'Storage is not connected in Vercel yet.' });

    let posts = (await loadPosts()).slice();
    const idx = posts.findIndex(p => p.id === String(body.id || ''));

    if (body.action === 'create') {
      const post = cleanPost(body.post || {}, 'p' + Date.now().toString(36));
      if (!post) return send(res, 400, { message: 'Add at least one photo.' });
      posts.unshift(post);
    } else if (body.action === 'update') {
      if (idx < 0) return send(res, 404, { message: 'That post is gone.' });
      const post = cleanPost({ ...posts[idx], ...(body.post || {}) }, posts[idx].id);
      if (!post) return send(res, 400, { message: 'A post needs at least one photo.' });
      posts[idx] = post;
    } else if (body.action === 'delete') {
      if (idx < 0) return send(res, 404, { message: 'That post is gone.' });
      posts.splice(idx, 1);
    } else if (body.action === 'move') {
      if (idx < 0) return send(res, 404, { message: 'That post is gone.' });
      const to = Math.max(0, Math.min(posts.length - 1, idx + (body.dir === 'up' ? -1 : 1)));
      const [p] = posts.splice(idx, 1); posts.splice(to, 0, p);
    } else {
      return send(res, 400, { message: 'Unknown action.' });
    }
    return send(res, 200, { posts: await savePosts(posts) });
  } catch (error) {
    return send(res, 500, { message: error && error.message ? error.message : 'The Desk could not finish that.' });
  }
};
