// SNAFU first-look list. POST { email } → stored in Vercel Blob (snafu/subscribers.json).
// The Desk password can read the list: GET /api/subscribe (signed-in Desk cookie only).
const crypto = require('crypto');

const PATH = 'snafu/subscribers.json';
const COOKIE = 'snafu_looks_desk';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function storeId() { return String(process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3] || ''; }
function readJson(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 2000) { reject(new Error('Too large.')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { reject(new Error('Invalid request.')); } });
    req.on('error', reject);
  });
}
function isEditor(req) {
  const m = String(req.headers.cookie || '').match(/(?:^|;\s*)snafu_looks_desk=([^;]+)/);
  const [expires, sig] = (m ? decodeURIComponent(m[1]) : '').split('.');
  if (!expires || !sig || !process.env.LOOKS_EDITOR_SESSION_SECRET || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', process.env.LOOKS_EDITOR_SESSION_SECRET).update(expires).digest('base64url');
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
async function load() {
  try {
    const r = await fetch('https://' + storeId() + '.public.blob.vercel-storage.com/' + PATH + '?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d.subscribers) ? d.subscribers : [];
  } catch { return []; }
}
async function save(list) {
  const r = await fetch('https://vercel.com/api/blob?pathname=' + encodeURIComponent(PATH), {
    method: 'PUT',
    headers: {
      authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN,
      'x-vercel-blob-store-id': storeId(),
      'x-api-version': '12',
      'x-api-blob-request-id': crypto.randomUUID(),
      'x-api-blob-request-attempt': '0',
      'content-type': 'application/json',
      'x-content-type': 'application/json',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-cache-control-max-age': '0',
    },
    body: JSON.stringify({ subscribers: list }),
  });
  if (!r.ok) throw new Error('Could not save.');
}

module.exports = async (req, res) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 503, { message: 'Sign-ups open soon.' });
    if (req.method === 'GET') {
      if (!isEditor(req)) return send(res, 401, { message: 'Sign in to the Desk first.' });
      const list = await load();
      return send(res, 200, { count: list.length, subscribers: list });
    }
    if (req.method !== 'POST') return send(res, 405, { message: 'Method not allowed.' });
    const body = await readJson(req);
    if (body.website) return send(res, 200, { ok: true }); // honeypot: bots fill hidden fields
    const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return send(res, 400, { message: 'That email doesn’t look right.' });
    const list = await load();
    if (!list.some(s => s.email === email)) {
      list.push({ email, at: new Date().toISOString(), from: String(body.from || '').slice(0, 80) });
      await save(list);
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { message: 'Something went wrong. Try again.' });
  }
};
