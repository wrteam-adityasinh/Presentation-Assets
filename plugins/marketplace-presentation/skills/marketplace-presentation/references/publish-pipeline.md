# Publish pipeline

**Repo:** `https://github.com/wrteam-adityasinh/Presentation-Assets` (public: jsDelivr cannot serve private repos). Default local clone: `~/presentation-assets`.

**Layout:** one folder per product in kebab case (`bondly/`), files `NN-name.jpg`, plus `registry/products.json`.

**Tags:** `<product>-v<semver>`. First publish `v1.0.0`, every update a new patch tag. Old tags keep working forever.

**URL:** `https://cdn.jsdelivr.net/gh/wrteam-adityasinh/Presentation-Assets@<tag>/<folder>/<file>.jpg`

## First publish

1. Set the live link on "Open in Figma" in frame 14.
2. For each frame, `get_screenshot` with `maxDimension` = max(1848, height). Append `{"name": "01-cover", "url": "<image_url>"}` to `pairs.json` in the scratchpad, and download right away:

   ```bash
   python scripts/export.py --pairs pairs.json --repo ~/presentation-assets --product bondly
   ```

   It downloads, converts to JPG (quality 86, optimized, progressive) and writes the files into the product folder.
3. Publish:

   ```bash
   bash scripts/publish.sh ~/presentation-assets bondly v1.0.0 "Add Bondly presentation" \
     "Bondly dating & social app UI kit" "<style recipe>" "<live link>" "<teammate name>"
   ```

   It commits, tags, pushes, adds or updates the product in `registry/products.json` and the README table, and checks that every URL returns 200.
4. HTML:

   ```bash
   python scripts/make_html.py --repo ~/presentation-assets --product bondly --tag bondly-v1.0.0 \
     --live "<live link>" --alts alts.json --out item-page.html
   ```

   `alts.json` maps file names to alt text. Give the teammate the HTML in a code block.

## Updates

1. Screenshot every frame again into `pairs.json`.
2. `python scripts/export.py --pairs pairs.json --repo ~/presentation-assets --product bondly --diff`. It overwrites only images that changed and prints which ones.
3. If nothing changed, say so and stop. Otherwise run `publish.sh` with the next patch tag, then `make_html.py` with the new tag.
