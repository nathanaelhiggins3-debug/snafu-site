#!/usr/bin/env node
/* ============================================================
   SNAFU — content manifest generator
   Scans the repo for article/exhibit pages and writes
   content-manifest.json at the repo root. The frontend
   (js/snafu-new.js) compares it against /auth/me's
   previous_visit_at to badge new pieces.

   A page is included IFF its <head> contains:
     <meta name="snafu:published" content="YYYY-MM-DD">

   Everything else is derived (title from <title>, section +
   type from the path). Zero dependencies — Node stdlib only.
   Run: node scripts/gen-manifest.mjs   (also runs on pre-commit)
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Where we look for content. Add dirs here if new content areas appear.
const SCAN_DIRS = ['news', 'gallery'];
const OUT = join(ROOT, 'content-manifest.json');

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

function meta(html, name) {
  // tolerant of attribute order and single/double quotes
  const re = new RegExp(
    '<meta[^>]*name=["\']' + name + '["\'][^>]*content=["\']([^"\']*)["\']',
    'i'
  );
  let m = re.exec(html);
  if (m) return m[1].trim();
  // content-before-name ordering
  const re2 = new RegExp(
    '<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']' + name + '["\']',
    'i'
  );
  m = re2.exec(html);
  return m ? m[1].trim() : null;
}

function titleOf(html) {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  if (!m) return null;
  // strip the "SNAFU. — " / "SNAFU — " house prefix
  return m[1].trim().replace(/^SNAFU\.?\s*[—\-–]\s*/i, '').trim();
}

// URL path for the page's folder: /news/editorial/worn-in/
function pathOf(file) {
  const relDir = relative(ROOT, dirname(file)).split(sep).join('/');
  return '/' + relDir + '/';
}

const items = [];
for (const base of SCAN_DIRS) {
  for (const file of walk(join(ROOT, base))) {
    const html = readFileSync(file, 'utf8');
    const published = meta(html, 'snafu:published');
    if (!published) continue; // opt-in marker; also skips desk/hub pages

    const urlPath = pathOf(file);
    const seg = urlPath.split('/').filter(Boolean); // ['news','editorial','worn-in']
    const area = seg[0];
    const type = area === 'gallery' ? 'exhibit' : 'article';
    const section = area === 'news' ? (seg[1] || 'news') : area;

    items.push({
      path: urlPath,
      title: meta(html, 'snafu:title') || titleOf(html) || urlPath,
      section,
      type,
      published,
      image: meta(html, 'snafu:image') || null,
    });
  }
}

// newest first; stable tiebreak on path
items.sort((a, b) =>
  b.published.localeCompare(a.published) || a.path.localeCompare(b.path)
);

const manifest = { generated: new Date().toISOString(), items };
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`content-manifest.json — ${items.length} item(s)`);
