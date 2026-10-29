// analyse-file.js: read-only. Run once per product in a use_figma call.
// Returns pages, colour variables (with modes), paint styles, text styles, and installed styles of the kit's fonts.

const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
const pages = figma.root.children.map((p) => ({ id: p.id, name: p.name }));

const collections = [];
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    let val = v.valuesByMode[c.modes[0].modeId];
    if (v.resolvedType === "COLOR" && val && val.r !== undefined) val = hex(val);
    else if (val && val.type === "VARIABLE_ALIAS") val = "-> " + val.id;
    vars.push([v.name, v.id, v.resolvedType, val]);
  }
  collections.push({ name: c.name, id: c.id, modes: c.modes.map((m) => m.name), count: vars.length, vars });
}

const paintStyles = (await figma.getLocalPaintStylesAsync()).map((s) => {
  const p = s.paints[0];
  return [s.name, p && p.type === "SOLID" ? hex(p.color) : p && p.type];
});
const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => [s.name, s.fontName.family + " " + s.fontName.style, s.fontSize]);
const families = [...new Set(textStyles.map((t) => t[1].split(" ").slice(0, -1).join(" ")))];
const fonts = {};
for (const f of await figma.listAvailableFontsAsync()) if (families.includes(f.fontName.family)) (fonts[f.fontName.family] ||= []).push(f.fontName.style);

return {
  pages,
  colourVariables: collections.reduce((n, c) => n + c.vars.filter((v) => v[2] === "COLOR").length, 0),
  collections,
  paintStyles: { count: paintStyles.length, list: paintStyles },
  textStyles: { count: textStyles.length, list: textStyles },
  fonts,
};
