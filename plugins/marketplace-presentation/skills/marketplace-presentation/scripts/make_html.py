"""Write the item-page HTML for a published product.

Usage:
  python make_html.py --repo ~/presentation-assets --product bondly --tag bondly-v1.0.0 \
      --live "<live preview link>" --alts alts.json --out item-page.html

alts.json: {"01-cover": "Bondly dating and social app UI kit ...", "02-numbers": "...", ...}
Images are listed in file-name order. Only 01-cover and 14-cta are wrapped in the live link.
The "&t=..." share parameter is removed from the link.
"""
import argparse
import html
import json
import os
import re

LINKED = {"01-cover", "14-cta"}
CDN = "https://cdn.jsdelivr.net/gh/wrteam-adityasinh/Presentation-Assets@{tag}/{product}/{name}.jpg"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--product", required=True)
    ap.add_argument("--tag", required=True)
    ap.add_argument("--live", required=True)
    ap.add_argument("--alts", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    live = re.sub(r"[&?]t=[^&]*", "", a.live)
    alts = json.load(open(a.alts, encoding="utf-8"))
    folder = os.path.join(os.path.expanduser(a.repo), a.product)
    names = sorted(f[:-4] for f in os.listdir(folder) if f.endswith(".jpg"))
    missing = [n for n in names if n not in alts]
    if missing:
        raise SystemExit("Missing alt text for: " + ", ".join(missing))

    lines = []
    for n in names:
        img = f'<img src="{CDN.format(tag=a.tag, product=a.product, name=n)}" alt="{html.escape(alts[n], quote=True)}" />'
        if n in LINKED:
            img = f'<a href="{html.escape(live, quote=True)}" target="_blank" rel="noopener">{img}</a>'
        lines.append(img)
    open(a.out, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
