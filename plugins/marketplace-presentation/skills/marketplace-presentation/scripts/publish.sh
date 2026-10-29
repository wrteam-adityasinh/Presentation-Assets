#!/usr/bin/env bash
# Commit a product folder, tag it, push, update the registry and README, and check every CDN URL.
#
# Usage:
#   bash publish.sh <repo> <product> <version> "<commit message>" "<title>" "<style>" "<live link>" "<owner>"
# Example:
#   bash publish.sh ~/presentation-assets bondly v1.0.0 "Add Bondly presentation" \
#     "Bondly dating & social app UI kit" "scrapbook" "https://www.figma.com/design/..." "Dimple"
set -euo pipefail

REPO="${1/#\~/$HOME}"; PRODUCT="$2"; VERSION="$3"; MSG="$4"; TITLE="$5"; STYLE="$6"; LIVE="$7"; OWNER="$8"
TAG="$PRODUCT-$VERSION"
HERE="$(cd "$(dirname "$0")" && pwd)"

cd "$REPO"
# Assets always go to main. The plugin branch is protected and needs a pull request.
git checkout -q main
git pull -q --rebase origin main
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then echo "Tag $TAG already exists: use the next version"; exit 1; fi

# Only final presentation images may be published: NN-name.jpg, nothing else
# (no code, no captured screens, no PNGs, no .env). Stop if anything else is in the folder.
if [ ! -d "$PRODUCT" ]; then echo "No folder $PRODUCT in $REPO"; exit 1; fi
BAD="$(find "$PRODUCT" -mindepth 1 \( -type d -o -type f \) ! -regex "$PRODUCT/[0-9][0-9]-[a-z0-9-]*\.jpg" | head -20)"
if [ -n "$BAD" ]; then
  echo "Refusing to publish. Only NN-name.jpg presentation images may be in $PRODUCT/. Remove these first:"
  echo "$BAD"; exit 1
fi
COUNT="$(find "$PRODUCT" -name '*.jpg' | wc -l | tr -d ' ')"
# New decks have 15 (Figma only) or 16 (with code) images. Older decks built before the standard have 13-14.
case "$COUNT" in 15|16) ;; 13|14) echo "Note: $COUNT images (older deck layout)";; *) echo "Expected 15 or 16 images in $PRODUCT/, found $COUNT. Check the export first."; exit 1;; esac
# Nothing outside the product folder, registry and README may be staged.
OTHER="$(git status --porcelain | awk '{print $2}' | grep -vE "^($PRODUCT/|registry/|README\.md$)" || true)"
if [ -n "$OTHER" ]; then echo "Refusing to publish: other changes in the repo:"; echo "$OTHER"; exit 1; fi

python "$HERE/registry.py" "$REPO" "$PRODUCT" "$TAG" "$TITLE" "$STYLE" "$LIVE" "$OWNER"

git add -A "$PRODUCT" registry README.md
git commit -q -m "$MSG"
git tag "$TAG"
git push -q origin HEAD
git push -q origin "$TAG"
echo "Pushed $(git log -1 --format='%h %s') as $TAG"

BASE="https://cdn.jsdelivr.net/gh/wrteam-adityasinh/Presentation-Assets@$TAG/$PRODUCT"
FAIL=0
for f in "$PRODUCT"/*.jpg; do
  n="$(basename "$f")"
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/$n")"
  echo "$code $n"
  [ "$code" = "200" ] || FAIL=1
done
[ "$FAIL" = "0" ] && echo "ALL OK" || echo "SOME URLS FAILED: wait a minute and re-check"
