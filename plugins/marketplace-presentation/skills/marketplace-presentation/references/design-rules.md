# Design rules (fixed for every product)

## Canvas

- Every frame is **1848 px wide**, with no height limit. Frame fill is white.
- Inside each frame sits a "Canvas" frame at x=4, y=4, width 1840, height = frame height − 8, **corner radius 40**, clip on. `KIT.slide()` builds this.
- Content margins: 120 px left and right (content width 1608). Header row at y≈70, headline at y≈150, body content from y≈440.
- Frames are named `NN — Name` and stacked vertically with 160 px gaps (`KIT.restack()`).

## Colour

- Use **only the product's own colours**. Bind fills to the kit's colour variables. If the kit has no colour variables, bind to its paint styles (`setFillStyleIdAsync`). Plain hex is allowed only for neutral shadows and white/black glass on device frames.
- Light theme: mostly the kit's lightest neutral or white, **one accent** (the primary 500/400 step), and a small second accent (often warning or secondary) used in 1–3 places per slide.
- At most **one dark slide** per deck (usually Light & Dark, or a "night" feature like voice). Use the kit's darkest neutral or its dark-mode background variable.

## Type

- Use the kit's own font family, from its text styles. Check installed styles with `figma.listAvailableFontsAsync()` before loading.
- Headline: the family's heaviest available style (Bold/ExtraBold/Black), 96–132 px, line height ~98–102%, letter-spacing −2 to −3%. Two lines, with one key word set in the accent.
- Body copy: Regular 24 px, 150% line height, max ~580 px wide, muted neutral.
- Labels and indexes: SemiBold 16–20 px, letter-spacing +10–16%.

## Devices and screens

- Use **real screens** from the UI page, cloned, every instance detached, then rescaled (see `figma-gotchas.md`). Never use raster screenshots of the kit inside the deck.
- Use **real component instances** on the components slide.
- One device frame style per deck, as the style recipe says (ceramic, titanium, graphite, blush, polaroid…).
- Bottom sheets appear over the dimmed screen they belong to (scrim at 40–55%).

## Copy

- Every number is counted by the analyse scripts and shown in the plan first. Never invent stats, ratings, prices or user counts.
- Write features from the customer's side (see `features-guide.md`).
- Flag placeholder copy visible inside kit screens; don't hide or rewrite the kit's screens.
- English, sentence case, no emoji in headlines.

## Uniqueness

- Every product uses a style recipe from `style-library/`. It must not be one of the last 3 styles in `registry/products.json`, unless the teammate insists.
- Inside a recipe, vary the layout per slide: no two consecutive slides with the same composition.

## Links

- The live-preview link goes on **two images only**: `01-cover` and the `-cta` image (`14-cta` or `15-cta`). Also set it as a hyperlink on the button text in the Get Started frame.
- Strip `&t=…` from Figma share links.
