// theme-to-figma.js: mode C only. Creates colour variables and text styles in the teammate's
// new Figma file from the product's code theme, so the deck can bind to real variables.
// Fill THEME from analyse-code.py output (pick the real brand colours; check them in the running app).

const THEME = {
  primary: "#2563EB",          // main brand colour
  secondary: null,             // optional second accent, e.g. "#F59E0B"
  neutralBase: "#111827",      // darkest text colour
  darkBackground: null,        // set if the app has a dark theme, e.g. "#0B0F19"
  font: "Inter",               // product font family as installed in Figma
};

const hx = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const mix = (a, b, t) => ({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
const W = { r: 1, g: 1, b: 1 }, K = { r: 0, g: 0, b: 0 };
// 50..900 scale around the base colour at 500.
function scale(hex) {
  const c = hx(hex), out = {};
  [[50, 0.92], [100, 0.84], [200, 0.68], [300, 0.5], [400, 0.25]].forEach(([s, t]) => (out[s] = mix(c, W, t)));
  out[500] = c;
  [[600, 0.15], [700, 0.32], [800, 0.5], [900, 0.66]].forEach(([s, t]) => (out[s] = mix(c, K, t)));
  return out;
}

// Neutral scale: 900 is the product's darkest text colour, lighter steps mix it towards white.
function neutralScale(hex) {
  const base = hx(hex), out = {};
  [[50, 0.96], [100, 0.9], [200, 0.8], [300, 0.66], [400, 0.5], [500, 0.38], [600, 0.27], [700, 0.17], [800, 0.08], [900, 0]].forEach(([s, t]) => (out[s] = mix(base, W, t)));
  return out;
}
const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
// In Dark mode, neutrals flip (50 <-> 900); brand scales keep their values.
const flip = (step) => STEPS[STEPS.length - 1 - STEPS.indexOf(step)];

const col = figma.variables.createVariableCollection("Product Colors");
const light = col.modes[0].modeId; col.renameMode(light, "Light");
const dark = THEME.darkBackground ? col.addMode("Dark") : null;
const made = [];
function addScale(name, s, flipInDark) {
  for (const step of STEPS) {
    const v = figma.variables.createVariable(`${name}/${step}`, col, "COLOR");
    v.scopes = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
    v.setValueForMode(light, s[step]);
    if (dark) v.setValueForMode(dark, flipInDark ? s[flip(step)] : s[step]);
    made.push(v.name);
  }
}
addScale("Primary", scale(THEME.primary), false);
if (THEME.secondary) addScale("Secondary", scale(THEME.secondary), false);
addScale("Neutral", neutralScale(THEME.neutralBase), true);
const bg = figma.variables.createVariable("Background", col, "COLOR");
bg.scopes = ["FRAME_FILL", "SHAPE_FILL"]; bg.setValueForMode(light, W); if (dark) bg.setValueForMode(dark, hx(THEME.darkBackground));
made.push("Background");

// Text styles: a compact type ramp in the product font.
const fonts = (await figma.listAvailableFontsAsync()).filter((f) => f.fontName.family === THEME.font).map((f) => f.fontName.style);
if (!fonts.length) throw new Error(`Font "${THEME.font}" is not available in Figma. Install it or pick the closest available family.`);
const pick = (...want) => want.find((w) => fonts.includes(w)) || fonts[0];
const ramp = [["Display/Large", 57, pick("Bold", "SemiBold")], ["Headline/Large", 32, pick("Bold", "SemiBold")], ["Headline/Small", 24, pick("SemiBold", "Bold")],
  ["Title/Medium", 16, pick("SemiBold", "Medium")], ["Body/Large", 16, pick("Regular")], ["Body/Medium", 14, pick("Regular")], ["Label/Small", 11, pick("Medium", "Regular")]];
const styles = [];
for (const [n, size, style] of ramp) {
  await figma.loadFontAsync({ family: THEME.font, style });
  const t = figma.createTextStyle(); t.name = n; t.fontName = { family: THEME.font, style }; t.fontSize = size; styles.push(n);
}
return { collection: col.id, modes: col.modes.map((m) => m.name), variables: made.length, textStyles: styles };
