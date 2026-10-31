// SILKFRONT art generator core: colour utils, per-file gradient registry,
// SVG -> PNG (alpha) rendering via resvg, and the asset manifest registry.
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const SILK = path.resolve(__dirname, '../../..');
const ART = path.join(SILK, 'ART');
const SRC = path.join(SILK, 'ART_SRC');
const manifest = [];

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lt = (c, t) => mix(c, '#e8eef8', t); // lighten toward cold moonlight
const dk = (c, t) => mix(c, '#07060b', t); // darken toward ink

let defs = [];
let cache = {};
let uid = 0;
function begin() { defs = []; cache = {}; uid = 0; }
function addDef(s) { defs.push(s); }
function id(p) { uid += 1; return `${p}${uid}`; }

// Moonlit form shading: light from top-left, ink bottom-right.
function sh(c, k = 1) {
  const key = c + k;
  if (cache[key]) return cache[key];
  const i = id('g');
  addDef(`<linearGradient id="${i}" x1="0.15" y1="0" x2="0.85" y2="1">` +
    `<stop offset="0" stop-color="${lt(c, 0.28 * k)}"/><stop offset="0.45" stop-color="${c}"/>` +
    `<stop offset="1" stop-color="${dk(c, 0.5 * k)}"/></linearGradient>`);
  return (cache[key] = `url(#${i})`);
}
// Vertical gradient for skies, ground, banners
function vg(top, bottom) {
  const key = 'v' + top + bottom;
  if (cache[key]) return cache[key];
  const i = id('v');
  addDef(`<linearGradient id="${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>` +
    `<stop offset="1" stop-color="${bottom}"/></linearGradient>`);
  return (cache[key] = `url(#${i})`);
}
// Radial glow (torches, bioluminescence, magic)
function glow(c, a = 0.9) {
  const key = 'r' + c + a;
  if (cache[key]) return cache[key];
  const i = id('r');
  addDef(`<radialGradient id="${i}"><stop offset="0" stop-color="${lt(c, 0.5)}" stop-opacity="${a}"/>` +
    `<stop offset="0.35" stop-color="${c}" stop-opacity="${a * 0.6}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
  return (cache[key] = `url(#${i})`);
}

// Seeded RNG so every build produces identical art (stable diffs, stable atlases).
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

const STATUS = { DONE: 'ready (concept v1)', PLACEHOLDER: 'placeholder' };

/**
 * Render one asset. `body` is SVG markup drawn in a w x h viewBox.
 * bg=null -> transparent PNG. Writes SVG master to ART_SRC and PNG to ART,
 * then records the file in the manifest.
 */
function render(rel, w, h, body, meta = {}) {
  const { bg = null, scale = 1, purpose = '', category = 'misc' } = meta;
  const bgRect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>${defs.join('')}</defs>${bgRect}${body}</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: Math.round(w * scale) }, font: { loadSystemFonts: false } }).render().asPng();
  const out = path.join(ART, rel);
  const src = path.join(SRC, rel.replace(/\.png$/, '.svg'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.mkdirSync(path.dirname(src), { recursive: true });
  fs.writeFileSync(out, png);
  fs.writeFileSync(src, svg);
  manifest.push({ file: 'ART/' + rel.replace(/\\/g, '/'), w: Math.round(w * scale), h: Math.round(h * scale),
    alpha: !bg, purpose, category, status: STATUS.DONE, bytes: png.length });
  begin();
  return out;
}

const getDefs = () => defs.join('');

module.exports = { SILK, ART, SRC, manifest, hex, mix, lt, dk, sh, vg, glow, addDef, id, begin, getDefs, rng, render, STATUS };
