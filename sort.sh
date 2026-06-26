#!/usr/bin/env bash
#
# sort.sh — SNAFU photo dropbox sorter
#
# Sweeps renamed photos out of ~/Desktop/snafu-dropbox/ and files them into
# ~/Desktop/snafu/img/ based on the filename's trailing ".code".
#
# Expected filename format:
#   [product or description] [shot type].[code].jpg
#
#   code      : shop | goods | news | gal
#   shot type : (shop/goods only) hero front back detail label wear worn
#               (optional for news/gal)
#
# Examples:
#   beltrami shearling hero.shop.jpg  -> img/shop/beltrami-shearling/beltrami-shearling-01-hero.jpg
#   redaction tee front.goods.jpg     -> img/goods/redaction-tee/redaction-tee-02-front.jpg
#   june east side recap opener.news.jpg -> img/news/june-east-side-recap-opener.jpg
#   issue 001 cover.gal.jpg           -> img/gallery/issue-001-cover.jpg
#
# Safe to run repeatedly and on an empty dropbox. Never overwrites: a clashing
# target gets a "-dupe" suffix and a warning. Bad files are left in the dropbox.

set -euo pipefail

DROPBOX="$HOME/Desktop/snafu-dropbox"
IMG="$HOME/Desktop/snafu/img"

# ---- shot-type priority (shop/goods) ---------------------------------------
# Number prefix that orders shots within a product folder.
shot_num() {
  case "$1" in
    hero)   echo "01" ;;
    front)  echo "02" ;;
    back)   echo "03" ;;
    detail) echo "04" ;;
    label)  echo "05" ;;
    wear)   echo "06" ;;
    worn)   echo "07" ;;
    *)      echo ""   ;;   # empty => unknown shot type
  esac
}

# ---- helpers ---------------------------------------------------------------
# slug: lowercase, runs of non-alphanumerics -> single hyphen, trim hyphens.
slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

# Print a non-colliding path: if $1 exists, insert "-dupe" before the
# extension; keep adding "-dupe" until the name is free. Returns via stdout.
free_path() {
  local target="$1"
  local dir base ext stem
  dir="$(dirname "$target")"
  base="$(basename "$target")"
  ext="${base##*.}"
  stem="${base%.*}"
  while [ -e "$dir/$stem.$ext" ]; do
    stem="$stem-dupe"
  done
  printf '%s' "$dir/$stem.$ext"
}

# ---- counters & logs -------------------------------------------------------
shop_photos=0
goods_photos=0
news_photos=0
gal_photos=0
shop_products=""   # newline-separated slugs; uniq-counted in the summary
goods_products=""
skips=()      # bad files left in the dropbox
notes=()      # files that were filed, but worth a heads-up (e.g. -dupe)

warn() { skips+=("$1"); }     # skipped, still in dropbox
note() { notes+=("$1"); }     # filed, with a caveat

# ---- preflight -------------------------------------------------------------
if [ ! -d "$DROPBOX" ]; then
  echo "✗ dropbox not found: $DROPBOX" >&2
  exit 1
fi

shopt -s nullglob
files=()
for f in "$DROPBOX"/*; do
  [ -f "$f" ] || continue                         # skip subdirectories
  [ "$(basename "$f")" = ".DS_Store" ] && continue
  files+=("$f")
done

if [ ${#files[@]} -eq 0 ]; then
  echo "dropbox empty, nothing to do"
  exit 0
fi

# ---- main loop -------------------------------------------------------------
for f in "${files[@]}"; do
  base="$(basename "$f")"

  # Must be a .jpg / .jpeg (case-insensitive).
  ext="${base##*.}"
  ext_lc="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"
  if [ "$ext_lc" != "jpg" ] && [ "$ext_lc" != "jpeg" ]; then
    warn "$base (not a .jpg file)"
    continue
  fi

  rest="${base%.*}"            # strip .jpg  -> "name shot.code"

  # Must carry a ".code" segment before the extension.
  if [[ "$rest" != *.* ]]; then
    warn "$base (no .code before .jpg)"
    continue
  fi

  code="$(printf '%s' "${rest##*.}" | tr '[:upper:]' '[:lower:]')"
  desc="${rest%.*}"            # everything before .code

  # Description can't be empty.
  if [ -z "${desc// /}" ]; then
    warn "$base (empty description)"
    continue
  fi

  case "$code" in
    shop|goods)
      # Last word is the shot type; the rest is the product name.
      shot="${desc##* }"
      product="${desc% *}"
      shot_lc="$(printf '%s' "$shot" | tr '[:upper:]' '[:lower:]')"

      # Needs at least "<product> <shot>".
      if [ "$product" = "$desc" ]; then
        warn "$base (missing product name before shot type \"$shot_lc\")"
        continue
      fi

      num="$(shot_num "$shot_lc")"
      if [ -z "$num" ]; then
        warn "$base (unknown shot type \"$shot_lc\")"
        continue
      fi

      slug="$(slugify "$product")"
      if [ -z "$slug" ]; then
        warn "$base (product name slugs to empty)"
        continue
      fi

      destdir="$IMG/$code/$slug"
      mkdir -p "$destdir"
      target="$destdir/$slug-$num-$shot_lc.jpg"
      final="$(free_path "$target")"
      [ "$final" != "$target" ] && note "$base (target existed, saved as $(basename "$final"))"
      mv "$f" "$final"

      if [ "$code" = "shop" ]; then
        shop_photos=$((shop_photos + 1)); shop_products="$shop_products$slug
"
      else
        goods_photos=$((goods_photos + 1)); goods_products="$goods_products$slug
"
      fi
      ;;

    news|gal)
      # No shot type required; slug the whole description.
      slug="$(slugify "$desc")"
      if [ -z "$slug" ]; then
        warn "$base (description slugs to empty)"
        continue
      fi

      if [ "$code" = "gal" ]; then
        destdir="$IMG/gallery"
      else
        destdir="$IMG/news"
      fi
      mkdir -p "$destdir"
      target="$destdir/$slug.jpg"
      final="$(free_path "$target")"
      [ "$final" != "$target" ] && note "$base (target existed, saved as $(basename "$final"))"
      mv "$f" "$final"

      if [ "$code" = "gal" ]; then
        gal_photos=$((gal_photos + 1))
      else
        news_photos=$((news_photos + 1))
      fi
      ;;

    *)
      warn "$base (unknown code \"$code\" — expected shop/goods/news/gal)"
      ;;
  esac
done

# ---- summary ---------------------------------------------------------------
echo
plural() { [ "$1" -eq 1 ] && printf '%s' "$2" || printf '%s' "$3"; }
uniq_count() { printf '%s' "$1" | grep -c . | tr -d ' '; }

if [ "$shop_photos" -gt 0 ]; then
  n=$(uniq_count "$(printf '%s' "$shop_products" | sort -u)")
  echo "✓ filed $shop_photos shop $(plural "$shop_photos" photo photos) into $n $(plural "$n" product products)"
fi
if [ "$goods_photos" -gt 0 ]; then
  n=$(uniq_count "$(printf '%s' "$goods_products" | sort -u)")
  echo "✓ filed $goods_photos goods $(plural "$goods_photos" photo photos) into $n $(plural "$n" product products)"
fi
if [ "$news_photos" -gt 0 ]; then
  echo "✓ filed $news_photos news $(plural "$news_photos" photo photos)"
fi
if [ "$gal_photos" -gt 0 ]; then
  echo "✓ filed $gal_photos gallery $(plural "$gal_photos" photo photos)"
fi

if [ ${#notes[@]} -gt 0 ]; then
  for w in "${notes[@]}"; do
    echo "⚠ note: $w"
  done
fi
if [ ${#skips[@]} -gt 0 ]; then
  for w in "${skips[@]}"; do
    echo "⚠ skipped: $w"
  done
fi

total=$((shop_photos + goods_photos + news_photos + gal_photos))
if [ "$total" -eq 0 ] && [ ${#skips[@]} -gt 0 ]; then
  echo
  echo "nothing filed — fix the warnings above and re-run."
fi
