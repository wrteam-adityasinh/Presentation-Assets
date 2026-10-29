# QA checklist (phase 4, before export)

Report each item as pass or fail with the slide number. Fix every fail before asking the teammate to review.

## Structure

- [ ] 15 frames named `01 — …` to `15 — …`, all 1848 wide, stacked with 160 px gaps, PNG export settings on each.
- [ ] Every frame has a Canvas child with radius 40 on all four corners (13, 14 and 15 are separate frames).
- [ ] Frame 14 contains a text node `Open in Figma`.

## Content

- [ ] Every number on slides 01, 02, 12, 13 and 14 matches the analyse output.
- [ ] Key features: 6–8 items, each tied to a real screen, written from the customer's side.
- [ ] No lorem ipsum or "Title"/"Label" placeholders in *our* copy.
- [ ] Placeholder copy or typos inside the kit's own screens are listed for the teammate.
- [ ] Slide index shows the right `NN / 15` on every slide.

## Visual

- [ ] No clipped text, no text over a device, no device crossing the canvas edge (unless it bleeds on purpose and is cut cleanly).
- [ ] Only kit colours. Fills bound to variables or paint styles.
- [ ] Only the kit's font.
- [ ] Status bars and app bars inside devices sit in the right place (instances were detached before rescale).
- [ ] At most one dark slide.
- [ ] Consecutive slides use different compositions.
- [ ] Style is not one of the last 3 in the registry.
