# Slide blueprints (15 images)

Every deck has 15 exported images. The first three and the last five are fixed; the flow slides (04–10) adapt to the kit's flows. If a kit has fewer than 7 flows, merge small flows or show a "more screens" wall. If it has more, group related flows.

| File | Frame name | Must contain | Link |
|---|---|---|---|
| `01-cover` | 01 — Cover | Logo (cloned from the kit, white fill removed), slide index, small eyebrow ("the music app UI kit"), two-line headline with accent word, one-line pitch, 3–4 stat chips with verified numbers, 3 hero screens in devices | Live preview |
| `02-numbers` | 02 — Numbers | Verified counts only: screens (+ sheets), themes, flows, components and sets, icons, text styles, colour tokens/styles, spacing tokens. One hero number, the rest in a grid or list | — |
| `03-features` | 03 — Key Features | 6–8 customer features from `features-guide.md`: icon from the kit, name, one-line benefit, small crop of the proving screen | — |
| `04-…` to `10-…` | 04 — Flow name … | One flow per slide in the app's own order (onboarding/sign-in, home, core features, secondary features, profile/settings, plans/checkout). Headline, 1–2 lines of copy, 2–7 real screens | — |
| `11-…` | 11 — Light & Dark or Sheets | If the kit has a dark mode: light/dark pairs of the same screens (this may be the one dark slide). Otherwise: all bottom sheets, modals and menus | — |
| `12-design-system` | 12 — Design System | Colour scales with step numbers and hex, font specimen with "Aa" and type ramp, icon grid, spacing tokens | — |
| `13-components` | 13 — Components | Real component instances in 3 columns with small labels. Its own frame with its own rounded canvas | — |
| `14-cta` | 14 — Get Started | Accent band (radius 40) with logo, headline, one line of copy, "Open in Figma" button (text named `Open in Figma`, hyperlinked), 3 stat chips and 1–2 screens. Frame padding 56 px above and below the band | Live preview |
| `15-footer` | 15 — Footer | 150 px tall: logo, "Product — Category UI Kit", one line of credits on the right. Own rounded canvas | — |

## Header on every slide (01–13)

Each style recipe defines its own header, but every header has these two parts:

- **Left**: a small label (chapter, track, message…), with the slide number inside it.
- **Right**: a slide index showing `NN / 15` (cover may show the product logo instead).

## File names

`01-cover.jpg`, `02-numbers.jpg`, `03-features.jpg`, then `04-<flow>.jpg` … in kebab case (`05-now-playing.jpg`), `11-light-dark.jpg` or `11-sheets-overlays.jpg`, `12-design-system.jpg`, `13-components.jpg`, `14-cta.jpg`, `15-footer.jpg`.
