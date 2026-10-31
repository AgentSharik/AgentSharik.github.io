// Generator for SILKFRONT UI Assets (Warcraft 3 + Gothic Spider Fantasy Inspired)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ASSETS = {};

// Helper to wrap SVG
function svg(width, height, content, viewBox = `0 0 ${width} ${height}`) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
<defs>
  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#fff1c4"/>
    <stop offset="35%" stop-color="#e5b85c"/>
    <stop offset="70%" stop-color="#b8892d"/>
    <stop offset="100%" stop-color="#724e13"/>
  </linearGradient>
  <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#d4af7a"/>
    <stop offset="50%" stop-color="#936c3e"/>
    <stop offset="100%" stop-color="#4d351b"/>
  </linearGradient>
  <linearGradient id="ironGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#555861"/>
    <stop offset="50%" stop-color="#34373d"/>
    <stop offset="100%" stop-color="#1d1e22"/>
  </linearGradient>
  <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#383027"/>
    <stop offset="50%" stop-color="#241e17"/>
    <stop offset="100%" stop-color="#14110d"/>
  </linearGradient>
  <linearGradient id="essenceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#e4d4ff"/>
    <stop offset="30%" stop-color="#b582ff"/>
    <stop offset="70%" stop-color="#793eed"/>
    <stop offset="100%" stop-color="#3b1180"/>
  </linearGradient>
  <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#ba864e"/>
    <stop offset="50%" stop-color="#7d5229"/>
    <stop offset="100%" stop-color="#442a12"/>
  </linearGradient>
  <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#fff4b8"/>
    <stop offset="40%" stop-color="#ffb834"/>
    <stop offset="80%" stop-color="#d46b08"/>
    <stop offset="100%" stop-color="#612500"/>
  </linearGradient>
  <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#ff8585"/>
    <stop offset="40%" stop-color="#d92b2b"/>
    <stop offset="80%" stop-color="#800f0f"/>
    <stop offset="100%" stop-color="#3a0404"/>
  </linearGradient>
  <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="40%" stop-color="#d1d7de"/>
    <stop offset="75%" stop-color="#8e97a3"/>
    <stop offset="100%" stop-color="#4e555f"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
    <stop offset="60%" stop-color="transparent"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
  </radialGradient>
  <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>
  <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>
</defs>
${content}
</svg>`;
}

// ----------------------------------------------------
// 1. RESOURCES
// ----------------------------------------------------

// Essence (Purple radiant crystal cluster)
ASSETS['res_essence.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#1b1228" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Glow backdrop -->
  <path d="M32 10 L48 24 L42 50 L22 50 L16 24 Z" fill="url(#essenceGrad)" opacity="0.3" filter="url(#glowPurple)"/>
  <!-- Central Crystal Spike -->
  <polygon points="32,8 39,26 32,54 25,26" fill="url(#essenceGrad)"/>
  <polygon points="32,8 39,26 32,54" fill="#d2aeff" opacity="0.6"/>
  <polygon points="32,8 25,26 32,54" fill="#581ca6"/>
  <!-- Left Crystal Spike -->
  <polygon points="20,18 28,30 20,48 14,32" fill="url(#essenceGrad)"/>
  <polygon points="20,18 28,30 20,48" fill="#caa1ff" opacity="0.7"/>
  <polygon points="20,18 14,32 20,48" fill="#471489"/>
  <!-- Right Crystal Spike -->
  <polygon points="44,18 50,32 44,48 36,30" fill="url(#essenceGrad)"/>
  <polygon points="44,18 36,30 44,48" fill="#caa1ff" opacity="0.7"/>
  <polygon points="44,18 50,32 44,48" fill="#471489"/>
  <!-- Specular highlights -->
  <polygon points="32,8 35,24 32,32 30,22" fill="#ffffff" opacity="0.9"/>
  <polygon points="20,18 23,28 20,34" fill="#ffffff" opacity="0.8"/>
  <polygon points="44,18 43,26 44,34" fill="#ffffff" opacity="0.8"/>
  <!-- Tiny sparks -->
  <circle cx="28" cy="14" r="1.5" fill="#ffffff"/>
  <circle cx="38" cy="12" r="1.5" fill="#ffffff"/>
  <circle cx="48" cy="38" r="1.5" fill="#ffffff"/>
`);

// Wood (Tied gothic lumber logs)
ASSETS['res_wood.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#18130e" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Log stack shadows -->
  <ellipse cx="32" cy="48" rx="20" ry="6" fill="#000000" opacity="0.5"/>
  <!-- Lower left log -->
  <g transform="translate(14, 28)">
    <rect x="0" y="0" width="22" height="18" rx="3" fill="url(#woodGrad)"/>
    <ellipse cx="2" cy="9" rx="3" ry="9" fill="#9c6d3d" stroke="#593a19"/>
    <circle cx="2" cy="9" r="4" fill="none" stroke="#593a19" stroke-width="1"/>
  </g>
  <!-- Lower right log -->
  <g transform="translate(28, 28)">
    <rect x="0" y="0" width="22" height="18" rx="3" fill="url(#woodGrad)"/>
    <ellipse cx="22" cy="9" rx="3" ry="9" fill="#9c6d3d" stroke="#593a19"/>
    <circle cx="22" cy="9" r="4" fill="none" stroke="#593a19" stroke-width="1"/>
  </g>
  <!-- Top central log -->
  <g transform="translate(21, 15)">
    <rect x="0" y="0" width="24" height="18" rx="3" fill="url(#woodGrad)"/>
    <line x1="4" y1="5" x2="20" y2="5" stroke="#331e0b" stroke-width="1.5"/>
    <line x1="6" y1="12" x2="18" y2="12" stroke="#331e0b" stroke-width="1.5"/>
    <ellipse cx="24" cy="9" rx="3" ry="9" fill="#a87642" stroke="#593a19"/>
    <circle cx="24" cy="9" r="4" fill="none" stroke="#593a19" stroke-width="1"/>
  </g>
  <!-- Iron binding band -->
  <rect x="29" y="14" width="6" height="34" rx="1" fill="url(#ironGrad)" stroke="#797d87" stroke-width="0.75"/>
  <circle cx="32" cy="20" r="1" fill="#fff"/>
  <circle cx="32" cy="32" r="1" fill="#fff"/>
  <circle cx="32" cy="42" r="1" fill="#fff"/>
  <!-- Green moss tufts -->
  <path d="M22 15 Q24 12 27 14 Q29 11 31 15 Z" fill="#4d7831"/>
  <path d="M38 32 Q40 29 43 31 Q45 28 47 32 Z" fill="#3f6627"/>
`);

// Supply / Population (Gothic knight helm & spider crest)
ASSETS['res_supply.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#141416" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Ornate helm -->
  <path d="M20 38 C18 24 24 16 32 14 C40 16 46 24 44 38 C43 46 38 50 32 50 C26 50 21 46 20 38 Z" fill="url(#ironGrad)" stroke="#787f8f" stroke-width="1.5"/>
  <!-- Visor slit & vents -->
  <path d="M22 28 C26 27 38 27 42 28 C41 33 39 36 32 37 C25 36 23 33 22 28 Z" fill="#0d0e12" stroke="#8c95a6" stroke-width="1"/>
  <line x1="24" y1="31" x2="40" y2="31" stroke="#ffb834" stroke-width="1.5"/>
  <!-- Golden crest on forehead -->
  <polygon points="32,10 35,17 32,19 29,17" fill="url(#goldGrad)"/>
  <line x1="32" y1="18" x2="32" y2="26" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Chin guard rivets -->
  <circle cx="28" cy="42" r="1.2" fill="url(#goldGrad)"/>
  <circle cx="32" cy="44" r="1.2" fill="url(#goldGrad)"/>
  <circle cx="36" cy="42" r="1.2" fill="url(#goldGrad)"/>
  <!-- Subtle web filigree behind helm -->
  <path d="M12 20 L24 24 M10 32 L22 32 M12 44 L22 40" stroke="#717a8c" stroke-width="1" opacity="0.4"/>
  <path d="M52 20 L40 24 M54 32 L42 32 M52 44 L42 40" stroke="#717a8c" stroke-width="1" opacity="0.4"/>
`);

// Silk (From Photo 2: Dense woven spherical cocoon ball)
ASSETS['res_silk.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#121317" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Core glow -->
  <circle cx="32" cy="32" r="18" fill="#1b2029"/>
  <!-- Woven strands sphere -->
  <ellipse cx="32" cy="32" rx="18" ry="17" fill="none" stroke="url(#silkGrad)" stroke-width="2.5"/>
  <ellipse cx="32" cy="32" rx="12" ry="17" fill="none" stroke="#b0b9c4" stroke-width="1.8" transform="rotate(30 32 32)"/>
  <ellipse cx="32" cy="32" rx="17" ry="11" fill="none" stroke="#dbe2ea" stroke-width="1.8" transform="rotate(65 32 32)"/>
  <ellipse cx="32" cy="32" rx="17" ry="9" fill="none" stroke="#8d97a5" stroke-width="1.5" transform="rotate(-40 32 32)"/>
  <ellipse cx="32" cy="32" rx="7" ry="17" fill="none" stroke="#eef3f8" stroke-width="1.5" transform="rotate(-15 32 32)"/>
  <!-- Chaotic crossing threads -->
  <path d="M18 22 Q32 28 46 20 M16 35 Q30 38 47 31 M22 45 Q33 30 42 45" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.85"/>
  <path d="M22 18 Q35 34 38 48 M42 18 Q31 34 24 48" stroke="#a0abb8" stroke-width="1" fill="none"/>
  <!-- Ambient glow in center -->
  <circle cx="31" cy="30" r="5" fill="#f0f6ff" opacity="0.4" filter="url(#glowGold)"/>
`);

// Meat / Food (From Photo 2: Raw marbled meat / carcass)
ASSETS['res_meat.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#190e0e" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Shadow -->
  <ellipse cx="34" cy="46" rx="20" ry="7" fill="#000" opacity="0.6"/>
  <!-- Main meat slab -->
  <path d="M16 30 C15 20 25 15 38 18 C48 20 52 28 48 38 C44 46 32 49 22 46 C15 43 17 36 16 30 Z" fill="url(#crimsonGrad)" stroke="#5e0c0c" stroke-width="1.5"/>
  <!-- Marbling fat lines -->
  <path d="M22 25 Q32 24 42 26" stroke="#fcebeb" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M20 34 Q28 32 36 37 Q42 36 44 32" stroke="#f7d4d4" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path d="M26 42 Q34 40 40 43" stroke="#f7d4d4" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
  <!-- Bone stub on left -->
  <ellipse cx="20" cy="24" rx="4" ry="3" fill="#e8ded1" stroke="#9e8f7a" stroke-width="1"/>
  <circle cx="19" cy="23" r="1.5" fill="#fff"/>
`);

// Crystals (From Photo 2: Dark sharp obsidian/crystal shards)
ASSETS['res_crystals.svg'] = svg(64, 64, `
  <circle cx="32" cy="32" r="28" fill="#101116" stroke="url(#goldGrad)" stroke-width="2"/>
  <ellipse cx="32" cy="48" rx="18" ry="6" fill="#000" opacity="0.7"/>
  <!-- Obsidian Crystal Cluster -->
  <polygon points="32,10 40,28 34,52 24,46 22,26" fill="#2d3240" stroke="#5a637a" stroke-width="1"/>
  <polygon points="32,10 40,28 34,52" fill="#4a5266"/>
  <polygon points="32,10 34,52 24,46" fill="#1e222d"/>
  <!-- Specular blade edge -->
  <line x1="32" y1="10" x2="34" y2="52" stroke="#a4b3d6" stroke-width="1.5"/>
  <!-- Left crystal -->
  <polygon points="18,22 26,32 20,48 14,40" fill="#242833" stroke="#50586d" stroke-width="1"/>
  <polygon points="18,22 26,32 20,48" fill="#3a4154"/>
  <line x1="18" y1="22" x2="20" y2="48" stroke="#8796b8" stroke-width="1.2"/>
  <!-- Right crystal -->
  <polygon points="44,20 50,34 42,50 36,36" fill="#282d3b" stroke="#50586d" stroke-width="1"/>
  <polygon points="44,20 36,36 42,50" fill="#3d4559"/>
  <line x1="44" y1="20" x2="42" y2="50" stroke="#9bb0d9" stroke-width="1.2"/>
  <!-- Purple ethereal glow near base -->
  <circle cx="32" cy="42" r="8" fill="#8c4bff" opacity="0.35" filter="url(#glowPurple)"/>
`);

// ----------------------------------------------------
// 2. COMMAND & ACTION ICONS
// ----------------------------------------------------

// Attack (Crossed sword & battleaxe with fiery red rim)
ASSETS['cmd_attack.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Inner bevel -->
  <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Fiery circle backing -->
  <circle cx="32" cy="32" r="20" fill="url(#crimsonGrad)" opacity="0.35"/>
  <!-- Crossed Broadsword -->
  <g transform="rotate(45 32 32)">
    <rect x="30" y="8" width="4" height="40" rx="1" fill="#d9e0ea"/>
    <polygon points="32,6 30,9 34,9" fill="#ffffff"/>
    <line x1="32" y1="8" x2="32" y2="44" stroke="#8b95a5" stroke-width="1"/>
    <!-- Guard & Hilt -->
    <rect x="24" y="44" width="16" height="3" rx="1" fill="url(#goldGrad)"/>
    <rect x="30.5" y="47" width="3" height="8" fill="#543715"/>
    <circle cx="32" cy="56" r="2.5" fill="url(#goldGrad)"/>
  </g>
  <!-- Crossed Battleaxe -->
  <g transform="rotate(-45 32 32)">
    <!-- Shaft -->
    <rect x="30.5" y="8" width="3" height="48" rx="1" fill="#664627" stroke="#331f0e" stroke-width="0.5"/>
    <!-- Axe Blade -->
    <path d="M32 14 C42 12 48 18 46 28 C42 28 36 24 32 22 Z" fill="#cfd6e0" stroke="#7e899b" stroke-width="1"/>
    <!-- Spiked Back -->
    <polygon points="32,16 22,18 32,22" fill="#9faab8"/>
  </g>
`);

// Stop (Spiked heavy iron shield / raised hand)
ASSETS['cmd_stop.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Heavy Heater Shield -->
  <path d="M18 16 L46 16 L46 32 C46 44 32 52 32 52 C32 52 18 44 18 32 Z" fill="url(#ironGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Inner rim -->
  <path d="M22 20 L42 20 L42 32 C42 41 32 47 32 47 C32 47 22 41 22 32 Z" fill="#1e2026" stroke="#4f535e" stroke-width="1"/>
  <!-- Center Stop Cross / Spike -->
  <polygon points="32,22 35,31 44,32 36,37 39,45 32,40 25,45 28,37 20,32 29,31" fill="url(#goldGrad)"/>
  <circle cx="32" cy="34" r="3" fill="#941d1d" stroke="url(#goldGrad)" stroke-width="1"/>
`);

// Return Cargo / Harvest (Supply cart & curved return arrow)
ASSETS['cmd_return.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Wood cart -->
  <polygon points="16,28 48,28 43,44 21,44" fill="url(#woodGrad)" stroke="#3d2209" stroke-width="1.5"/>
  <!-- Wooden wheels -->
  <circle cx="23" cy="46" r="6" fill="#2d1c0d" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <circle cx="41" cy="46" r="6" fill="#2d1c0d" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <!-- Glowing cargo in cart -->
  <circle cx="28" cy="25" r="5" fill="#caa1ff"/>
  <circle cx="36" cy="24" r="6" fill="url(#goldGrad)"/>
  <circle cx="32" cy="21" r="5" fill="#f0f6ff"/>
  <!-- Curved Golden Arrow pointing back -->
  <path d="M46 14 Q32 8 20 16" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
  <polygon points="16,15 24,12 21,20" fill="url(#goldGrad)"/>
`);

// Cancel (Red wax seal with glowing X)
ASSETS['cmd_cancel.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Wax seal -->
  <circle cx="32" cy="32" r="18" fill="url(#crimsonGrad)" stroke="#570a0a" stroke-width="2"/>
  <circle cx="32" cy="32" r="14" fill="#690e0e" stroke="#9c1b1b" stroke-width="1"/>
  <!-- Cancel X -->
  <line x1="23" y1="23" x2="41" y2="41" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  <line x1="41" y1="23" x2="23" y2="41" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
`);

// Rally Point (Banner flag on ground)
ASSETS['cmd_rally.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Concentric rally rings on ground -->
  <ellipse cx="32" cy="48" rx="16" ry="6" fill="none" stroke="#ffb834" stroke-width="1.5" stroke-dasharray="3,3"/>
  <ellipse cx="32" cy="48" rx="8" ry="3" fill="#ffb834" opacity="0.3"/>
  <!-- Flag pole -->
  <line x1="26" y1="12" x2="26" y2="48" stroke="url(#goldGrad)" stroke-width="2.5"/>
  <circle cx="26" cy="11" r="2.5" fill="url(#goldGrad)"/>
  <!-- Waving banner -->
  <path d="M27 13 C34 11 38 17 48 14 L44 26 C36 29 32 23 27 25 Z" fill="url(#amberGrad)" stroke="#803b00" stroke-width="1"/>
  <polygon points="33,16 37,20 33,24 35,20" fill="#fff"/>
`);

// ----------------------------------------------------
// 3. BUILDINGS (HUMAN & SPIDER)
// ----------------------------------------------------

// Citadel (Human Capital: Grand fortress with twin spires & stained glass)
ASSETS['bld_citadel.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Fortress silhouette -->
  <!-- Left tower -->
  <rect x="10" y="22" width="12" height="32" fill="url(#stoneGrad)" stroke="#524332" stroke-width="1"/>
  <polygon points="8,22 16,10 24,22" fill="#364966" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Right tower -->
  <rect x="42" y="22" width="12" height="32" fill="url(#stoneGrad)" stroke="#524332" stroke-width="1"/>
  <polygon points="40,22 48,10 56,22" fill="#364966" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Central Keep -->
  <rect x="20" y="28" width="24" height="26" fill="#29231c" stroke="#524332" stroke-width="1"/>
  <!-- Arched entrance -->
  <path d="M27 54 L27 40 C27 36 37 36 37 40 L37 54 Z" fill="#0d0a08" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <!-- Glowing Rose window -->
  <circle cx="32" cy="33" r="4.5" fill="url(#amberGrad)" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Golden banners atop towers -->
  <polygon points="16,10 16,4 23,7" fill="url(#goldGrad)"/>
  <polygon points="48,10 48,4 55,7" fill="url(#goldGrad)"/>
  <!-- Embrasures / crenels -->
  <rect x="22" y="25" width="4" height="3" fill="#364966"/>
  <rect x="30" y="25" width="4" height="3" fill="#364966"/>
  <rect x="38" y="25" width="4" height="3" fill="#364966"/>
`);

// Barracks (Human military keep with crossed weapons)
ASSETS['bld_barracks.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Sturdy keep -->
  <polygon points="12,30 32,18 52,30 52,52 12,52" fill="#2d251d" stroke="#594734" stroke-width="1.5"/>
  <!-- Slanted slate roof -->
  <polygon points="9,31 32,17 55,31 52,35 32,23 12,35" fill="#3f4a59" stroke="#68788c" stroke-width="1"/>
  <!-- Heavy iron-reinforced door -->
  <rect x="26" y="38" width="12" height="14" fill="#140f0b" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <!-- Iron studs on door -->
  <circle cx="28" cy="42" r="0.8" fill="#fff"/>
  <circle cx="36" cy="42" r="0.8" fill="#fff"/>
  <circle cx="28" cy="48" r="0.8" fill="#fff"/>
  <circle cx="36" cy="48" r="0.8" fill="#fff"/>
  <!-- Crossed axes badge above door -->
  <circle cx="32" cy="30" r="5" fill="#141416" stroke="url(#goldGrad)" stroke-width="1"/>
  <line x1="29" y1="27" x2="35" y2="33" stroke="#ffb834" stroke-width="1.5"/>
  <line x1="35" y1="27" x2="29" y2="33" stroke="#ffb834" stroke-width="1.5"/>
  <!-- Side training target -->
  <circle cx="18" cy="44" r="3" fill="#8a2020" stroke="#fff" stroke-width="0.8"/>
`);

// Chapel (Human Church: Gothic Spire with glowing cross)
ASSETS['bld_chapel.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Gothic Chapel Tower -->
  <rect x="24" y="24" width="16" height="30" fill="#2b231b" stroke="#594633" stroke-width="1"/>
  <!-- Soaring steeple roof -->
  <polygon points="20,24 32,8 44,24" fill="#304159" stroke="#5b7191" stroke-width="1"/>
  <!-- Radiant Holy Cross atop -->
  <line x1="32" y1="4" x2="32" y2="10" stroke="url(#goldGrad)" stroke-width="2" filter="url(#glowGold)"/>
  <line x1="29" y1="6" x2="35" y2="6" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Gothic arched stained glass window -->
  <path d="M29 38 L29 28 C29 25 35 25 35 28 L35 38 Z" fill="url(#amberGrad)" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Side buttresses -->
  <polygon points="18,54 24,40 24,54" fill="#201a14"/>
  <polygon points="46,54 40,40 40,54" fill="#201a14"/>
  <!-- Entrance door -->
  <path d="M30 54 L30 46 C30 44 34 44 34 46 L34 54 Z" fill="#0d0906" stroke="url(#goldGrad)" stroke-width="1"/>
`);

// Watch Tower (Human stone archer tower)
ASSETS['bld_tower.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Tapered stone tower shaft -->
  <polygon points="24,20 40,20 43,54 21,54" fill="#2a231b" stroke="#574533" stroke-width="1.5"/>
  <!-- Overhanging battlement -->
  <rect x="20" y="16" width="24" height="6" fill="#3c3124" stroke="url(#goldGrad)" stroke-width="1"/>
  <rect x="20" y="13" width="5" height="3" fill="#3c3124"/>
  <rect x="29.5" y="13" width="5" height="3" fill="#3c3124"/>
  <rect x="39" y="13" width="5" height="3" fill="#3c3124"/>
  <!-- Arrow slits -->
  <rect x="31" y="26" width="2" height="6" fill="#0d0a07"/>
  <rect x="31" y="38" width="2" height="6" fill="#0d0a07"/>
  <!-- Slate cap roof -->
  <polygon points="18,16 32,6 46,16" fill="#303c4f" stroke="#5b6e8a" stroke-width="1"/>
  <!-- Beacon brazier smoke / fire -->
  <circle cx="32" cy="7" r="1.5" fill="#ffaa22"/>
`);

// Main Nest (Spider Capital from Photo 2: "Главное гнездо")
ASSETS['bld_nest.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Dark organic mound -->
  <path d="M12 50 C10 32 20 20 32 18 C44 20 54 32 52 50 C44 54 20 54 12 50 Z" fill="#1c1613" stroke="#3b2b20" stroke-width="1.5"/>
  <!-- Bone and branch ribbing -->
  <path d="M32 18 Q20 30 14 48 M32 18 Q44 30 50 48 M32 18 L32 46" stroke="#4a3728" stroke-width="2" fill="none"/>
  <!-- Dense spider webbing overlay -->
  <path d="M16 42 Q32 36 48 42 M20 32 Q32 26 44 32 M24 24 Q32 20 40 24" stroke="url(#silkGrad)" stroke-width="1.2" fill="none" opacity="0.8"/>
  <path d="M18 46 L32 20 L46 46" stroke="#cbd3dc" stroke-width="1" fill="none" opacity="0.6"/>
  <!-- Bioluminescent glowing amber chambers / egg clusters -->
  <ellipse cx="26" cy="42" rx="3.5" ry="3" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <ellipse cx="38" cy="42" rx="3.5" ry="3" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <ellipse cx="32" cy="34" rx="2.5" ry="2.5" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <!-- Dark cavernous entrance -->
  <path d="M28 52 C28 46 36 46 36 52 Z" fill="#000000"/>
`);

// Incubator (Spider building from Photo 2: "Инкубатор")
ASSETS['bld_incubator.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Tall oval spider egg chrysalis -->
  <ellipse cx="32" cy="34" rx="14" ry="18" fill="#2d2218" stroke="#4f3b28" stroke-width="1.5"/>
  <!-- Chitin carapace plates & carved runes on egg -->
  <path d="M24 24 Q32 28 40 24 M22 34 Q32 38 42 34 M24 44 Q32 46 40 44" stroke="#6b5139" stroke-width="1.5" fill="none"/>
  <!-- Arching spider legs cradling the egg -->
  <path d="M12 48 Q10 26 22 22 M52 48 Q54 26 42 22" stroke="#1f1813" stroke-width="3" fill="none"/>
  <path d="M16 52 Q18 36 26 30 M48 52 Q46 36 38 30" stroke="#36291e" stroke-width="2" fill="none"/>
  <!-- Web shroud wrapping -->
  <path d="M14 44 Q28 40 40 26 M50 44 Q36 40 24 26" stroke="url(#silkGrad)" stroke-width="1.2" fill="none" opacity="0.85"/>
  <!-- Inner pulsing amber life glow -->
  <circle cx="32" cy="34" r="5" fill="url(#amberGrad)" opacity="0.5" filter="url(#glowGold)"/>
`);

// Silk Workshop (Spider building from Photo 2: "Шелковая мастерская")
ASSETS['bld_workshop.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Web tent mound -->
  <polygon points="32,14 12,50 52,50" fill="#1f1915" stroke="#403024" stroke-width="1.5"/>
  <!-- Intricate woven canopy -->
  <path d="M18 44 Q32 38 46 44 M22 34 Q32 28 42 34 M26 24 Q32 20 38 24" stroke="url(#silkGrad)" stroke-width="1.5" fill="none"/>
  <line x1="32" y1="14" x2="16" y2="48" stroke="#d5dde5" stroke-width="1"/>
  <line x1="32" y1="14" x2="48" y2="48" stroke="#d5dde5" stroke-width="1"/>
  <line x1="32" y1="14" x2="32" y2="50" stroke="#d5dde5" stroke-width="1"/>
  <!-- Hanging cocoon lanterns with warm amber glow -->
  <ellipse cx="26" cy="40" rx="3" ry="4" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <ellipse cx="38" cy="40" rx="3" ry="4" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <ellipse cx="32" cy="28" rx="2.5" ry="3" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <!-- Workshop spindle crest -->
  <circle cx="32" cy="14" r="3" fill="url(#silkGrad)"/>
`);

// Web Tower (Spider building from Photo 2: "Паутинная башня")
ASSETS['bld_webtower.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Slender gothic arched spider spire -->
  <path d="M26 22 L24 52 L40 52 L38 22 Z" fill="#1a1512" stroke="#403125" stroke-width="1"/>
  <!-- Flaring legs at base -->
  <path d="M24 44 Q14 48 10 54 M40 44 Q50 48 54 54" stroke="#2b2017" stroke-width="3" fill="none"/>
  <!-- Gothic web dome atop -->
  <polygon points="22,22 32,8 42,22" fill="#2d2218" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Thick spider web shroud around tower -->
  <path d="M18 50 Q32 36 46 50 M20 38 Q32 28 44 38 M24 26 Q32 20 40 26" stroke="url(#silkGrad)" stroke-width="1.5" fill="none" opacity="0.9"/>
  <!-- Glowing amber spider eyes on the watch platform -->
  <circle cx="28" cy="18" r="1.8" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <circle cx="32" cy="16" r="2.2" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <circle cx="36" cy="18" r="1.8" fill="url(#amberGrad)" filter="url(#glowGold)"/>
`);

// Web Barricade (Spider barrier from Photo 2: "Паутинное заграждение")
ASSETS['bld_barricade.svg'] = svg(64, 64, `
  <rect x="2" y="2" width="60" height="60" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Wooden sharpened palisade stakes -->
  <polygon points="12,50 16,22 20,50" fill="#38291a" stroke="#5e442a" stroke-width="1"/>
  <polygon points="22,50 26,16 30,50" fill="#4d3824" stroke="#705234" stroke-width="1"/>
  <polygon points="34,50 38,18 42,50" fill="#38291a" stroke="#5e442a" stroke-width="1"/>
  <polygon points="44,50 48,24 52,50" fill="#4d3824" stroke="#705234" stroke-width="1"/>
  <!-- Dense web netting interlaced between stakes -->
  <path d="M14 30 Q32 22 50 30 M15 40 Q32 32 49 40 M16 48 Q32 42 48 48" stroke="url(#silkGrad)" stroke-width="2" fill="none"/>
  <path d="M16 26 L48 46 M48 26 L16 46" stroke="#b4c0cf" stroke-width="1.2" fill="none" opacity="0.8"/>
  <!-- Sticky amber droplets on web -->
  <circle cx="28" cy="27" r="1.5" fill="url(#amberGrad)"/>
  <circle cx="36" cy="35" r="1.5" fill="url(#amberGrad)"/>
`);

// ----------------------------------------------------
// 4. UNIT PORTRAITS & ICONS
// ----------------------------------------------------

// Novice / Worker ("Послушник" - Hooded monk/builder)
ASSETS['unit_novice.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Monastic Hood & Robes -->
  <path d="M24 90 C22 66 30 52 38 48 C42 46 54 46 58 48 C66 52 74 66 72 90 Z" fill="#3e3122" stroke="#241b11" stroke-width="1.5"/>
  <!-- Face in shadow of cowl -->
  <path d="M36 40 C34 30 40 24 48 24 C56 24 62 30 60 40 C58 50 54 54 48 54 C42 54 38 50 36 40 Z" fill="#cfab88"/>
  <path d="M32 34 C36 20 60 20 64 34 C64 48 58 46 58 38 C56 30 40 30 38 38 C38 46 32 48 32 34 Z" fill="#2d2216"/>
  <!-- Determined eyes in shadow -->
  <ellipse cx="44" cy="38" rx="2" ry="1" fill="#1a140d"/>
  <ellipse cx="52" cy="38" rx="2" ry="1" fill="#1a140d"/>
  <!-- Bronze medallion / key on chest -->
  <circle cx="48" cy="62" r="5" fill="url(#goldGrad)" stroke="#593b0b" stroke-width="1"/>
  <!-- Hammer tool held across chest -->
  <rect x="22" y="60" width="28" height="4" rx="1" fill="#694f33" transform="rotate(-30 36 62)"/>
  <rect x="18" y="46" width="10" height="7" rx="1" fill="#667080" transform="rotate(-30 23 49)"/>
  <!-- Vignette -->
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Human Swordsman
ASSETS['unit_swordsman.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Steel Bascinet Helm -->
  <path d="M28 88 L32 50 C30 34 38 20 48 18 C58 20 66 34 64 50 L68 88 Z" fill="url(#ironGrad)" stroke="#818b9e" stroke-width="1.5"/>
  <!-- Visor Bevel -->
  <polygon points="48,26 60,38 48,54 36,38" fill="#16181f" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <line x1="38" y1="38" x2="58" y2="38" stroke="#ffb834" stroke-width="2"/>
  <!-- Gorget & Pauldron with lion rivet -->
  <path d="M22 86 C24 66 40 64 48 64 C56 64 72 66 74 86 Z" fill="#2d323d" stroke="#5f697d" stroke-width="1.5"/>
  <circle cx="48" cy="74" r="3.5" fill="url(#goldGrad)"/>
  <!-- Broadsword blade near shoulder -->
  <rect x="68" y="24" width="6" height="54" rx="1" fill="#dbe1eb" stroke="#596373" stroke-width="1"/>
  <polygon points="71,18 68,24 74,24" fill="#fff"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Human Crossbowman
ASSETS['unit_crossbowman.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Iron Sallet Helmet -->
  <path d="M30 42 C32 26 42 22 48 22 C54 22 64 26 66 42 L68 50 C60 52 36 52 28 50 Z" fill="url(#ironGrad)" stroke="#7e8899" stroke-width="1.5"/>
  <!-- Vision Slit -->
  <line x1="34" y1="44" x2="62" y2="44" stroke="#ffb834" stroke-width="2"/>
  <!-- Leather Brigandine Armor -->
  <path d="M26 88 L32 54 L64 54 L70 88 Z" fill="#4d3522" stroke="#291a0e" stroke-width="1.5"/>
  <!-- Crossbow arm & iron prod -->
  <path d="M20 62 Q48 50 76 62" stroke="#717c8c" stroke-width="3" fill="none"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Human Knight
ASSETS['unit_knight.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Gilded Great Helm -->
  <path d="M30 30 C30 18 40 14 48 14 C56 14 66 18 66 30 L66 62 C66 66 60 70 48 70 C36 70 30 66 30 62 Z" fill="url(#ironGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Golden Cross Visor -->
  <line x1="48" y1="26" x2="48" y2="52" stroke="url(#goldGrad)" stroke-width="3"/>
  <line x1="36" y1="36" x2="60" y2="36" stroke="url(#goldGrad)" stroke-width="3"/>
  <!-- Plume Crest atop Helm -->
  <path d="M48 14 C46 6 56 4 64 8 C68 12 62 18 48 14 Z" fill="url(#amberGrad)" stroke="url(#goldGrad)" stroke-width="1"/>
  <!-- Ornate gilded pauldrons -->
  <path d="M18 88 C20 68 32 64 48 64 C64 64 76 68 78 88 Z" fill="url(#goldGrad)" stroke="#593b0b" stroke-width="1.5"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Human Priest
ASSETS['unit_priest.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Cleric Mitre / High Cap -->
  <polygon points="36,40 48,16 60,40" fill="#dedede" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <circle cx="48" cy="28" r="2.5" fill="url(#goldGrad)"/>
  <!-- Venerable Face -->
  <ellipse cx="48" cy="46" rx="9" ry="10" fill="#d4b494"/>
  <!-- White beard -->
  <path d="M40 50 C40 68 56 68 56 50 Z" fill="#e6eaed"/>
  <!-- Vestments with golden stole -->
  <path d="M24 90 L36 58 L60 58 L72 90 Z" fill="#24344d" stroke="#121b29" stroke-width="1.5"/>
  <rect x="42" y="58" width="12" height="32" fill="url(#goldGrad)"/>
  <!-- Glowing Holy Sunburst Staff -->
  <circle cx="72" cy="30" r="8" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <line x1="72" y1="38" x2="72" y2="90" stroke="url(#goldGrad)" stroke-width="2.5"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Human Monster Hunter
ASSETS['unit_hunter.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Dark Leather Cowl -->
  <path d="M28 88 L32 46 C32 30 40 22 48 22 C56 22 64 30 64 46 L68 88 Z" fill="#1c1917" stroke="#38332f" stroke-width="1.5"/>
  <!-- Face mask / bandana -->
  <ellipse cx="48" cy="42" rx="9" ry="8" fill="#a88568"/>
  <path d="M38 42 L58 42 L54 54 L42 54 Z" fill="#29221d"/>
  <!-- Piercing amber eyes -->
  <circle cx="43" cy="38" r="1.8" fill="#ffb834"/>
  <circle cx="53" cy="38" r="1.8" fill="#ffb834"/>
  <!-- Silver chains and monster fang trophy necklace -->
  <path d="M34 62 Q48 72 62 62" stroke="#b4bcc7" stroke-width="1.5" fill="none"/>
  <polygon points="48,66 45,76 51,76" fill="#dedede"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Spider Scout
ASSETS['unit_spider_scout.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Head & Chelicerae -->
  <ellipse cx="48" cy="46" rx="14" ry="12" fill="#1c1d24" stroke="#3b3f4d" stroke-width="1.5"/>
  <!-- Cluster of 8 crimson eyes -->
  <circle cx="44" cy="42" r="2.5" fill="#ff3333" filter="url(#glowGold)"/>
  <circle cx="52" cy="42" r="2.5" fill="#ff3333" filter="url(#glowGold)"/>
  <circle cx="41" cy="48" r="1.8" fill="#ff6666"/>
  <circle cx="55" cy="48" r="1.8" fill="#ff6666"/>
  <circle cx="45" cy="51" r="1.2" fill="#ff9999"/>
  <circle cx="51" cy="51" r="1.2" fill="#ff9999"/>
  <!-- Agile slender legs arching around -->
  <path d="M36 42 Q18 24 16 12 M60 42 Q78 24 80 12" stroke="#242833" stroke-width="2.5" fill="none"/>
  <path d="M34 48 Q12 44 8 52 M62 48 Q84 44 88 52" stroke="#242833" stroke-width="2.5" fill="none"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Spider Fang
ASSETS['unit_spider_fang.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Armored Head -->
  <ellipse cx="48" cy="42" rx="16" ry="14" fill="#261b18" stroke="#523933" stroke-width="2"/>
  <!-- Giant curved predatory fangs -->
  <path d="M40 48 Q36 68 42 74 Q44 68 43 50" fill="#d1ded4" stroke="#486950" stroke-width="1"/>
  <path d="M56 48 Q60 68 54 74 Q52 68 53 50" fill="#d1ded4" stroke="#486950" stroke-width="1"/>
  <!-- Dripping venom on fangs -->
  <ellipse cx="42" cy="74" rx="2" ry="3" fill="#88e048" filter="url(#glowGold)"/>
  <ellipse cx="54" cy="74" rx="2" ry="3" fill="#88e048" filter="url(#glowGold)"/>
  <!-- Multi-eyes glowing amber -->
  <circle cx="44" cy="38" r="2.5" fill="url(#amberGrad)"/>
  <circle cx="52" cy="38" r="2.5" fill="url(#amberGrad)"/>
  <circle cx="48" cy="35" r="2" fill="url(#amberGrad)"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Spider Weaver
ASSETS['unit_spider_weaver.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Head & Silk Spinnerets -->
  <ellipse cx="48" cy="44" rx="15" ry="13" fill="#1e1824" stroke="#4a3959" stroke-width="1.5"/>
  <!-- Intricate abdomen silk pattern -->
  <path d="M40 40 Q48 34 56 40 M38 46 Q48 52 58 46" stroke="url(#silkGrad)" stroke-width="1.5" fill="none"/>
  <!-- Eyes -->
  <circle cx="44" cy="40" r="2" fill="#c48aff"/>
  <circle cx="52" cy="40" r="2" fill="#c48aff"/>
  <!-- Woven silk cocoon ball held in pedipalps -->
  <circle cx="48" cy="62" r="8" fill="url(#silkGrad)" stroke="#fff" stroke-width="0.8"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Spider Spitter
ASSETS['unit_spider_spitter.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Bulbous toxic acid sacs -->
  <ellipse cx="48" cy="42" rx="18" ry="16" fill="#1e2617" stroke="#485c34" stroke-width="2"/>
  <ellipse cx="48" cy="40" rx="10" ry="8" fill="#78b839" opacity="0.6" filter="url(#glowGold)"/>
  <!-- Spitting maw -->
  <ellipse cx="48" cy="56" rx="6" ry="4" fill="#0d1408" stroke="#88e048" stroke-width="1.5"/>
  <circle cx="48" cy="56" r="2.5" fill="#a4ff59"/>
  <!-- Sickly yellow eyes -->
  <circle cx="42" cy="34" r="2" fill="#ffff55"/>
  <circle cx="54" cy="34" r="2" fill="#ffff55"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// Spider Armored (Juggernaut)
ASSETS['unit_spider_armored.svg'] = svg(96, 96, `
  <rect width="96" height="96" rx="6" fill="#13100c"/>
  <circle cx="48" cy="48" r="44" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <!-- Massive spiked chitin carapace -->
  <path d="M26 50 C24 28 36 22 48 22 C60 22 72 28 70 50 L66 66 L30 66 Z" fill="#242129" stroke="#544e5e" stroke-width="2"/>
  <!-- Spikes on carapace -->
  <polygon points="34,26 26,16 38,24" fill="#423d4a"/>
  <polygon points="62,26 70,16 58,24" fill="#423d4a"/>
  <polygon points="48,22 48,10 52,22" fill="#423d4a"/>
  <!-- Heavy bone plate frontal mask -->
  <polygon points="40,38 48,32 56,38 52,54 44,54" fill="#d9d0c1" stroke="#8c8272" stroke-width="1.5"/>
  <!-- Red eyes glowing from beneath helmet plate -->
  <circle cx="44" cy="42" r="2" fill="#ff2222"/>
  <circle cx="52" cy="42" r="2" fill="#ff2222"/>
  <circle cx="48" cy="48" r="44" fill="url(#vignette)"/>
`);

// ----------------------------------------------------
// 5. STAT ICONS
// ----------------------------------------------------
ASSETS['stat_hp.svg'] = svg(24, 24, `
  <path d="M12 21 C12 21 3 14 3 8 C3 4.5 5.5 2 9 2 C11 2 12 3 12 4 C12 3 13 2 15 2 C18.5 2 21 4.5 21 8 C21 14 12 21 12 21 Z" fill="url(#crimsonGrad)" stroke="#590808" stroke-width="1"/>
  <circle cx="7.5" cy="6.5" r="1.5" fill="#fff" opacity="0.8"/>
`);
ASSETS['stat_dmg.svg'] = svg(24, 24, `
  <g transform="rotate(45 12 12)">
    <rect x="11" y="2" width="2" height="16" fill="#e0e6ed"/>
    <polygon points="12,1 10.5,3 13.5,3" fill="#fff"/>
    <rect x="8" y="17" width="8" height="2" fill="url(#goldGrad)"/>
    <rect x="11" y="19" width="2" height="4" fill="#543715"/>
  </g>
  <g transform="rotate(-45 12 12)">
    <rect x="11" y="2" width="2" height="16" fill="#e0e6ed"/>
    <polygon points="12,1 10.5,3 13.5,3" fill="#fff"/>
    <rect x="8" y="17" width="8" height="2" fill="url(#goldGrad)"/>
    <rect x="11" y="19" width="2" height="4" fill="#543715"/>
  </g>
`);
ASSETS['stat_armor.svg'] = svg(24, 24, `
  <path d="M5 4 L19 4 L19 12 C19 17 12 21 12 21 C12 21 5 17 5 12 Z" fill="url(#ironGrad)" stroke="url(#goldGrad)" stroke-width="1.2"/>
  <circle cx="12" cy="11" r="2.5" fill="url(#goldGrad)"/>
`);
ASSETS['stat_range.svg'] = svg(24, 24, `
  <circle cx="12" cy="12" r="9" fill="none" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="3" fill="none" stroke="#ffb834" stroke-width="1"/>
  <line x1="12" y1="1" x2="12" y2="7" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <line x1="12" y1="17" x2="12" y2="23" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <line x1="1" y1="12" x2="7" y2="12" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <line x1="17" y1="12" x2="23" y2="12" stroke="url(#goldGrad)" stroke-width="1.5"/>
`);
ASSETS['stat_heal.svg'] = svg(24, 24, `
  <circle cx="12" cy="12" r="10" fill="#1b2416" stroke="#5cb839" stroke-width="1.2"/>
  <rect x="10" y="5" width="4" height="14" rx="1" fill="#88e048"/>
  <rect x="5" y="10" width="14" height="4" rx="1" fill="#88e048"/>
`);
ASSETS['stat_cargo.svg'] = svg(24, 24, `
  <circle cx="12" cy="12" r="10" fill="#1e1810" stroke="url(#goldGrad)" stroke-width="1.2"/>
  <path d="M7 16 C6 12 9 8 12 8 C15 8 18 12 17 16 C16 19 8 19 7 16 Z" fill="url(#amberGrad)"/>
  <circle cx="12" cy="7" r="1.5" fill="url(#goldGrad)"/>
`);

// ----------------------------------------------------
// 6. FACTION CRESTS
// ----------------------------------------------------
// Order of the Last Light (Humans)
ASSETS['crest_humans.svg'] = svg(128, 128, `
  <!-- Sunburst Radiance -->
  <g fill="url(#goldGrad)" opacity="0.6">
    <polygon points="64,8 67,36 64,32 61,36"/>
    <polygon points="64,120 67,92 64,96 61,92"/>
    <polygon points="8,64 36,67 32,64 36,61"/>
    <polygon points="120,64 92,67 96,64 92,61"/>
    <polygon points="24,24 45,43 41,41 43,45"/>
    <polygon points="104,104 83,85 87,87 85,83"/>
    <polygon points="104,24 85,45 87,41 83,43"/>
    <polygon points="24,104 45,83 41,87 43,85"/>
  </g>
  <!-- Shield Backing -->
  <path d="M34 26 L94 26 L94 68 C94 92 64 108 64 108 C64 108 34 92 34 68 Z" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
  <!-- Crusader Sword -->
  <rect x="62" y="16" width="4" height="84" rx="1" fill="#ffffff" stroke="#717a8c" stroke-width="1"/>
  <polygon points="64,12 61,18 67,18" fill="#fff"/>
  <rect x="50" y="86" width="28" height="4" rx="1" fill="url(#goldGrad)"/>
  <rect x="62" y="90" width="4" height="12" fill="#523514"/>
  <circle cx="64" cy="106" r="4" fill="url(#goldGrad)"/>
  <!-- Inner Holy Sunburst -->
  <circle cx="64" cy="54" r="14" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <circle cx="64" cy="54" r="8" fill="#ffffff"/>
`);

// Ancient Colony (Spiders)
ASSETS['crest_spiders.svg'] = svg(128, 128, `
  <!-- Octagonal Web Frame -->
  <polygon points="64,10 102,26 118,64 102,102 64,118 26,102 10,64 26,26" fill="#141118" stroke="url(#goldGrad)" stroke-width="2.5"/>
  <!-- Web Radiating Spokes -->
  <g stroke="url(#silkGrad)" stroke-width="1.5" opacity="0.8">
    <line x1="64" y1="10" x2="64" y2="118"/>
    <line x1="10" y1="64" x2="118" y2="64"/>
    <line x1="26" y1="26" x2="102" y2="102"/>
    <line x1="102" y1="26" x2="26" y2="102"/>
  </g>
  <!-- Spiral Rings -->
  <polygon points="64,30 88,40 98,64 88,88 64,98 40,88 30,64 40,40" fill="none" stroke="url(#silkGrad)" stroke-width="1" opacity="0.6"/>
  <polygon points="64,46 76,51 82,64 76,77 64,82 52,77 46,64 52,51" fill="none" stroke="url(#silkGrad)" stroke-width="1" opacity="0.7"/>
  <!-- Central Chitinous Spider Icon -->
  <ellipse cx="64" cy="70" rx="14" ry="16" fill="#201a24" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <circle cx="64" cy="50" r="9" fill="#201a24" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <!-- Glowing Amber Eye -->
  <ellipse cx="64" cy="50" rx="4" ry="4" fill="url(#amberGrad)" filter="url(#glowGold)"/>
  <!-- Spidery legs grasping edge -->
  <path d="M56 46 Q34 32 30 18 M72 46 Q94 32 98 18 M54 52 Q26 50 18 42 M74 52 Q102 50 110 42" stroke="#4a3b54" stroke-width="2.5" fill="none"/>
  <path d="M54 62 Q28 72 24 88 M74 62 Q100 72 104 88" stroke="#4a3b54" stroke-width="2.5" fill="none"/>
`);

// ----------------------------------------------------
// 7. FRAMES & UI DECORATIONS
// ----------------------------------------------------

// Bottom Console Frame (Seamless decorative border motif)
ASSETS['frame_bottom_panel.svg'] = svg(800, 180, `
  <!-- Dark Slate Background with Carved Bevel -->
  <rect x="0" y="0" width="800" height="180" fill="url(#stoneGrad)"/>
  <!-- Top Gold Rail -->
  <rect x="0" y="0" width="800" height="4" fill="url(#goldGrad)"/>
  <rect x="0" y="4" width="800" height="2" fill="#000000" opacity="0.6"/>
  <!-- Ornate corner brackets left & right -->
  <path d="M0 0 L40 0 L0 40 Z" fill="url(#bronzeGrad)"/>
  <path d="M800 0 L760 0 L800 40 Z" fill="url(#bronzeGrad)"/>
  <!-- Gothic rivets along top bar -->
  ${[40, 120, 200, 280, 360, 440, 520, 600, 680, 760].map(x => `<circle cx="${x}" cy="8" r="2.5" fill="url(#goldGrad)" stroke="#382207" stroke-width="0.75"/>`).join('')}
  <!-- Subtle web filigree in corners -->
  <path d="M0 60 Q30 30 60 0 M0 90 Q45 45 90 0 M0 120 Q60 60 120 0" stroke="url(#silkGrad)" stroke-width="0.75" fill="none" opacity="0.15"/>
  <path d="M800 60 Q770 30 740 0 M800 90 Q755 45 710 0 M800 120 Q740 60 680 0" stroke="url(#silkGrad)" stroke-width="0.75" fill="none" opacity="0.15"/>
`);

// Minimap Frame
ASSETS['frame_minimap.svg'] = svg(224, 172, `
  <!-- Outer stone border -->
  <rect x="2" y="2" width="220" height="168" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2.5"/>
  <!-- Inner map cutout area -->
  <rect x="8" y="8" width="208" height="156" fill="#000" stroke="#3d2d1c" stroke-width="1.5"/>
  <!-- Corner Gothic L-brackets -->
  <path d="M4 4 L24 4 L24 10 L10 10 L10 24 L4 24 Z" fill="url(#goldGrad)"/>
  <path d="M220 4 L200 4 L200 10 L214 10 L214 24 L220 24 Z" fill="url(#goldGrad)"/>
  <path d="M4 168 L24 168 L24 162 L10 162 L10 148 L4 148 Z" fill="url(#goldGrad)"/>
  <path d="M220 168 L200 168 L200 162 L214 162 L214 148 L220 148 Z" fill="url(#goldGrad)"/>
  <!-- Top Center Crest / Compass Marker -->
  <polygon points="112,2 118,10 112,8 106,10" fill="url(#goldGrad)"/>
`);

// Portrait Arch Frame
ASSETS['frame_portrait.svg'] = svg(112, 112, `
  <rect x="2" y="2" width="108" height="108" rx="4" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
  <rect x="7" y="7" width="98" height="98" fill="#0c0a08" stroke="#3b2b1b" stroke-width="1.5"/>
  <!-- Gothic pointed arch top inside portrait -->
  <path d="M8 32 C8 12 32 8 56 8 C80 8 104 12 104 32" stroke="url(#goldGrad)" stroke-width="1.5" fill="none"/>
  <!-- Riveted corner bosses -->
  <circle cx="6" cy="6" r="2.5" fill="url(#goldGrad)"/>
  <circle cx="106" cy="6" r="2.5" fill="url(#goldGrad)"/>
  <circle cx="6" cy="106" r="2.5" fill="url(#goldGrad)"/>
  <circle cx="106" cy="106" r="2.5" fill="url(#goldGrad)"/>
`);

// Healthbar Background
ASSETS['ui_healthbar.svg'] = svg(200, 20, `
  <!-- Metallic Bar Bezel -->
  <rect x="1" y="1" width="198" height="18" rx="3" fill="#14110d" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <!-- Segment tick marks -->
  ${[40, 80, 120, 160].map(x => `<line x1="${x}" y1="2" x2="${x}" y2="18" stroke="#382816" stroke-width="1"/>`).join('')}
`);

// Save all generated SVGs to output directory
export function generateAssets(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const manifest = [];

  for (const [filename, content] of Object.entries(ASSETS)) {
    const fullPath = path.join(targetDir, filename);
    fs.writeFileSync(fullPath, content.trim(), 'utf8');
    manifest.push({
      file: filename,
      category: filename.startsWith('res_') ? 'Resource'
        : filename.startsWith('cmd_') ? 'Command'
        : filename.startsWith('bld_') ? 'Building'
        : filename.startsWith('unit_') ? 'Unit'
        : filename.startsWith('stat_') ? 'Statistic'
        : filename.startsWith('crest_') ? 'Faction Crest'
        : 'UI Frame',
      format: 'SVG'
    });
  }

  // Write MANIFEST.json
  fs.writeFileSync(path.join(targetDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Successfully generated ${Object.keys(ASSETS).length} vector UI assets into ${targetDir}`);
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const defaultDir = path.resolve('D:/JAM/SILKFRONT/GAME/assets/ui');
  generateAssets(defaultDir);
}
