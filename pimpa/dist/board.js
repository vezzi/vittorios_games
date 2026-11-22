/* Print coordinates shared by the board, picking, pawns and camera. */
(() => {
  const width = 1000, height = 1400;
  const left = 28, top = 77, cellWidth = 188.8, cellHeight = 185;
  const tiles = [];

  // Squares share their entire entrance and exit. All other edges recede into
  // the white paper. Local coordinates run from 0 to 1 in each direction.
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // top, right, bottom, left
  const inset = 0.088;
  function footprint(row, col, n) {
    const open = directions.map(([dx, dy]) => {
      const neighbor = PimpaGame.layout[row + dy]?.[col + dx];
      return Number.isInteger(neighbor) && Math.abs(neighbor - n) === 1;
    });
    const [top, right, bottom, left] = open;
    const x0 = left ? 0 : inset, x1 = right ? 1 : 1 - inset;
    const y0 = top ? 0 : inset, y1 = bottom ? 1 : 1 - inset;
    const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const end = n === 0 || n === PimpaGame.finish;
    const points = [];

    for (let i = 0; i < 4; i++) {
      const previous = (i + 3) % 4;
      const [x, y] = corners[i];
      if (open[previous] !== open[i]) {
        points.push([x, y]); // straight seam into the next colour
        continue;
      }
      const insideBend = open[i];
      const radius = insideBend ? inset : end ? 0.24 : 0.42;
      const [dx, dy] = directions[i];
      const [px, py] = directions[previous];
      const ax = x - dx * radius, ay = y - dy * radius;
      const bx = x - px * radius, by = y - py * radius;
      const cx = insideBend ? ax + bx - x : x;
      const cy = insideBend ? ay + by - y : y;
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, s = 1 - t;
        points.push([s*s*ax + 2*s*t*cx + t*t*bx, s*s*ay + 2*s*t*cy + t*t*by]);
      }
    }
    return points;
  }
  PimpaGame.layout.forEach((row, r) => row.forEach((n, c) => {
    if (n !== null) tiles[n] = {
      x: left + c * cellWidth, y: top + r * cellHeight, outline: footprint(r, c, n),
    };
  }));
  const art = {
    2: "vampiro", 4: "corvo", 5: "caramella", 7: "pipistrello",
    9: "zucca", 11: "ragnatela", 12: "caverna", 14: "fantasma",
    16: "orco", 18: "maga", 20: "ragno", 22: "castello",
    25: "drago", 27: "zucca-felice", 29: "strega", 30: "pirata", 31: "maga",
  };
  const image = name => `assets/illustrations/${name}.webp`;
  function center(n) {
    return [(tiles[n].x + cellWidth / 2) / width, (tiles[n].y + cellHeight / 2) / height];
  }
  function cellAt(u, v) {
    const gx = (u * width - left) / cellWidth, gy = (v * height - top) / cellHeight;
    const c = Math.floor(gx), r = Math.floor(gy);
    const n = PimpaGame.layout[r]?.[c];
    if (n == null) return null;
    const x = gx - c, y = gy - r;
    const points = tiles[n].outline;
    let inside = false;
    // A ray to the right crosses the coloured outline an odd number of times.
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [ax, ay] = points[j], [bx, by] = points[i];
      if ((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)) inside = !inside;
    }
    return inside ? n : null;
  }
  globalThis.PimpaBoard = { width, height, left, top, cellWidth, cellHeight, tiles, art, image, center, cellAt };
})();
