// figma-kit.js: shared builders for WRTeam marketplace presentations.
// Paste this whole file at the top of every use_figma build call, then:
//
//   await KIT.init({
//     page: "5773:59",                       // id of the "🖼 Presentation" page
//     font: { family: "Urbanist", styles: ["Regular","Medium","SemiBold","Bold","ExtraBold","SemiBold Italic"] },
//     tokens: {                               // standard token names -> kit source
//       bg:      { variable: "VariableID:10:393", opacity: 0.35 }, // slide canvas
//       surface: { hex: "#FFFFFF" },
//       ink:     { variable: "VariableID:10:1200" },
//       muted:   { variable: "VariableID:14:63" },
//       line:    { variable: "VariableID:14:87" },
//       accent:  { variable: "VariableID:10:387" },
//       accentSoft: { variable: "VariableID:10:393" },
//       accent2: { variable: "VariableID:14:489" },
//       dark:    { variable: "VariableID:10:384" },
//       gradient:{ style: "Primary Gradient" },  // optional, paint style name
//     },
//   });
//
// Token sources: { variable: "VariableID:x:y" } | { style: "<paint style name>" } | { hex: "#RRGGBB" }.
// Use variables when the kit has colour variables, paint styles when it only has styles.
// Every builder returns the node it made so you can adjust it.

const KIT = {};
(function () {
  const hx = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
  KIT.hex = hx;
  let CFG, PAGE, VARS = {}, STYLES = {};

  KIT.init = async function (cfg) {
    CFG = cfg;
    PAGE = await figma.getNodeByIdAsync(cfg.page);
    await figma.setCurrentPageAsync(PAGE);
    for (const s of cfg.font.styles) await figma.loadFontAsync({ family: cfg.font.family, style: s });
    for (const [k, t] of Object.entries(cfg.tokens)) {
      if (t.variable) VARS[k] = await figma.variables.getVariableByIdAsync(t.variable);
    }
    const anyStyle = Object.values(cfg.tokens).some((t) => t.style);
    if (anyStyle) for (const s of await figma.getLocalPaintStylesAsync()) STYLES[s.name] = s;
    KIT.page = PAGE;
  };

  // Paint object for a token (variables and hex only). For style tokens use KIT.fill().
  KIT.paint = function (k, opacity) {
    const t = CFG.tokens[k];
    if (!t) throw new Error("Unknown token " + k);
    const op = opacity ?? t.opacity ?? 1;
    let p;
    if (t.variable) p = figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", VARS[k]);
    else if (t.hex) p = { type: "SOLID", color: hx(t.hex) };
    else if (t.style) { const sp = STYLES[t.style].paints[0]; p = JSON.parse(JSON.stringify(sp)); }
    return op === 1 ? p : Object.assign({}, p, { opacity: op });
  };
  // Fill a node with a token. Style tokens are bound with setFillStyleIdAsync (opacity 1 only).
  KIT.fill = async function (node, k, opacity) {
    const t = CFG.tokens[k];
    if (t.style && (opacity ?? 1) === 1) { await node.setFillStyleIdAsync(STYLES[t.style].id); return node; }
    node.fills = [KIT.paint(k, opacity)];
    return node;
  };
  KIT.white = (o = 1) => ({ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: o });
  KIT.black = (o = 1) => ({ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: o });
  KIT.shadow = (a, y, blur, color = "#000000") => ({ type: "DROP_SHADOW", color: Object.assign(hx(color), { a }), offset: { x: 0, y }, radius: blur, spread: 0, visible: true, blendMode: "NORMAL" });

  // ---- primitives ----
  KIT.frame = function (par, name, x, y, w, h, fills = [], radius = 0, clip = false) {
    const f = figma.createFrame(); f.name = name; f.resize(w, h); f.fills = fills; f.cornerRadius = radius; f.clipsContent = clip;
    if (par) par.appendChild(f); f.x = x; f.y = y; return f;
  };
  KIT.rect = function (par, x, y, w, h, fills = [], radius = 0, name = "rect") {
    const r = figma.createRectangle(); r.name = name; r.resize(w, h); r.fills = fills; r.cornerRadius = radius; par.appendChild(r); r.x = x; r.y = y; return r;
  };
  KIT.ellipse = function (par, x, y, w, h, fills = [], name = "ellipse") {
    const e = figma.createEllipse(); e.name = name; e.resize(w, h); e.fills = fills; par.appendChild(e); e.x = x; e.y = y; return e;
  };
  KIT.vector = function (par, d, o = {}) {
    const v = figma.createVector(); v.vectorPaths = [{ windingRule: "NONZERO", data: d }];
    v.strokes = o.stroke ? [o.stroke] : []; v.strokeWeight = o.sw || 2; v.fills = o.fill ? [o.fill] : [];
    v.strokeCap = "ROUND"; v.strokeJoin = "ROUND"; if (o.dash) v.dashPattern = o.dash; v.name = o.name || "vector";
    par.appendChild(v); return v;
  };
  // Text. color: token name, or "WHITE". o: {w, lh, ls, align, style, opacity}
  KIT.text = async function (par, str, x, y, size, o = {}) {
    const t = figma.createText();
    t.fontName = { family: CFG.font.family, style: o.style || "Regular" };
    t.characters = str; t.fontSize = size;
    if (o.lh) t.lineHeight = { unit: "PERCENT", value: o.lh };
    if (o.ls !== undefined) t.letterSpacing = { unit: "PERCENT", value: o.ls };
    if (o.w) { t.textAutoResize = "HEIGHT"; t.resize(o.w, t.height); }
    if (o.align) t.textAlignHorizontal = o.align;
    par.appendChild(t); t.x = x; t.y = y;
    if (o.color === "WHITE") t.fills = [KIT.white(o.opacity ?? 1)];
    else await KIT.fill(t, o.color || "ink", o.opacity);
    return t;
  };
  // Colour one word of a text node with a token (variables, hex or styles incl. gradients).
  KIT.highlight = async function (textNode, word, k) {
    const s = textNode.characters.indexOf(word); if (s < 0) return null;
    const t = CFG.tokens[k];
    if (t.style) await textNode.setRangeFillStyleIdAsync(s, s + word.length, STYLES[t.style].id);
    else textNode.setRangeFills(s, s + word.length, [KIT.paint(k)]);
    return { start: s, x: KIT.measure(textNode.characters.slice(0, s), textNode.fontSize, textNode.fontName.style), w: KIT.measure(word, textNode.fontSize, textNode.fontName.style) };
  };
  // Width of a string, keeping trailing spaces (measured with a "|" marker).
  KIT.measure = function (str, size, style, ls = -2) {
    if (!str) return 0;
    const t = figma.createText(); t.fontName = { family: CFG.font.family, style }; t.fontSize = size; t.letterSpacing = { unit: "PERCENT", value: ls };
    t.characters = str + "|"; const a = t.width; t.characters = "|"; const b = t.width; t.remove(); return a - b;
  };
  // Auto-layout row/column with no default fill.
  KIT.stack = function (par, dir, x, y, o = {}) {
    const f = figma.createAutoLayout(dir); f.fills = o.fills || []; f.itemSpacing = o.gap || 0;
    f.paddingLeft = f.paddingRight = o.px || 0; f.paddingTop = f.paddingBottom = o.py || 0;
    f.counterAxisAlignItems = "CENTER"; if (o.radius !== undefined) f.cornerRadius = o.radius; if (o.name) f.name = o.name;
    par.appendChild(f); f.x = x; f.y = y; return f;
  };
  // Pill chip with text (and optional leading node).
  KIT.chip = async function (par, str, x, y, o = {}) {
    const c = KIT.stack(par, "HORIZONTAL", x, y, { px: o.px || 20, py: o.py || 11, gap: 10, radius: 100, name: "Chip" });
    if (o.bg) await KIT.fill(c, o.bg); else c.fills = [KIT.white()];
    if (o.stroke) { c.strokes = [KIT.paint(o.stroke)]; c.strokeWeight = 1.5; c.strokeAlign = "INSIDE"; }
    const t = figma.createText(); t.fontName = { family: CFG.font.family, style: o.style || "SemiBold" }; t.characters = str; t.fontSize = o.size || 20; c.appendChild(t);
    if (o.color === "WHITE") t.fills = [KIT.white()]; else await KIT.fill(t, o.color || "ink");
    return c;
  };

  // Rotate a node around a centre point.
  KIT.place = function (n, cx, cy, deg = 0) {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), w = n.width, h = n.height;
    n.relativeTransform = [[c, s, cx - (c * w / 2 + s * h / 2)], [-s, c, cy - (-s * w / 2 + c * h / 2)]];
  };
  KIT.detachAll = function (root) {
    for (let i = 0; i < 30; i++) {
      const a = root.findAll((n) => n.type === "INSTANCE"); if (!a.length) break;
      for (const x of a) { try { if (!x.removed) x.detachInstance(); } catch (e) {} }
    }
  };
  // Clone a screen (or any node) into a parent, fully detached.
  KIT.cloneScreen = async function (par, id, x = 0, y = 0) {
    const c = (await figma.getNodeByIdAsync(id)).clone(); par.appendChild(c); c.x = x; c.y = y; KIT.detachAll(c); return c;
  };

  // ---- slides ----
  // A slide: white 1848-wide frame + rounded Canvas (radius 40). Placed at the bottom of the page.
  KIT.slide = async function (name, height, o = {}) {
    let y = 0; for (const n of PAGE.children) y = Math.max(y, n.y + n.height + 160);
    const s = KIT.frame(PAGE, name, 0, y, 1848, height, [KIT.white()], 0, true);
    const cv = KIT.frame(s, "Canvas", 4, 4, 1840, height - 8, [], 40, true);
    await KIT.fill(cv, o.dark ? "dark" : "bg", o.dark ? 1 : undefined);
    return s;
  };
  // Resize a slide and its canvas together.
  KIT.setHeight = function (slide, h) { slide.resize(1848, h); slide.children.find((n) => n.name === "Canvas").resize(1840, h - 8); };
  // Sort frames by name, stack with 160 px gaps, add PNG 1x export settings.
  KIT.restack = function () {
    const slides = PAGE.children.filter((n) => n.type === "FRAME" && /^\d\d — /.test(n.name)).sort((a, b) => a.name.localeCompare(b.name));
    let y = 0; for (const s of slides) { s.x = 0; s.y = y; s.exportSettings = [{ format: "PNG", suffix: "", constraint: { type: "SCALE", value: 1 } }]; y += Math.round(s.height) + 160; }
    return slides.map((s) => s.id + " " + s.name + " h=" + Math.round(s.height));
  };

  // ---- devices ----
  // Frame presets: gradient stops for the metal/ceramic body.
  KIT.FRAMES = {
    ceramic: [[0, "#D4D4D4"], [0.04, "#FFFFFF"], [0.14, "#F1F1F1"], [0.5, "#FFFFFF"], [0.86, "#F1F1F1"], [0.96, "#FFFFFF"], [1, "#BFBFBF"]],
    titanium: [[0, "#9AA3B5"], [0.04, "#FFFFFF"], [0.12, "#CED4DF"], [0.5, "#EEF1F6"], [0.88, "#B3BCCB"], [0.96, "#FFFFFF"], [1, "#9AA3B5"]],
    graphite: [[0, "#2A2C30"], [0.04, "#6A6E76"], [0.14, "#3A3D42"], [0.5, "#4A4E55"], [0.86, "#3A3D42"], [0.96, "#6A6E76"], [1, "#2A2C30"]],
  };
  const grad = (stops) => ({ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: stops.map(([p, h]) => ({ position: p, color: Object.assign(hx(h), { a: 1 }) })) });
  // iPhone mockup holding a real screen. o: {frame: preset name | stops array, screenH (default 812, set full height for long screens),
  //   base: id of a screen to show dimmed behind a bottom sheet, sy: scroll offset, shadow: 0..1}
  KIT.phone = async function (par, screenId, w, cx, cy, deg = 0, o = {}) {
    const SW = 375, SH = o.screenH || 812, W0 = SW + 40, H0 = SH + 40;
    const d = KIT.frame(par, "iPhone", 0, 0, W0, H0, [], 0, false);
    const stops = Array.isArray(o.frame) ? o.frame : KIT.FRAMES[o.frame || "ceramic"];
    [[160, 32], [218, 60], [290, 60]].forEach(([yy, h]) => KIT.rect(d, -3, yy, 5, h, [grad(stops)], 2, "button"));
    KIT.rect(d, W0 - 2, 240, 5, 96, [grad(stops)], 2, "button");
    const body = KIT.rect(d, 0, 0, W0, H0, [grad(stops)], 64, "Frame");
    body.effects = [KIT.shadow(o.shadow ?? 0.18, 40, 80), KIT.shadow(0.08, 8, 20)];
    KIT.rect(d, 6, 6, W0 - 12, H0 - 12, [KIT.black()], 58, "Glass");
    const scr = KIT.frame(d, "Screen", 20, 20, SW, SH, [KIT.white()], 46, true);
    if (o.base) { await KIT.cloneScreen(scr, o.base); KIT.rect(scr, 0, 0, SW, SH, [KIT.black(0.45)], 0, "Scrim"); }
    const c = await KIT.cloneScreen(scr, screenId);
    c.y = o.base ? SH - c.height : -(o.sy || 0);
    if (c.width !== SW) c.rescale(SW / c.width);
    KIT.rect(d, W0 / 2 - 56, 32, 112, 32, [KIT.black()], 16, "Dynamic Island");
    d.rescale(w / W0); KIT.place(d, cx, cy, deg); return d;
  };
  // Frameless screen card (for blueprint / front-page styles and screen walls).
  KIT.screenCard = async function (par, screenId, w, x, y, o = {}) {
    const n = await figma.getNodeByIdAsync(screenId); const h = (o.h || n.height) * (w / n.width);
    const f = KIT.frame(par, "Screen card", x, y, w, h, [KIT.white()], o.radius ?? 24, true);
    if (o.stroke) { f.strokes = [KIT.paint(o.stroke)]; f.strokeWeight = 1; f.strokeAlign = "INSIDE"; }
    f.effects = o.flat ? [] : [KIT.shadow(0.12, 20, 40)];
    const c = await KIT.cloneScreen(f, screenId); c.rescale(w / c.width); return f;
  };
  // Logo clone with its frame fill removed; white: true turns vectors white (for accent bands).
  KIT.logo = async function (par, id, width, x, y, o = {}) {
    const l = await KIT.cloneScreen(par, id, x, y); l.fills = []; l.rescale(width / l.width);
    if (o.white) for (const v of l.findAll((n) => n.type === "VECTOR" || n.type === "TEXT")) v.fills = [KIT.white()];
    return l;
  };
})();
