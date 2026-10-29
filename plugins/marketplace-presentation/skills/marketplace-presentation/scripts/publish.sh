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
git pull -q --rebase
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then echo "Tag $TAG already exists: use the next version"; exit 1; fi

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
