"""Add or update a product in registry/products.json and in the README table.

Usage: python registry.py <repo> <product> <tag> "<title>" "<style>" "<live link>" "<owner>"
Called by publish.sh. Also usable alone to list recent styles:
  python registry.py <repo> --recent
"""
import datetime
import json
import os
import re
import sys


def load(repo):
    path = os.path.join(repo, "registry", "products.json")
    if os.path.exists(path):
        return path, json.load(open(path, encoding="utf-8"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path, {"products": []}


def main():
    repo = os.path.expanduser(sys.argv[1])
    path, data = load(repo)
    if sys.argv[2] == "--recent":
        items = sorted(data["products"], key=lambda p: p.get("updated", ""), reverse=True)
        for p in items[:5]:
            print(p["updated"], p["product"], p["style"], p["tag"])
        return
    product, tag, title, style, live, owner = sys.argv[2:8]
    today = datetime.date.today().isoformat()
    entry = next((p for p in data["products"] if p["product"] == product), None)
    if entry is None:
        entry = {"product": product, "created": today}
        data["products"].append(entry)
    entry.update({"title": title, "style": style, "tag": tag, "live": live, "owner": owner, "updated": today})
    json.dump(data, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)

    readme = os.path.join(repo, "README.md")
    text = open(readme, encoding="utf-8").read()
    row = f"| {product} | {title} | {tag} |"
    pat = re.compile(rf"^\| {re.escape(product)} \|.*\|$", re.M)
    if pat.search(text):
        text = pat.sub(row, text)
    else:
        lines = text.split("\n")
        last = max(i for i, l in enumerate(lines) if l.startswith("|"))
        lines.insert(last + 1, row)
        text = "\n".join(lines)
    open(readme, "w", encoding="utf-8").write(text)
    print(f"registry: {product} -> {tag} ({style})")


if __name__ == "__main__":
    main()
