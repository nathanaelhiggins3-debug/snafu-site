const crypto = require('crypto');
const fallback = require('../js/shop-data.js');

const COOKIE = 'snafu_looks_desk';
const PATH = 'snafu/catalog.json';
const MAX_AGE = 60 * 60 * 8;
const fields = ['name','brand','year','origin','size','material','color','closure','condition','authNote','note'];
function send(res, status, body, headers) { res.statusCode=status; res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','no-store'); Object.entries(headers||{}).forEach(([k,v])=>res.setHeader(k,v)); res.end(JSON.stringify(body)); }
function storeId() { return String(process.env.BLOB_READ_WRITE_TOKEN||'').split('_')[3]||''; }
function blobUrl() { return 'https://' + storeId() + '.public.blob.vercel-storage.com/' + PATH; }
function headers(extra) { return { authorization:'Bearer '+process.env.BLOB_READ_WRITE_TOKEN, 'x-vercel-blob-store-id':storeId(), 'x-api-version':'12', 'x-api-blob-request-id':crypto.randomUUID(), 'x-api-blob-request-attempt':'0', ...extra }; }
function body(req) { return new Promise((resolve,reject)=>{let value='';req.on('data',x=>value+=x);req.on('end',()=>{try{resolve(JSON.parse(value||'{}'));}catch{reject(Error('Invalid request.'));}});req.on('error',reject);}); }
function cookie(req) { const m=String(req.headers.cookie||'').match(/(?:^|;\s*)snafu_looks_desk=([^;]+)/); return m?decodeURIComponent(m[1]):''; }
function sign(value) { return crypto.createHmac('sha256',process.env.LOOKS_EDITOR_SESSION_SECRET||'').update(value).digest('base64url'); }
function editor(req) { const [expires,sig]=cookie(req).split('.'), expected=sign(expires||''); return !!(expires&&sig&&process.env.LOOKS_EDITOR_SESSION_SECRET&&Number(expires)>Date.now()&&sig.length===expected.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))); }
function sameOrigin(req) { if(!req.headers.origin)return true;try{return new URL(req.headers.origin).host===req.headers.host;}catch{return false;} }
async function catalog() { if(!process.env.BLOB_READ_WRITE_TOKEN)return fallback;try{const r=await fetch(blobUrl()+'?cache=0');if(!r.ok)return fallback;const data=await r.json();return Array.isArray(data.shop)?data.shop:fallback;}catch{return fallback;} }
function valid(items) { if(!Array.isArray(items)||items.length>200)return null;return items.map(item=>{if(!item||!/^p\d+$/.test(String(item.id||'')))return null;const next={...item}; for(const key of fields){next[key]=String(next[key]||'').trim();if(next[key].length>5000)return null;} next.price=Number(next.price);next.originalPrice=next.originalPrice===''||next.originalPrice==null?null:Number(next.originalPrice);next.sold=!!next.sold;if(!Number.isFinite(next.price)||next.price<0||!Number.isFinite(next.originalPrice??0))return null;return next;}).includes(null)?null:items; }
module.exports=async(req,res)=>{try{if(req.method==='GET')return send(res,200,{shop:await catalog()});if(req.method!=='POST')return send(res,405,{message:'Method not allowed.'});if(!sameOrigin(req)||!editor(req))return send(res,401,{message:'Please sign in again.'});if(!process.env.BLOB_READ_WRITE_TOKEN)return send(res,503,{message:'Looks storage has not been connected yet.'});const data=await body(req),shop=valid(data.shop);if(!shop)return send(res,400,{message:'The shop data is not valid.'});const r=await fetch('https://vercel.com/api/blob?pathname='+encodeURIComponent(PATH),{method:'PUT',headers:headers({'content-type':'application/json','x-add-random-suffix':'0','x-allow-overwrite':'1','x-content-type':'application/json','x-cache-control-max-age':'0'}),body:JSON.stringify({shop},null,2)});if(!r.ok)return send(res,502,{message:'Shop storage could not save this edit.'});return send(res,200,{shop});}catch{return send(res,500,{message:'The Shop Desk could not complete that request.'});}};
