---
name: marketplace-presentation
description: Build a WRTeam marketplace presentation for a product from its Figma link, its code folder, or both. Analyses the product, proposes the deck in a style from the team style library, builds it in Figma (capturing the running app into the teammate's Figma file when there is no design file), then exports, publishes only the presentation images to the shared Presentation-Assets repo and returns the item-page HTML. Use when someone shares a Figma UI-kit link or runs it in a product's code folder and asks for a presentation, preview images, item-page images or marketplace HTML, or says "export", "live preview link" or "I updated some sections" for an existing deck.
---

# Marketplace presentation (WRTeam standard)

You build long-image product presentations for UI kits sold on marketplace.wrteam.in. Every teammate gets the same process, the same slide standard and the same deliverables. Only the visual style changes per product, chosen from the style library.

Read these before you start, in this order:

1. `references/design-rules.md`: the fixed rules
2. `references/slide-blueprints.md`: the 15 images and what each must contain
3. `references/features-guide.md`: how to write the key-features slide
4. `references/figma-gotchas.md`: Plugin API traps we already hit
5. The one style recipe you pick from `references/style-library/`

You also need the Figma skills: load `figma:figma-use` (and `figma:figma-generate-design` before any write) before the first `use_figma` call.

## Pick the mode first

Look at what you were given:

| Mode | Given | Screens come from | Extra reading |
|---|---|---|---|
| **A** | Figma link only | The Figma file | none |
| **B** | Run inside a code folder **and** a Figma link | The Figma file | `references/code-analysis.md` |
| **C** | Run inside a code folder, **no** Figma link | The running app, captured into an **empty Figma file the teammate gives you** | `references/code-analysis.md`, `references/capture-guide.md` |

A code folder is the current working directory when it contains a manifest such as `package.json`, `pubspec.yaml`, `composer.json`, `build.gradle`, an `.xcodeproj` or `requirements.txt`. In mode C, if the teammate has not given a Figma link yet, ask them to create an empty design file in the team's Figma project and paste its link. Never create Figma files yourself.

Say which mode you are in at the start of the plan.

## The one publishing rule

**Only the final presentation images go to GitHub**: the `NN-name.jpg` files, plus the registry and README updates that `publish.sh` makes. Never push product code, captured screens, single-screen screenshots, PNG exports, `.env` files or anything from the product's code folder. Captured screens live only in the Figma file and the session scratchpad. `publish.sh` refuses to run if the product folder holds anything else.

## Phase 0: Preflight

Check, and stop with the exact fix if anything is missing:

- The Figma MCP tools respond (`whoami`).
- `git`, `curl` and `python` with Pillow are available (`python -c "import PIL"`).
- The shared image repo is cloned. Default path: `~/presentation-assets`. If it is missing, run `git clone https://github.com/wrteam-adityasinh/Presentation-Assets ~/presentation-assets`. Then run `git -C ~/presentation-assets pull` so the registry is current.
- The teammate can push to it (`git -C ~/presentation-assets push --dry-run`). If not, they must ask the repo owner to add them as a collaborator. Never ask for or store tokens.

## Phase 1: Analyse (read-only)

**Modes B and C:** start with `python scripts/analyse-code.py .` in the code folder and follow `code-analysis.md`. **Mode C:** then run the app and capture every screen into the teammate's Figma file as `capture-guide.md` says, and create the design-system variables with `scripts/theme-to-figma.js`. After that, continue below with that file.

1. `create_session` with the file key from the link.
2. Run `scripts/analyse-file.js` (one `use_figma` call). It returns pages, colour variables, paint styles, text styles and installed font styles.
3. Run `scripts/analyse-page.js` on the UI page, the components page and any dark-mode page, one call per page (set `PAGE_ID` at the top). It returns sections, full screens versus sheets, components, sets, icon frames and logo candidates.
4. Screenshot each flow section once to understand the product.
5. Read the text of the main screens (`analyse-page.js` with `WITH_TEXT = true`) and draft the customer features, following `features-guide.md`.
6. Read `~/presentation-assets/registry/products.json` to see which styles were used recently.

Every number you show must come from these scripts. Count dark-mode copies separately ("29 screens, each in light and dark"), never as extra screens.

## Phase 2: Plan, then wait

Send the teammate one message with:

- **Mode**: A, B or C, and what you were given.
- **Verified numbers**: screens, sheets, flows with per-flow counts, components and sets, icons, text styles and font, colour tokens and modes, spacing tokens. With code: apps and platforms, modules, languages, integrations.
- **Key features**: the 6–8 drafted features, each with the screen that proves it (and, with code, the module that implements it).
- **Tech stack** (modes B and C): frameworks per app, platforms, integrations by group, what the package contains.
- **Code ↔ design gaps** (mode B): modules with no screen, screens with no code.
- **Style**: the recipe you chose, why it fits the product's domain, and confirmation it is not among the last 3 entries in the registry.
- **Slide plan**: the images from `slide-blueprints.md` (15 for mode A, 16 with the tech-stack slide for modes B and C), with the screens planned for each flow slide.
- **Source issues**: placeholder copy ("Lorem ipsum", empty images) or typos visible in the kit's screens.

Then wait. Build only after the teammate approves or edits the plan.

## Phase 3: Build

1. Create a new page `🖼 Presentation` in the product file. Never edit the UI pages.
2. Paste `scripts/figma-kit.js` at the top of every build call and start it with `await KIT.init(CONFIG)`. CONFIG maps the standard tokens to the kit's own variables or paint styles (see the header of `figma-kit.js`).
3. Build one slide per call, following the style recipe. Return the slide id. Then take one screenshot and fix overlaps, clipped text or off-canvas devices before the next slide.
4. Build the last section as 3 separate frames (Components or Screen wall, Get Started, Footer), each with its own rounded canvas. Never cut one tall frame into slices.
5. Finish with `KIT.restack()`: it sorts the frames by name, stacks them with 160 px gaps and adds PNG 1x export settings.

## Phase 4: Review, then wait

Go through `references/qa-checklist.md` item by item and report the result. Then tell the teammate the deck is ready for their review in Figma. The teammate who runs the skill owns this review; they may edit the slides by hand.

## Phase 5: Export and publish

Start only when the teammate says "export" and gives the live-preview link (in mode C this can be the product's live demo URL). Follow `references/publish-pipeline.md`:

1. Set the live link on the "Open in Figma" text in the Get Started frame (`text.hyperlink = {type: "URL", value: LINK}`); in mode C relabel it "View live demo" if the link is a demo URL. Strip `&t=…` from Figma links.
2. Screenshot every frame with `maxDimension` = max(1848, frame height). Download each image the moment its URL arrives; the URLs expire.
3. `python scripts/export.py` converts to JPG, names the files, and on updates replaces only changed images.
4. `bash scripts/publish.sh` commits, tags `<product>-vX.Y.Z`, pushes, updates the registry and checks every URL returns 200.
5. `python scripts/make_html.py` writes the item-page HTML. Return it to the teammate in a code block.

## Phase 6: Updates

When the teammate says they changed sections: re-screenshot all frames, run `export.py --diff`, publish only the changed images under the next patch tag, and return the full HTML with the new tag.

## Tone with the teammate

Short, plain status lines. Ask only at the two gates (plan, export). If a tool call fails with "classifier gave no verdict", retry it once on its own. Report what was done and what is still missing; never claim a step that did not run.
