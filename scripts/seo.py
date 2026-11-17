#!/usr/bin/env python3
"""SNAFU SEO pass. Run from the repo root:  python3 scripts/seo.py

- Adds canonical, Open Graph and Twitter tags to every public page (between SEO markers,
  so re-running replaces them instead of stacking).
- Adds Article structured data (JSON-LD) to published editorials (pages with snafu:published).
- Writes sitemap.xml (public, indexable pages only) and robots.txt.
Pages with <meta name="robots" content="noindex..."> are skipped from the sitemap.
"""
import json, os, re, subprocess, html
from datetime import date

SITE = 'https://www.snafu.quest'  # the live host (snafu.quest redirects here)
SKIP = ('admin/', 'desk/', 'looks-desk/', 'account/', 'cart/', 'checkout/', 'shop/cart.html', 'shop/deals.html', 'goods/', 'shop/product.html')  # product pages are per-?id; listed in the sitemap below
DEFAULT_IMG = '/assets/icon-512.png'
START, END = '<!-- seo:start -->', '<!-- seo:end -->'


def meta(s, name):
    m = re.search(r'<meta\s+name="%s"\s+content="([^"]*)"' % re.escape(name), s)
    return html.unescape(m.group(1)) if m else ''


def url_for(path):
    p = '/' + path
    if p.endswith('index.html'):
        p = p[: -len('index.html')]
    return SITE + p


def main():
    files = subprocess.run(['git', 'ls-files', '*.html'], capture_output=True, text=True).stdout.split()
    sitemap = []
    for f in files:
        if f.startswith(SKIP) or '/' in f and f.split('/')[0] in ('Claude outputs',):
            continue
        s = open(f, encoding='utf-8').read()
        if '<head' not in s:
            continue
        noindex = bool(re.search(r'name="robots"\s+content="[^"]*noindex', s))
        t = re.search(r'<title>(.*?)</title>', s, re.S)
        title = html.unescape(t.group(1).strip()) if t else 'SNAFU'
        desc = meta(s, 'description') or 'SNAFU: a universe for culture, clothing and community. Los Angeles.'
        img = meta(s, 'snafu:image') or DEFAULT_IMG
        published = meta(s, 'snafu:published')
        url = url_for(f)
        is_article = f.startswith('news/editorial/') and f != 'news/editorial/index.html' and published
        e = lambda v: html.escape(v, quote=True)
        tags = [
            START,
            '<link rel="canonical" href="%s">' % url,
            '<meta property="og:site_name" content="SNAFU">',
            '<meta property="og:type" content="%s">' % ('article' if is_article else 'website'),
            '<meta property="og:title" content="%s">' % e(title),
            '<meta property="og:description" content="%s">' % e(desc),
            '<meta property="og:url" content="%s">' % url,
            '<meta property="og:image" content="%s%s">' % (SITE, img),
            '<meta name="twitter:card" content="summary_large_image">',
        ]
        if is_article:
            author = meta(s, 'author') or 'Nathanael Higgins'
            tags.append('<meta property="article:published_time" content="%s">' % published)
            tags.append('<meta name="author" content="%s">' % e(author))
            ld = {
                '@context': 'https://schema.org', '@type': 'Article',
                'headline': re.sub(r'^SNAFU\.\s*—\s*', '', title), 'description': desc,
                'image': [SITE + img], 'datePublished': published,
                'dateModified': meta(s, 'snafu:updated') or published,
                'author': {'@type': 'Person', 'name': author, 'url': SITE + '/about/'},
                'publisher': {'@type': 'Organization', 'name': 'SNAFU', 'logo': {'@type': 'ImageObject', 'url': SITE + DEFAULT_IMG}},
                'mainEntityOfPage': url,
            }
            tags.append('<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False))
        tags.append(END)
        block = '\n  '.join(tags)
        if START in s:
            s = re.sub(re.escape(START) + r'.*?' + re.escape(END), block, s, flags=re.S)
        else:
            s = s.replace('</head>', '  ' + block + '\n</head>', 1)
        open(f, 'w', encoding='utf-8').write(s)
        if not noindex and f != 'shop/product.html':
            sitemap.append((url, published or date.today().isoformat(), is_article))

    # one sitemap entry per live shop piece
    shop = subprocess.run(['node', '-e', 'console.log(JSON.stringify(require("./js/shop-data.js")))'], capture_output=True, text=True).stdout
    for p in json.loads(shop or '[]'):
        if not p.get('sold'):
            sitemap.append((SITE + '/shop/product.html?id=' + p['id'], p.get('added') or date.today().isoformat(), False))
    sitemap.sort(key=lambda x: (x[0] != SITE + '/', not x[2], x[0]))
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, d, art in sitemap:
        out.append('  <url><loc>%s</loc><lastmod>%s</lastmod></url>' % (u, d))
    out.append('</urlset>')
    open('sitemap.xml', 'w').write('\n'.join(out) + '\n')
    open('robots.txt', 'w').write(
        'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /desk/\nDisallow: /looks-desk/\nDisallow: /account/\nDisallow: /api/\n\n'
        'Sitemap: %s/sitemap.xml\n' % SITE)
    print(len(sitemap), 'urls in sitemap')


if __name__ == '__main__':
    main()
