#!/usr/bin/env python3
"""Build one static page per shop piece: shop/p/<id>/index.html.

Each page is shop/product.html with the piece's own title, description, share image
and Product data baked into the HTML, so link previews (iMessage, Instagram DMs,
Google) show the real name and photo instead of a generic "Piece".
Also writes a 1200x630 share image per piece to assets/og/<id>.jpg.
Run from the repo root (scripts/seo.py runs it for you).
"""
import json, os, re, subprocess, html
from PIL import Image, ImageFilter

SITE = 'https://www.snafu.quest'
CREAM = (242, 228, 196)


def share_image(p):
    out = 'assets/og/%s.jpg' % p['id']
    src = ((p.get('cutouts') or []) + (p.get('images') or []) + [''])[0].lstrip('/')
    if not src or not os.path.exists(src):
        return '/assets/icon-512.png'
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src):
        return '/' + out
    os.makedirs('assets/og', exist_ok=True)
    W, H = 1200, 630
    canvas = Image.new('RGBA', (W, H), CREAM + (255,))
    im = Image.open(src).convert('RGBA')
    im.thumbnail((W - 160, H - 70), Image.LANCZOS)
    x, y = (W - im.width) // 2, (H - im.height) // 2
    if p.get('cutouts'):
        shadow = Image.new('RGBA', im.size, (0, 0, 0, 0))
        shadow.putalpha(im.getchannel('A').point(lambda a: int(a * 0.28)))
        shadow = shadow.filter(ImageFilter.GaussianBlur(14))
        canvas.alpha_composite(shadow, (x, y + 14))
    canvas.alpha_composite(im, (x, y))
    canvas.convert('RGB').save(out, quality=86, optimize=True)
    return '/' + out


def main():
    shop = json.loads(subprocess.run(['node', '-e', 'console.log(JSON.stringify(require("./js/shop-data.js")))'],
                                     capture_output=True, text=True).stdout or '[]')
    tpl = open('shop/product.html', encoding='utf-8').read()
    e = lambda v: html.escape(str(v), quote=True)
    built = []
    for p in shop:
        url = '%s/shop/p/%s/' % (SITE, p['id'])
        img = share_image(p)
        name = p['name']
        bits = [b for b in (p.get('size') and 'Size ' + p['size'] if p.get('size') and 'coming' not in p['size'].lower() else '', p.get('year')) if b]
        desc = '%s. %s. $%s, curated by SNAFU.' % (name, ', '.join(bits), p['price']) if bits else '%s. $%s, curated by SNAFU.' % (name, p['price'])
        if p.get('sold'):
            desc = '%s. Sold. New pieces land at snafu.quest/shop.' % name
        ld = {
            '@context': 'https://schema.org', '@type': 'Product', 'name': name, 'sku': p.get('sku') or p['id'],
            'image': [SITE + img], 'description': desc,
            'brand': {'@type': 'Brand', 'name': p.get('brand') or 'SNAFU'},
            'offers': {'@type': 'Offer', 'url': url, 'priceCurrency': 'USD', 'price': str(p['price']),
                       'availability': 'https://schema.org/' + ('SoldOut' if p.get('sold') else 'InStock'),
                       'itemCondition': 'https://schema.org/UsedCondition'},
        }
        head = '\n  '.join([
            '<!-- seo:start -->',
            '<link rel="canonical" href="%s">' % url,
            '<meta property="og:site_name" content="SNAFU">',
            '<meta property="og:type" content="product">',
            '<meta property="og:title" content="%s">' % e(name),
            '<meta property="og:description" content="%s">' % e(desc),
            '<meta property="og:url" content="%s">' % url,
            '<meta property="og:image" content="%s%s">' % (SITE, img),
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            '<meta property="og:image:alt" content="%s">' % e(name),
            '<meta property="product:price:amount" content="%s">' % p['price'],
            '<meta property="product:price:currency" content="USD">',
            '<meta name="twitter:card" content="summary_large_image">',
            '<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False),
            '<script>window.SNAFU_PRODUCT_ID = %s;</script>' % json.dumps(p['id']),
            '<!-- seo:end -->',
        ])
        s = re.sub(r'<title>.*?</title>', '<title>%s — SNAFU.</title>' % e(name), tpl, count=1, flags=re.S)
        s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % e(desc), s, count=1)
        s = re.sub(r'<!-- seo:start -->.*?<!-- seo:end -->', '', s, flags=re.S)
        s = s.replace('</head>', '  ' + head + '\n</head>', 1)
        os.makedirs('shop/p/%s' % p['id'], exist_ok=True)
        open('shop/p/%s/index.html' % p['id'], 'w', encoding='utf-8').write(s)
        built.append(p)
    print(len(built), 'product pages built')
    return built


if __name__ == '__main__':
    main()
