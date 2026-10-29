"""Read a product's code folder and print what the presentation needs, as JSON.

Usage: python analyse-code.py <code folder> [--max-files 20000]

Detects stacks from manifest files, then collects platforms, routes/screens, modules,
integrations, languages and theme tokens. Never reads values from .env or key files.
The result is a starting point: check it by reading the files it points to.
"""
import json
import os
import re
import sys

SKIP_DIRS = {"node_modules", ".git", "build", "dist", ".next", ".nuxt", "vendor", ".dart_tool", "Pods",
             ".gradle", "ios/Pods", "__pycache__", ".venv", "venv", "coverage", ".idea", ".vscode", "storage"}
SECRET_FILES = re.compile(r"(^\.env|\.pem$|\.key$|\.p12$|\.jks$|keystore|google-services\.json|GoogleService-Info\.plist|credentials)", re.I)

INTEGRATIONS = {
    "Payments": ["stripe", "razorpay", "paypal", "braintree", "paystack", "flutterwave", "paytm", "phonepe", "mollie", "square", "in_app_purchase", "revenuecat"],
    "Maps & location": ["google_maps", "googlemaps", "google-maps", "mapbox", "leaflet", "geolocator", "here-maps", "react-native-maps"],
    "Auth": ["firebase_auth", "firebase/auth", "@react-native-firebase/auth", "google_sign_in", "sign_in_with_apple", "laravel/sanctum", "laravel/passport", "next-auth", "auth0", "clerk", "supabase"],
    "Push & messaging": ["firebase_messaging", "onesignal", "pusher", "socket.io", "laravel-echo", "twilio", "agora", "zego", "stream-chat"],
    "Analytics": ["firebase_analytics", "mixpanel", "amplitude", "segment", "google-analytics", "posthog"],
    "AI": ["openai", "anthropic", "@anthropic-ai", "google_generative_ai", "gemini", "langchain"],
    "Storage & media": ["aws-sdk", "@aws-sdk", "cloudinary", "firebase_storage", "image_picker", "video_player", "just_audio"],
    "Database": ["mysql", "postgres", "mongodb", "mongoose", "prisma", "sqflite", "hive", "realm", "redis"],
}


def walk(root, max_files):
    n = 0
    for d, dirs, files in os.walk(root):
        rel = os.path.relpath(d, root).replace("\\", "/")
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS and not x.startswith(".") and f"{rel}/{x}".lstrip("./") not in SKIP_DIRS]
        for f in files:
            n += 1
            if n > max_files:
                return
            yield os.path.join(d, f), (f if rel == "." else f"{rel}/{f}")


def read(path, limit=400_000):
    try:
        with open(path, encoding="utf-8", errors="ignore") as fh:
            return fh.read(limit)
    except OSError:
        return ""


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    max_files = int(sys.argv[sys.argv.index("--max-files") + 1]) if "--max-files" in sys.argv else 20000
    files = list(walk(root, max_files))
    rels = [r for _, r in files]
    out = {"root": root, "files_scanned": len(files), "apps": [], "routes": [], "screens": [], "modules": [],
           "integrations": {}, "languages": [], "theme": {"colors": {}, "fonts": [], "dark_theme": False}, "secret_files_skipped": []}

    deps_text = ""
    for path, rel in files:
        name = os.path.basename(rel)
        if SECRET_FILES.search(name):
            out["secret_files_skipped"].append(rel)
            continue
        if name == "package.json" and "node_modules" not in rel:
            pj = json.loads(read(path) or "{}") if read(path).strip().startswith("{") else {}
            deps = {**pj.get("dependencies", {}), **pj.get("devDependencies", {})}
            kind = next((k for k, keys in [("Next.js", ["next"]), ("Nuxt", ["nuxt"]), ("Expo", ["expo"]), ("React Native", ["react-native"]),
                                           ("Angular", ["@angular/core"]), ("Vue", ["vue"]), ("React", ["react"]), ("Node", ["express", "@nestjs/core", "fastify"])]
                         if any(x in deps for x in keys)), "JavaScript")
            out["apps"].append({"path": os.path.dirname(rel) or ".", "stack": kind, "name": pj.get("name"), "scripts": list(pj.get("scripts", {}).keys())})
            deps_text += " ".join(deps) + " "
        elif name == "pubspec.yaml":
            t = read(path)
            out["apps"].append({"path": os.path.dirname(rel) or ".", "stack": "Flutter", "name": (re.search(r"^name:\s*(\S+)", t, re.M) or [None, None])[1],
                                "web": os.path.isdir(os.path.join(os.path.dirname(path), "web"))})
            deps_text += t + " "
            for fam in re.findall(r"family:\s*([\w ]+)", t):
                out["theme"]["fonts"].append(fam.strip())
        elif name == "composer.json":
            t = read(path)
            out["apps"].append({"path": os.path.dirname(rel) or ".", "stack": "Laravel" if "laravel/framework" in t else "PHP"})
            deps_text += t + " "
        elif name in ("build.gradle", "build.gradle.kts") and "android" in rel.lower() and "app" in rel.lower():
            out["apps"].append({"path": os.path.dirname(rel), "stack": "Android"})
            deps_text += read(path) + " "
        elif name in ("requirements.txt", "pyproject.toml"):
            t = read(path)
            if "django" in t.lower() or "flask" in t.lower() or "fastapi" in t.lower():
                out["apps"].append({"path": os.path.dirname(rel) or ".", "stack": "Python web"})
            deps_text += t + " "
        elif rel.endswith(".xcodeproj/project.pbxproj"):
            out["apps"].append({"path": rel.split(".xcodeproj")[0], "stack": "iOS"})

    low = deps_text.lower()
    for group, keys in INTEGRATIONS.items():
        hits = sorted({k for k in keys if k.lower() in low})
        if hits:
            out["integrations"][group] = hits

    route_res = [
        re.compile(r"""GoRoute\(\s*path:\s*['"]([^'"]+)"""),
        re.compile(r"""<Route[^>]*path=['"]([^'"]+)"""),
        re.compile(r"""path:\s*['"](/[^'"]*)['"]"""),
        re.compile(r"""Route::(?:get|post|put|patch|delete|any|resource|view)\(\s*['"]([^'"]+)"""),
        re.compile(r"""Stack\.Screen[^>]*name=['"]([^'"]+)"""),
        re.compile(r"""composable\(\s*(?:route\s*=\s*)?['"]([^'"]+)"""),
    ]
    screen_re = re.compile(r"class\s+(\w+(?:Screen|Page|View))\s+extends\s+(?:Stateless|Stateful|Consumer)")
    swift_re = re.compile(r"struct\s+(\w+(?:Screen|View|Page))\s*:\s*View")
    for path, rel in files:
        ext = os.path.splitext(rel)[1]
        if re.search(r"(^|/)app/.*page\.(tsx|jsx|js|ts)$", rel) or re.search(r"(^|/)pages/[^_].*\.(tsx|jsx|vue)$", rel):
            out["routes"].append(rel)
        if ext in (".dart", ".js", ".jsx", ".ts", ".tsx", ".php", ".kt", ".vue", ".py", ".swift"):
            t = read(path)
            for r in route_res:
                out["routes"] += [m for m in r.findall(t) if len(m) < 120]
            out["screens"] += screen_re.findall(t) + swift_re.findall(t)
            if "ThemeMode.dark" in t or "darkTheme" in t or "dark:" in t and ext in (".tsx", ".jsx", ".vue"):
                out["theme"]["dark_theme"] = True
            for k, v in re.findall(r"(primary|secondary|accent|background|surface)\w*\s*[:=]\s*(?:Color\(0x|['\"]#)([0-9A-Fa-f]{6,8})", t):
                out["theme"]["colors"].setdefault(k, ("#" + v[-6:]).upper())
        if rel.endswith((".css", ".scss")):
            t = read(path)
            for k, v in re.findall(r"--(primary|secondary|accent|background|foreground)[\w-]*\s*:\s*(#[0-9A-Fa-f]{6})", t):
                out["theme"]["colors"].setdefault(k, v.upper())
        if re.search(r"tailwind\.config\.(js|ts|cjs|mjs)$", rel):
            t = read(path)
            for k, v in re.findall(r"(primary|secondary|accent)\w*['\"]?\s*:\s*['\"](#[0-9A-Fa-f]{6})", t):
                out["theme"]["colors"].setdefault(k, v.upper())
            out["theme"]["fonts"] += re.findall(r"fontFamily[^\[]*\[\s*['\"]([^'\"]+)", t)

    mod_parents = ("features", "modules", "screens", "pages", "views", "Http/Controllers", "app/(", "domain")
    mods = set()
    for rel in rels:
        parts = rel.split("/")
        for i, p in enumerate(parts[:-1]):
            if p in ("features", "modules", "screens", "views", "Controllers") and i + 1 < len(parts) - 1:
                mods.add(parts[i + 1])
    out["modules"] = sorted(mods)[:80]

    langs = set()
    for rel in rels:
        m = re.search(r"(?:l10n|locales?|lang|translations|i18n)/(?:app_)?([a-z]{2}(?:[-_][A-Za-z]{2})?)(?:\.(?:json|arb|php|ya?ml)|/)", rel)
        if m:
            langs.add(m.group(1))
    out["languages"] = sorted(langs)

    out["routes"] = sorted(set(out["routes"]))
    out["screens"] = sorted(set(out["screens"]))
    out["theme"]["fonts"] = sorted(set(f for f in out["theme"]["fonts"] if f))
    out["counts"] = {"apps": len(out["apps"]), "routes": len(out["routes"]), "screen_classes": len(out["screens"]),
                     "modules": len(out["modules"]), "languages": len(out["languages"]),
                     "integrations": sum(len(v) for v in out["integrations"].values())}
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
