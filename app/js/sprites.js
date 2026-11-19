// Leonida Pixel Dusk — Procedural Pixel Art, Bitmap Font & Crisp SVG Sprites
// Zero external images, zero webfonts, zero emoji.

const GLYPHS_5X7 = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
};

const MEDAL_SHADES = {
  platinum: { mid: '#9fd8f2', hi: '#ffffff', lit: '#cfeef7', dark: '#4d94b8', star: '#175d7a' },
  gold: { mid: '#f5bc1f', hi: '#ffefa3', lit: '#ffd94d', dark: '#a87408', star: '#6e4a04' },
  silver: { mid: '#c9d4e4', hi: '#ffffff', lit: '#e6ecf5', dark: '#77879c', star: '#46586e' },
  bronze: { mid: '#dd9046', hi: '#ffd2a0', lit: '#f0aa5e', dark: '#8a4f1d', star: '#5e3410' },
  dim: { mid: '#62667c', hi: '#9aa0b4', lit: '#7d8299', dark: '#3c3f52', star: '#23242f' },
};

const STAR_POLY = Array.from({ length: 10 }, (_, idx) => {
  const theta = -Math.PI / 2 + (idx * Math.PI) / 5;
  const radius = idx % 2 === 0 ? 6.6 : 2.8;
  return [11.5 + radius * Math.cos(theta), 11.5 + radius * Math.sin(theta)];
});

function pointInStar(px, py) {
  let inside = false;
  for (let i = 0, j = STAR_POLY.length - 1; i < STAR_POLY.length; j = i++) {
    const [xi, yi] = STAR_POLY[i];
    const [xj, yj] = STAR_POLY[j];
    const crosses = (yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

const medalSvgCache = new Map();
const iconSvgCache = new Map();

export function getMedalSvg(grade, dimmed = false, size = 40) {
  const key = `${grade}|${dimmed ? 1 : 0}`;
  let rects = medalSvgCache.get(key);
  if (!rects) {
    const pal = dimmed ? MEDAL_SHADES.dim : (MEDAL_SHADES[grade] || MEDAL_SHADES.bronze);
    const out = [];
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        const cx = x + 0.5;
        const cy = y + 0.5;
        const dist = Math.hypot(cx - 12, cy - 12);
        if (dist > 11.4) continue;

        let fill = pal.mid;
        if (pointInStar(cx, cy)) fill = pal.star;
        else if ((x === 6 && y === 5) || (x === 6 && y === 6) || (x === 7 && y === 6)) fill = '#ffffff';
        else if (dist > 10.1) fill = pal.dark;
        else if (dist > 8.9) fill = pal.lit;
        else if (dist > 8.1) fill = pal.dark;
        else if (y < 8 && x < 10) fill = pal.hi;
        else if (y > 16) fill = pal.dark;

        out.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
      }
    }
    rects = out.join('');
    medalSvgCache.set(key, rects);
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

function buildShieldSvgRects() {
  const starMask = [
    '......XX......',
    '......XX......',
    '......XX......',
    '.XXXXXXXXXXXX.',
    'XXXXXXXXXXXXXX',
    '.XXXXXXXXXXXX.',
    '..XXXXXXXXXX..',
    '...XXXXXXXX...',
    '....XX..XX....',
    '...XXX..XXX...',
    '...XX....XX...',
    '..XX......XX..',
  ];
  const inside = (x, y) => {
    if (y < 0 || y >= 21 || x < 0 || x >= 20) return false;
    const half = y <= 10 ? 9 : 9 - (y - 10);
    return half > 0 && Math.abs(x + 0.5 - 9.5) <= half - 0.5;
  };
  const rects = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 20; x++) {
      if (!inside(x, y)) continue;
      const border = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
      let fill = '#7a4fd0';
      if (border) fill = '#241547';
      else if (starMask[y - 2] && starMask[y - 2][x - 3] === 'X') fill = y >= 10 ? '#e0a916' : '#ffd23c';
      else if ((x === 3 && y === 2) || (x === 4 && y === 2) || (x === 3 && y === 3)) fill = '#e9dcff';
      else if (x <= 3) fill = '#a678f0';
      else if (x >= 15 || y >= 15) fill = '#4a2a8f';
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
    }
  }
  return { vb: '0 0 20 21', body: rects.join('') };
}

function buildWarningSvgRects() {
  const grid = [
    '........O........',
    '.......OHO.......',
    '.......OYO.......',
    '......OHYYO......',
    '......OYYYO......',
    '.....OYYBYYO.....',
    '.....OYYBYYO.....',
    '....OYYYBYYYO....',
    '....OYYYBYYYO....',
    '...OYYYYBYYYYO...',
    '...OYYYYYYYYYO...',
    '..OYYYYYBYYYYYO..',
    '..OYYYYYBYYYYYO..',
    '.ODDDDDDDDDDDDDO.',
    'OOOOOOOOOOOOOOOOO',
  ];
  const palette = { O: '#241306', H: '#fff2a6', Y: '#ffd23c', D: '#c98810', B: '#2a1604' };
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (palette[ch]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[ch]}"/>`);
    }
  });
  return { vb: '0 0 17 15', body: rects.join('') };
}

function buildCheckSvgRects() {
  const grid = [
    '............',
    '.........XX.',
    '........XXX.',
    '.......XXX..',
    '.XX...XXX...',
    '.XXX.XXX....',
    '..XXXXX.....',
    '...XXX......',
    '....X.......',
    '............',
  ];
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'X') rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="#2d1c03"/>`);
    }
  });
  return { vb: '0 0 12 10', body: rects.join('') };
}

function buildStarSvgRects(fillColor, shadeColor) {
  const grid = [
    '.....X.....',
    '.....X.....',
    '....XXX....',
    'XXXXXXXXXXX',
    '.XXXXXXXXX.',
    '..XXXXXXX..',
    '..XXXSXXX..',
    '.XXX...XXX.',
    '.XX.....XX.',
  ];
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === 'X' || ch === 'S') {
        const col = y >= 5 ? shadeColor : fillColor;
        rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`);
      }
    }
  });
  return { vb: '0 0 11 9', body: rects.join('') };
}

export function getIconSvg(name, size = 16) {
  let cached = iconSvgCache.get(name);
  if (!cached) {
    if (name === 'shield') cached = buildShieldSvgRects();
    else if (name === 'warning') cached = buildWarningSvgRects();
    else if (name === 'check') cached = buildCheckSvgRects();
    else if (name === 'star-gold') cached = buildStarSvgRects('#ffd23c', '#e09e14');
    else cached = buildStarSvgRects('#4a3b28', '#2c2115');
    iconSvgCache.set(name, cached);
  }
  return `<svg width="${size}" height="${size}" viewBox="${cached.vb}" shape-rendering="crispEdges" aria-hidden="true">${cached.body}</svg>`;
}

export function drawPixelText(canvas, text, opts = {}) {
  const {
    scale = 3,
    face = '#ffd9a0',
    shadow = '#0a0618',
    shadowX = 2,
    shadowY = 2,
    visibleChars = text.length,
    cursor = false,
  } = opts;
  const upper = text.toUpperCase();
  const advance = 6 * scale;
  const targetW = upper.length * advance - scale + shadowX + (cursor ? advance : 0);
  const targetH = 7 * scale + shadowY;
  if (canvas.width !== targetW) canvas.width = targetW;
  if (canvas.height !== targetH) canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const count = Math.max(0, Math.min(upper.length, visibleChars));
  const paintPass = (ox, oy, color) => {
    ctx.fillStyle = color;
    for (let ci = 0; ci < count; ci++) {
      const glyph = GLYPHS_5X7[upper[ci]];
      if (!glyph) continue;
      for (let ry = 0; ry < 7; ry++) {
        const row = glyph[ry];
        for (let rx = 0; rx < 5; rx++) {
          if (row[rx] === '1') {
            ctx.fillRect(ox + ci * advance + rx * scale, oy + ry * scale, scale, scale);
          }
        }
      }
    }
  };

  paintPass(shadowX, shadowY, shadow);
  paintPass(0, 0, face);

  if (cursor && count < upper.length) {
    ctx.fillStyle = '#ffd23c';
    ctx.fillRect(count * advance, 0, 4 * scale, 7 * scale);
  }
}

export function paintPanelHeadings(root = document) {
  root.querySelectorAll('canvas[data-pixel-heading]').forEach((cv) => {
    drawPixelText(cv, cv.dataset.pixelHeading || '', {
      scale: 3,
      face: '#ffd9a0',
      shadow: '#0a0618',
      shadowX: 2,
      shadowY: 2,
    });
  });
}

export function paintStaticSprites(root = document) {
  root.querySelectorAll('.medal-slot[data-medal]').forEach((el) => {
    const size = Number(el.dataset.size) || 24;
    const dim = el.dataset.dim === '1';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.innerHTML = getMedalSvg(el.dataset.medal, dim, size);
  });
  root.querySelectorAll('.icon-slot[data-icon]').forEach((el) => {
    const size = Number(el.dataset.size) || 14;
    el.innerHTML = getIconSvg(el.dataset.icon, size);
  });
}

// ---------- HERO PIXEL SUNSET SCENE (256x46) ----------
const HERO_SKY_BANDS = [
  '#1b0b38', '#2a0f4c', '#3d1460', '#5c1d5e', '#84305c',
  '#a02c50', '#c43a3a', '#e0522f', '#f07f2e', '#f59b3c',
];

const HERO_STARS = [
  [12, 3], [40, 6], [70, 2], [105, 5], [150, 3],
  [205, 6], [238, 2], [88, 8], [180, 7], [130, 4],
];

const HERO_CLOUDS = [
  [18, 9, 26, 3], [30, 12, 16, 2], [150, 7, 30, 3],
  [166, 10, 18, 2], [96, 12, 20, 2],
];

const HERO_BUILDINGS = [
  [116, 10, 8], [126, 14, 7], [135, 11, 6], [143, 16, 8],
  [202, 13, 8], [212, 17, 7], [221, 11, 7],
];

export function drawHeroScene(canvas, frame = 0, bandProgress = 10) {
  const ctx = canvas.getContext('2d');
  const W = 256;
  const H = 46;
  ctx.fillStyle = '#160b31';
  ctx.fillRect(0, 0, W, H);

  const bandH = Math.ceil(H / HERO_SKY_BANDS.length);
  const limit = Math.min(HERO_SKY_BANDS.length, bandProgress);
  for (let i = 0; i < limit; i++) {
    ctx.fillStyle = HERO_SKY_BANDS[i];
    ctx.fillRect(0, i * bandH, W, bandH);
  }

  // Twinkling stars
  HERO_STARS.forEach(([sx, sy], idx) => {
    const phase = (frame + idx * 3) % 12;
    ctx.fillStyle = phase < 2 ? '#ffd23c' : (phase === 6 ? '#9a68b8' : '#ffe9f4');
    ctx.fillRect(sx, sy, 1, 1);
  });

  // Clouds drifting in 1px steps
  const drift = Math.floor(frame / 4) % W;
  ctx.fillStyle = '#24104a';
  HERO_CLOUDS.forEach(([cx, cy, cw, ch]) => {
    const x = (cx + drift) % W;
    ctx.fillRect(x, cy, cw, ch);
    if (x + cw > W) ctx.fillRect(x - W, cy, cw, ch);
  });
  ctx.fillStyle = '#3a1866';
  [[22, 8, 18, 1], [156, 6, 20, 1]].forEach(([cx, cy, cw, ch]) => {
    const x = (cx + drift) % W;
    ctx.fillRect(x, cy, cw, ch);
    if (x + cw > W) ctx.fillRect(x - W, cy, cw, ch);
  });

  // Chunky sun with retro horizontal cuts
  const sunX = 178;
  const sunY = 40;
  const sunR = 16;
  for (let dy = -sunR; dy <= sunR; dy++) {
    for (let dx = -sunR; dx <= sunR; dx++) {
      if (dx * dx + dy * dy > sunR * sunR) continue;
      const py = sunY + dy;
      if (py === 34 || py === 37 || py === 38 || py === 41 || py === 42 || py === 43) continue;
      ctx.fillStyle = py < 30 ? '#ffd23c' : (py < 37 ? '#ffb03a' : '#ff8a3c');
      ctx.fillRect(sunX + dx, py, 1, 1);
    }
  }

  // Distant city skyline silhouette with flickering lit windows
  HERO_BUILDINGS.forEach(([bx, bh, bw], bIdx) => {
    ctx.fillStyle = '#1c0b34';
    ctx.fillRect(bx, 41 - bh, bw, bh);
    for (let wy = 41 - bh + 2; wy < 39; wy += 3) {
      for (let wx = bx + 2; wx < bx + bw - 1; wx += 2) {
        const lit = ((wx * 7 + wy * 13 + bIdx * 5) % 5) < 2;
        if (!lit) continue;
        const flicker = (frame + wx + wy) % 19 === 0;
        ctx.fillStyle = flicker ? '#ff8a3c' : '#ffd76a';
        ctx.fillRect(wx, wy, 1, 1);
      }
    }
  });

  // Sea + twinkling water sparkles
  ctx.fillStyle = '#170a30';
  ctx.fillRect(0, 41, W, 5);
  const sparkleShift = frame % 2 === 0 ? 0 : 1;
  ctx.fillStyle = '#ffb36b';
  [[168, 42], [176, 43], [186, 42], [172, 44], [192, 44], [160, 43], [200, 42]].forEach(([wx, wy], i) => {
    ctx.fillRect(wx + (i % 2 === 0 ? sparkleShift : -sparkleShift), wy, 2, 1);
  });
  ctx.fillStyle = '#7a4a9e';
  [[30, 43], [60, 42], [110, 44], [230, 43]].forEach(([wx, wy]) => {
    ctx.fillRect(wx, wy, 2, 1);
  });

  // Swaying palms (2-frame pixel sway)
  const sway = Math.floor(frame / 6) % 2 === 0 ? 0 : 1;
  const drawPalm = (baseX, dir) => {
    ctx.fillStyle = '#12061f';
    const trunk = [[0, 0], [0, -3], [1, -6], [1, -9], [2, -12], [2, -15], [3, -18]];
    trunk.forEach(([ox, oy], idx) => {
      const tipShift = idx >= 4 ? sway * dir : 0;
      ctx.fillRect(baseX + dir * ox + tipShift, 45 + oy, 2, 3);
    });
    const tx = baseX + dir * 3 + sway * dir;
    const ty = 27;
    const fronds = [[-8, -3], [-6, -5], [-3, -6], [1, -6], [5, -5], [8, -3], [-9, 0], [9, 0]];
    fronds.forEach(([fx, fy]) => {
      const steps = Math.max(Math.abs(fx), Math.abs(fy));
      for (let s = 0; s <= steps; s++) {
        ctx.fillRect(tx + Math.round((fx * s) / steps), ty + Math.round((fy * s) / steps), 1, 1);
      }
      ctx.fillRect(tx + fx, ty + fy + 1, 1, 1);
    });
    ctx.fillRect(tx - 1, ty - 1, 3, 3);
  };
  drawPalm(16, 1);
  drawPalm(52, 1);
  drawPalm(238, -1);
}

// ---------- POSTCARD SCENE (320x88) ----------
const POSTCARD_SKY = [
  '#22104a', '#341058', '#4a1868', '#5c1d5e', '#84305c',
  '#a02c50', '#c43a3a', '#e0522f', '#f07f2e', '#f59b3c',
];

const POSTCARD_BUILDINGS = [
  [196, 26, 13], [211, 34, 11], [224, 22, 10], [236, 38, 12],
  [250, 28, 10], [262, 33, 11], [275, 24, 10], [287, 36, 12], [301, 27, 17],
];

export function drawPostcardScene(canvas, frame = 0) {
  const ctx = canvas.getContext('2d');
  POSTCARD_SKY.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, i * 6, 320, 6);
  });

  // Stars
  [[20, 4], [64, 8], [140, 5], [250, 9], [300, 4], [110, 11]].forEach(([sx, sy], i) => {
    ctx.fillStyle = (frame + i * 2) % 10 === 0 ? '#ffd23c' : '#ffe9f4';
    ctx.fillRect(sx, sy, 1, 1);
  });

  // Pixel birds (2-frame wing flap)
  const wing = Math.floor(frame / 5) % 2;
  ctx.fillStyle = '#2a0f3d';
  [[238, 16], [252, 12], [266, 17]].forEach(([bx, by]) => {
    ctx.fillRect(bx, by + wing, 3, 1);
    ctx.fillRect(bx + 4, by + wing, 3, 1);
    ctx.fillRect(bx + 3, by + 1, 1, 1);
  });

  // Sun
  const cx = 92;
  const cy = 58;
  const r = 25;
  for (let dy = -r; dy <= 0; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const py = cy + dy;
      if (py === 50 || py === 53 || py === 54 || py === 56 || py === 57) continue;
      ctx.fillStyle = py < 44 ? '#ffd23c' : (py < 52 ? '#ffb03a' : '#ff8a3c');
      ctx.fillRect(cx + dx, py, 1, 1);
    }
  }

  // City skyline
  let seed = 11;
  const nextRnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  POSTCARD_BUILDINGS.forEach(([bx, bh, bw]) => {
    ctx.fillStyle = '#1d0b33';
    ctx.fillRect(bx, 58 - bh, bw, bh);
    for (let wy = 58 - bh + 3; wy < 54; wy += 4) {
      for (let wx = bx + 2; wx < bx + bw - 2; wx += 3) {
        if (nextRnd() > 0.55) {
          ctx.fillStyle = (frame + wx + wy) % 23 === 0 ? '#ff8a3c' : '#ffd76a';
          ctx.fillRect(wx, wy, 1, 2);
        }
      }
    }
  });

  // Sea + shimmer + sand beach
  ctx.fillStyle = '#5c1d4e';
  ctx.fillRect(0, 58, 320, 22);
  ctx.fillStyle = '#84305c';
  ctx.fillRect(0, 58, 320, 3);
  const shift = frame % 2 === 0 ? 0 : 2;
  ctx.fillStyle = '#ffd9a0';
  [[70, 63, 16], [80, 67, 22], [66, 71, 12], [88, 75, 18], [76, 79, 10]].forEach(([sx, sy, sw], idx) => {
    ctx.fillRect(sx + (idx % 2 === 0 ? shift : -shift), sy, sw, 1);
  });
  ctx.fillStyle = '#ffb36b';
  [[96, 65, 10], [72, 73, 14], [100, 77, 8]].forEach(([sx, sy, sw]) => {
    ctx.fillRect(sx, sy, sw, 1);
  });
  ctx.fillStyle = '#e8a35c';
  ctx.fillRect(0, 80, 320, 8);
  ctx.fillStyle = '#c47b3a';
  [[24, 83], [58, 85], [150, 82], [210, 84], [286, 83], [120, 86]].forEach(([px, py]) => {
    ctx.fillRect(px, py, 3, 1);
  });

  // Framing palms
  const drawPostcardPalm = (bx, base, top, flip) => {
    ctx.fillStyle = '#170826';
    const height = base - top;
    for (let i = 0; i <= height; i += 2) {
      ctx.fillRect(bx + Math.round((flip * i * i) / (height * 3.2)), base - i, 3, 2);
    }
    const tx = bx + Math.round((flip * height) / 3.2);
    const ty = top;
    [[-11, -4], [-8, -7], [-4, -8], [2, -8], [7, -7], [11, -4], [-12, 0], [12, 0]].forEach(([fx, fy]) => {
      const steps = Math.max(Math.abs(fx), Math.abs(fy));
      for (let s = 0; s <= steps; s++) {
        ctx.fillRect(tx + Math.round((fx * s) / steps), ty + Math.round((fy * s) / steps), 2, 2);
      }
      ctx.fillRect(tx + fx, ty + fy + 2, 2, 2);
    });
    ctx.fillRect(tx - 1, ty - 2, 4, 4);
  };
  drawPostcardPalm(20, 87, 38, 1);
  drawPostcardPalm(306, 87, 46, -1);
}

// ---------- 6 STAGE POSTCARD THUMBNAILS (88x50) ----------
const STAGE_PALETTES = {
  stg1: ['#341058', '#5c1d5e', '#a02c50', '#e0522f', '#f59b3c'],
  stg2: ['#1b0b38', '#341058', '#84305c', '#e0522f', '#ffb03a'],
  stg3: ['#191c34', '#263829', '#325433', '#527c3d', '#9db858'],
  stg4: ['#22104a', '#4a1868', '#c43a3a', '#f07f2e', '#ffd23c'],
  stg5: ['#070a1c', '#101638', '#1a2354', '#273473', '#3a4b96'],
  stg6: ['#2a1608', '#4a2408', '#8a4f1d', '#e0a916', '#ffd94d'],
};

export function drawStageThumb(canvas, sceneKey, frame = 0) {
  const ctx = canvas.getContext('2d');
  const pal = STAGE_PALETTES[sceneKey] || STAGE_PALETTES.stg1;
  pal.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, i * 8, 88, 8);
  });
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(0, 40, 88, 10);

  const twinkle = frame % 2 === 0;
  if (sceneKey === 'stg5') {
    // Midnight heist moon + stars
    [[8, 4], [30, 7], [55, 3], [76, 6], [44, 9]].forEach(([sx, sy], idx) => {
      ctx.fillStyle = (frame + idx) % 4 === 0 ? '#ffd23c' : '#ffe9f4';
      ctx.fillRect(sx, sy, 1, 1);
    });
    ctx.fillStyle = '#f5efe2';
    ctx.fillRect(64, 6, 8, 8);
    ctx.fillRect(63, 7, 10, 6);
    ctx.fillStyle = '#101638';
    ctx.fillRect(69, 5, 6, 6);
  } else {
    // Chunky sunset sun
    ctx.fillStyle = '#ffd23c';
    for (let dy = -9; dy <= 0; dy++) {
      for (let dx = -9; dx <= 9; dx++) {
        if (dx * dx + dy * dy <= 81 && dy !== -2 && dy !== -3) {
          ctx.fillRect(56 + dx, 40 + dy, 1, 1);
        }
      }
    }
  }

  ctx.fillStyle = '#100824';
  if (sceneKey === 'stg1' || sceneKey === 'stg6') {
    // Beach arched palms + water sparkle
    [10, 74].forEach((bx, idx) => {
      const dir = idx ? -1 : 1;
      for (let k = 0; k < 6; k++) ctx.fillRect(bx + dir * k, 40 - k * 3, 2, 3);
      const tx = bx + dir * 6;
      const ty = 22;
      [[-8, 0], [-6, -2], [-3, -3], [1, -3], [4, -2], [7, 0]].forEach(([ox, oy]) => {
        ctx.fillRect(tx + ox, ty + oy, 2, 2);
      });
      ctx.fillRect(tx - 1, ty - 2, 3, 3);
    });
    ctx.fillStyle = '#ffd23c';
    ctx.fillRect(twinkle ? 50 : 53, 44, 6, 1);
    ctx.fillRect(twinkle ? 58 : 55, 46, 4, 1);
  } else if (sceneKey === 'stg2') {
    // Vice skyline + glowing windows
    for (let i = 0; i < 6; i++) {
      const bx = 6 + i * 14;
      const bh = 10 + ((i * 7) % 16);
      ctx.fillStyle = '#100824';
      ctx.fillRect(bx, 40 - bh, 9, bh);
      ctx.fillStyle = (frame + i) % 3 === 0 ? '#ff8a3c' : '#ffd76a';
      ctx.fillRect(bx + 2, 40 - bh + 3, 2, 2);
      ctx.fillRect(bx + 5, 40 - bh + 7, 2, 2);
    }
  } else if (sceneKey === 'stg3') {
    // Grassrivers swamp cypress silhouettes + firefly pixel
    [14, 40, 66].forEach((tx) => {
      ctx.fillRect(tx, 18, 3, 22);
      ctx.fillRect(tx - 7, 14, 17, 5);
      ctx.fillRect(tx - 4, 10, 11, 5);
    });
    ctx.fillStyle = '#ffd23c';
    ctx.fillRect(twinkle ? 26 : 27, twinkle ? 31 : 30, 1, 1);
    ctx.fillRect(twinkle ? 55 : 54, twinkle ? 27 : 28, 1, 1);
  } else if (sceneKey === 'stg4') {
    // Highway road stripes scrolling in 2px steps + highway sign
    const dashShift = (frame * 2) % 20;
    ctx.fillStyle = '#0a0618';
    ctx.fillRect(0, 42, 88, 8);
    ctx.fillStyle = '#ffd23c';
    for (let dx = -20 + dashShift; dx < 88; dx += 20) {
      ctx.fillRect(dx, 45, 9, 2);
    }
    ctx.fillStyle = '#100824';
    ctx.fillRect(70, 22, 3, 18);
    ctx.fillRect(64, 20, 14, 6);
  } else if (sceneKey === 'stg5') {
    // Heist vaults skyline
    [8, 30, 58].forEach((bx) => ctx.fillRect(bx, 26, 12, 14));
    ctx.fillStyle = twinkle ? '#ffd76a' : '#ffb36b';
    [12, 34, 62].forEach((wx) => ctx.fillRect(wx, 30, 2, 3));
  }
}

export function spawnSparkleBurst(x, y, count = 8) {
  const layer = document.getElementById('sparkleLayer');
  if (!layer) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const palette = ['#ffd23c', '#ff8a3c', '#ff5e7a', '#fff8ee'];
  for (let i = 0; i < count; i++) {
    const node = document.createElement('span');
    node.className = 'px-sparkle';
    const angle = (Math.PI * 2 * i) / count;
    const dist = 18 + (i % 3) * 10;
    node.style.left = `${Math.round(x)}px`;
    node.style.top = `${Math.round(y)}px`;
    node.style.background = palette[i % palette.length];
    node.style.setProperty('--dx', `${Math.round(Math.cos(angle) * dist)}px`);
    node.style.setProperty('--dy', `${Math.round(Math.sin(angle) * dist)}px`);
    layer.appendChild(node);
    window.setTimeout(() => node.remove(), 400);
  }
}
