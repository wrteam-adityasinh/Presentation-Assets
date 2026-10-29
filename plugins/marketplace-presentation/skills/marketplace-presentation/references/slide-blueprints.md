# Slide blueprints

Mode A (Figma only) exports **15 images**. Modes B and C (with code) export **16 images**: they add `12-tech-stack`, and everything after it moves down by one. The first three images and the last ones are fixed; the flow slides (04–10) adapt to the product's flows. If a product has fewer than 7 flows, merge small flows or show a "more screens" wall. If it has more, group related flows.

| Mode A file | Modes B/C file | Frame | Must contain | Link |
|---|---|---|---|---|
| `01-cover` | `01-cover` | Cover | Logo (cloned from the kit or the app, white fill removed), slide index, small eyebrow, two-line headline with accent word, one-line pitch, 3–4 stat chips with verified numbers (with code: add stack chips such as "Flutter · Laravel"), 3 hero screens in devices | Live link |
| `02-numbers` | `02-numbers` | Numbers | Verified counts only. Figma: screens (+ sheets), themes, flows, components and sets, icons, text styles, colour tokens, spacing tokens. With code, add apps/platforms, modules, languages, integrations. One hero number, the rest in a grid or list | — |
| `03-features` | `03-features` | Key Features | 6–8 customer features from `features-guide.md`: icon, name, one-line benefit, small crop of the proving screen | — |
| `04-…` to `10-…` | same | Flow slides | One flow per slide in the app's own order (onboarding/sign-in, home, core features, secondary features, profile/settings, plans/checkout; admin panel if there is one). Headline, 1–2 lines of copy, 2–7 real screens | — |
| `11-…` | `11-…` | Light & Dark or Sheets | Light/dark pairs if the product has both themes (may be the one dark slide). Otherwise all bottom sheets, modals and menus | — |
| — | `12-tech-stack` | Tech Stack | Apps and their frameworks (e.g. "Customer app · Flutter", "Admin panel · Laravel + Blade"), platforms (Android, iOS, Web), integrations grouped (Payments, Maps, Auth, Push…), languages/RTL, and what the package contains (source code, admin panel, docs). Use the official names of frameworks and services as text, not their logos | — |
| `12-design-system` | `13-design-system` | Design System | Colour scales with step numbers and hex, font specimen and type ramp, icon grid, spacing tokens. Mode C: from the variables created by `theme-to-figma.js` | — |
| `13-components` | `14-components` | Components (mode C: Screen Wall) | Real component instances in 3 columns. In mode C there is no component library, so show a wall of all captured screens grouped by flow instead (file name `14-screen-wall`). Own frame, own rounded canvas | — |
| `14-cta` | `15-cta` | Get Started | Accent band (radius 40) with logo, headline, one line of copy, button text named `Open in Figma` (mode C with a demo URL: "View live demo"), hyperlinked, 3 stat chips and 1–2 screens. Frame padding 56 px above and below the band | Live link |
| `15-footer` | `16-footer` | Footer | 150 px tall: logo, "Product — Category", one line of credits on the right. Own rounded canvas | — |

## Header on every slide

Each style recipe defines its own header, but every header has these two parts:

- **Left**: a small label (chapter, track, message…), with the slide number inside it.
- **Right**: a slide index showing `NN / 15` (mode A) or `NN / 16` (modes B and C). The cover may show the product logo instead.

## File names

Kebab case with a two-digit prefix: `01-cover.jpg`, `02-numbers.jpg`, `03-features.jpg`, `05-now-playing.jpg`, `12-tech-stack.jpg`, `15-cta.jpg`… The CTA file always ends in `-cta` and is, with `01-cover`, the only image that carries the live link (`make_html.py` relies on this).
