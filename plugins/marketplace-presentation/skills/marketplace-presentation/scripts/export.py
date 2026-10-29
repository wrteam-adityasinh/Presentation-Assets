"""Download Figma screenshot URLs, convert to JPG and place them in the product folder.

Usage:
  python export.py --pairs pairs.json --repo ~/presentation-assets --product bondly [--diff]

pairs.json: [{"name": "01-cover", "url": "https://www.figma.com/api/mcp/asset/....png"}, ...]
Download right after taking each screenshot: the URLs expire within minutes. Already
downloaded PNGs (<name>.png next to pairs.json) are reused, so the script can be re-run.

--diff: compare with the JPGs already in the folder and overwrite only images that changed.
Prints one line per image and a final "CHANGED:" list.
"""
import argparse
import io
import json
import os
import sys
import urllib.request

from PIL import Image, ImageChops

QUALITY = dict(format="JPEG", quality=86, optimize=True, progressive=True)


def to_jpg_bytes(img):
    buf = io.BytesIO()
    img.convert("RGB").save(buf, **QUALITY)
    return buf.getvalue()


def changed(old_path, new_jpg):
    if not os.path.exists(old_path):
        return "new"
    old = Image.open(old_path).convert("RGB")
    new = Image.open(io.BytesIO(new_jpg)).convert("RGB")
    if old.size != new.size:
        return f"size {old.size} -> {new.size}"
    # JPEG re-encoding noise stays below ~30 per channel; real edits go far above. 48 separates them.
    box = ImageChops.difference(old, new).convert("L").point(lambda v: 255 if v > 48 else 0).getbbox()
    return str(box) if box else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pairs", required=True)
    ap.add_argument("--repo", required=True)
    ap.add_argument("--product", required=True)
    ap.add_argument("--diff", action="store_true")
    a = ap.parse_args()

    pairs = json.load(open(a.pairs, encoding="utf-8"))
    work = os.path.dirname(os.path.abspath(a.pairs))
    out = os.path.join(os.path.expanduser(a.repo), a.product)
    os.makedirs(out, exist_ok=True)

    changed_list = []
    for p in pairs:
        png = os.path.join(work, p["name"] + ".png")
        if not os.path.exists(png):
            try:
                urllib.request.urlretrieve(p["url"], png)
            except Exception as e:
                print(f"FAIL {p['name']}: {e} (take the screenshot again)")
                continue
        jpg = to_jpg_bytes(Image.open(png))
        dst = os.path.join(out, p["name"] + ".jpg")
        if a.diff:
            why = changed(dst, jpg)
            if not why:
                print(f"same    {p['name']}")
                continue
            print(f"changed {p['name']}  {why}")
        else:
            print(f"wrote   {p['name']}  {Image.open(png).size}  {len(jpg)//1024} KB")
        open(dst, "wb").write(jpg)
        changed_list.append(p["name"])
    print("CHANGED:", ", ".join(changed_list) if changed_list else "none")


if __name__ == "__main__":
    sys.exit(main())
