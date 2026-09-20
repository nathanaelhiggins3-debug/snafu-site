const crypto = require('crypto');
const fallback = require('../content/looks.json');

const COOKIE = 'snafu_looks_desk';
const MAX_AGE = 60 * 60 * 8;
const BLOB_PATH = 'snafu/looks.json';
const BLOB_API = 'https://vercel.com/api/blob';
const textFields = ['title', 'caption', 'brands', 'stylingIdeas', 'explanation', 'credits'];

function send(res, status, body, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  Object.entries(headers || {}).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}
function json(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 100000) reject(new Error('Request is too large.')); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid request.')); } });
    req.on('error', reject);
  });
}
function cookie(req, name) {
  const match = String(req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : '';
}
function sign(value) { return crypto.createHmac('sha256', process.env.LOOKS_EDITOR_SESSION_SECRET || '').update(value).digest('base64url'); }
function isEditor(req) {
  const value = cookie(req, COOKIE); const [expires, signature] = value.split('.');
  if (!expires || !signature || !process.env.LOOKS_EDITOR_SESSION_SECRET || Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function editorCookie() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  return COOKIE + '=' + encodeURIComponent(expires + '.' + sign(expires)) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + MAX_AGE;
}
function validPassword(password) {
  const expected = process.env.LOOKS_EDITOR_PASSWORD || '';
  if (!expected || typeof password !== 'string') return false;
  const a = Buffer.from(password), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function validate(looks) {
  if (!Array.isArray(looks) || looks.length > 100) return null;
  const cleaned = looks.map(look => {
    if (!look || typeof look !== 'object' || !/^\d{2}$/.test(String(look.id || '')) || !Array.isArray(look.photos)) return null;
    const item = { id: String(look.id), cover: String(look.cover || ''), photos: look.photos.map(String).slice(0, 20) };
    if (!item.cover || item.cover.length > 140 || item.photos.some(photo => photo.length > 140)) return null;
    for (const field of textFields) { item[field] = String(look[field] || '').trim(); if (item[field].length > 5000) return null; }
    return item;
  });
  return cleaned.includes(null) ? null : cleaned;
}
async function storedLooks() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fallback.looks;
  try {
    const response = await fetch(blobUrl() + '?cache=0', { cache: 'no-store' });
    if (!response.ok) return fallback.looks;
    const data = await response.json();
    return Array.isArray(data.looks) ? data.looks : fallback.looks;
  } catch {
    return fallback.looks;
  }
}
function blobStoreId() {
  return String(process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3] || '';
}
function blobUrl() {
  return 'https://' + blobStoreId() + '.public.blob.vercel-storage.com/' + BLOB_PATH;
}
function blobHeaders(extra) {
  return {
    authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN,
    'x-vercel-blob-store-id': blobStoreId(),
    'x-api-version': '12',
    'x-api-blob-request-id': crypto.randomUUID(),
    'x-api-blob-request-attempt': '0',
    ...extra,
  };
}
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') return send(res, 200, { looks: await storedLooks() });
    if (req.method !== 'POST') return send(res, 405, { message: 'Method not allowed.' }, { Allow: 'GET, POST' });
    if (!isSameOrigin(req)) return send(res, 403, { message: 'This request came from another site.' });
    const body = await json(req);
    if (body.action === 'login') {
      if (!process.env.LOOKS_EDITOR_PASSWORD) return send(res, 503, { message: 'The Desk password is not configured in Vercel yet.' });
      if (!validPassword(body.password)) return send(res, 401, { message: 'That password is not right.' });
      return send(res, 200, { looks: await storedLooks() }, { 'Set-Cookie': editorCookie() });
    }
    if (body.action === 'logout') return send(res, 200, { ok: true }, { 'Set-Cookie': COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
    if (body.action !== 'save' || !isEditor(req)) return send(res, 401, { message: 'Please sign in again.' });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 503, { message: 'Looks storage has not been connected yet.' });
    const looks = validate(body.looks);
    if (!looks) return send(res, 400, { message: 'The Looks data is not valid.' });
    const response = await fetch(BLOB_API + '?pathname=' + encodeURIComponent(BLOB_PATH), {
      method: 'PUT',
      headers: blobHeaders({
        'content-type': 'application/json',
        'x-add-random-suffix': '0',
        'x-allow-overwrite': '1',
        'x-content-type': 'application/json',
        'x-cache-control-max-age': '0',
      }),
      body: JSON.stringify({ looks: looks }, null, 2),
    });
    if (!response.ok) return send(res, 502, { message: 'Looks storage could not save this edit.' });
    return send(res, 200, { looks: looks });
  } catch (error) {
    return send(res, 500, { message: 'The Looks Desk could not complete that request.' });
  }
};
