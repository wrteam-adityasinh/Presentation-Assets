# Figma Plugin API gotchas (learned on 7 decks)

## Screens inside devices

1. `clone()` the UI screen into the device's Screen frame.
2. **Detach every nested instance** (loop `detachInstance()` until none remain: `KIT.detachAll`).
3. Only then `rescale()` the whole device.

Rescaling a clone that still has instances shifts status bars and app bars. Never use raster image fills (`exportAsync` + `createImage`): they render blank for some clients.

## Fills and tokens

- `setBoundVariableForPaint` returns a new paint: assign the result.
- Kits without colour variables: use paint styles with `await node.setFillStyleIdAsync(style.id)`. Text ranges: `setRangeFillStyleIdAsync`.
- A gradient paint style (e.g. "Primary Gradient") can be set as a text range fill: great for the accent word.
- `figma.createAutoLayout()` frames have a white fill by default: set `fills = []`.
- Logo clones often carry a white frame fill: set `fills = []` on the logo frame. On a coloured band, set the logo vectors to white.

## Text

- Load every font style before use. Check exact style names with `listAvailableFontsAsync()` ("SemiBold" vs "Semi Bold").
- `lineHeight` and `letterSpacing` take `{unit, value}`.
- Wrapping text: `textAutoResize = "HEIGHT"` and `resize(width, height)`.
- To place a highlight (loop, underline) under one word, measure with a trailing marker: width("prefix |") − width("|"). Plain width("prefix ") drops the trailing space.

## Geometry

- Rotate around a centre with `KIT.place(node, cx, cy, deg)`.
- Vector paths: only `M L C Q Z` commands. A vector's position is its bounding box, not the path origin: set `x/y` after creating it and check it in the screenshot.
- Components that are small (icons) scale with `rescale(target / Math.max(w, h))`.

## Calls

- One `use_figma` call cannot keep variables for the next: pass ids as string literals.
- Switch page at most once per call, with `await figma.setCurrentPageAsync(page)`.
- Return small objects (ids, sizes), never whole node dumps.
- `get_metadata` on a big page overflows: use `analyse-page.js` instead.
- A script that throws is rolled back: list the page's frames before retrying, so you don't duplicate slides.
- "Auto mode classifier gave no verdict": transient. Retry the same call once on its own. Download screenshot URLs immediately; they expire within minutes.

## Export

- `exportSettings` on frames: `{format: "PNG", suffix: "", constraint: {type: "SCALE", value: 1}}`. `contentsOnly` and `useAbsoluteBounds` are not allowed here.
- Screenshot frames with `maxDimension` = max(1848, frame height) to get 1:1 pixels.
