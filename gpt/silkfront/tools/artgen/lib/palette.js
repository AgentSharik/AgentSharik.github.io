// SILKFRONT master palette. Every generator pulls colours from here only,
// which is what keeps humans, spiders, buildings and icons in one style.
const P = {
  // Shared world / lighting
  ink: '#0b0a10', night: '#151520', fog: '#8a94a8', moon: '#cfd8e8', moonHalo: '#9fb2d0',
  ground: '#2b2a2c', groundLit: '#3d3c3a', moss: '#2f3a2c', mossLit: '#46553d', mud: '#3a3029',
  stone: '#55565e', stoneLit: '#7a7d86', stoneDark: '#33343b', bone: '#d8d0bc', boneDark: '#9b917b',
  wood: '#4a3526', woodLit: '#6b4e36', leaf: '#26332a', leafLit: '#3c4d3b', deadwood: '#4b4540',

  // Faction 1 — Order of the Last Light
  graphite: '#2e3036', steel: '#7d8590', steelLit: '#b6bec8', silver: '#d6dce4',
  bordeaux: '#6e1a24', bordeauxLit: '#9a2a36', gold: '#b08d4a', goldLit: '#d9b96a',
  amber: '#f0a840', torch: '#ffb648', leather: '#5a4030', cloth: '#3a3440', holy: '#ffe7a8',

  // Faction 2 — Ancient Colony
  chitin: '#1b1820', chitinLit: '#3a3346', violet: '#3d2550', violetLit: '#5d3a78', crimson: '#5c1624',
  coldBlue: '#2c4d78', silk: '#e4e0ea', silkDim: '#a9a3b5', grey: '#5e5a66', teal: '#47c3b4', tealGlow: '#7ff5e2',
  venom: '#9ef06a', eye: '#d4486a',

  // Team colours: must be visible on dark ground (readability rule)
  teamHuman: '#c8323f', teamSpider: '#38d2c0',
  selectAlly: '#58e070', selectEnemy: '#e04848',
};

const SWATCHES = {
  'World & light': ['ink', 'night', 'fog', 'moon', 'ground', 'groundLit', 'moss', 'stone', 'stoneLit', 'bone', 'wood', 'leaf'],
  'Order of the Last Light': ['graphite', 'steel', 'steelLit', 'silver', 'bordeaux', 'bordeauxLit', 'gold', 'goldLit', 'amber', 'torch', 'leather', 'holy'],
  'Ancient Colony': ['chitin', 'chitinLit', 'violet', 'violetLit', 'crimson', 'coldBlue', 'silk', 'silkDim', 'grey', 'teal', 'tealGlow', 'eye'],
  'Readability (team / selection)': ['teamHuman', 'teamSpider', 'selectAlly', 'selectEnemy'],
};

module.exports = { P, SWATCHES };
