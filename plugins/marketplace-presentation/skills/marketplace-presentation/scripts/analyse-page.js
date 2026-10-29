// analyse-page.js: read-only. Run once per page (UI, components, dark UI) in its own use_figma call.
// Set the two constants below first.
const PAGE_ID = "REPLACE_ME";   // page id from analyse-file.js
const WITH_TEXT = false;        // true: also return visible text of each screen (for the features slide)

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);

const isScreenW = (n) => n.width >= 340 && n.width <= 450;
const sections = [];
let full = 0, sheets = 0;
function scan(node, depth) {
  const kids = "children" in node ? node.children : [];
  const scr = kids.filter((k) => (k.type === "FRAME" || k.type === "COMPONENT" || k.type === "INSTANCE") && isScreenW(k));
  const f = scr.filter((k) => k.height >= 780), s = scr.filter((k) => k.height < 780);
  if (scr.length) {
    sections.push({
      id: node.id, name: node.name, depth, full: f.length, sheets: s.length,
      screens: scr.map((k) => {
        const o = { id: k.id, name: k.name, h: Math.round(k.height) };
        if (WITH_TEXT) o.text = k.findAll((t) => t.type === "TEXT" && t.visible).map((t) => t.characters.replace(/\n/g, " ")).filter((t) => t.length > 2 && t !== "9:41").slice(0, 14).join(" | ").slice(0, 400);
        return o;
      }),
    });
    full += f.length; sheets += s.length;
  }
  if (depth < 2) kids.filter((k) => k.type === "SECTION" || (k.type === "FRAME" && k.width > 600) || k.type === "GROUP").forEach((k) => scan(k, depth + 1));
}
for (const c of page.children) scan(c, 0);

const sets = page.findAllWithCriteria({ types: ["COMPONENT_SET"] });
const comps = page.findAllWithCriteria({ types: ["COMPONENT"] });
const standalone = comps.filter((c) => c.parent.type !== "COMPONENT_SET");
const iconLike = standalone.filter((c) => c.width <= 48 && c.height <= 48);
const iconFrames = {};
for (const c of iconLike) { const k = c.parent.name + " #" + c.parent.id; iconFrames[k] = (iconFrames[k] || 0) + 1; }
const logoCandidates = page.findAll((n) => /logo/i.test(n.name) && n.type !== "TEXT").slice(0, 8).map((n) => [n.id, n.type, n.name, Math.round(n.width) + "x" + Math.round(n.height)]);

return {
  page: page.name,
  totals: { fullScreens: full, sheets },
  sections: sections.map((s) => WITH_TEXT ? s : { ...s, screens: s.screens.map((x) => x.name + " #" + x.id + " @" + x.h) }),
  components: {
    sets: sets.length,
    variantsAndSingles: comps.length,
    uiComponents: comps.length - iconLike.length,
    setList: sets.map((s) => s.name + " (" + s.children.length + ") #" + s.id),
    iconLike: iconLike.length,
    iconFrames,
  },
  logoCandidates,
};
