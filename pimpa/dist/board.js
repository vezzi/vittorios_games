/* Print coordinates shared by the board, picking, pawns and camera. */
(() => {
  const width = 1000, height = 1400;
  const left = 28, top = 77, cellWidth = 188.8, cellHeight = 185;
  const tiles = [];
  PimpaGame.layout.forEach((row, r) => row.forEach((n, c) => {
    if (n !== null) tiles[n] = { x: left + c * cellWidth, y: top + r * cellHeight };
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
    const c = Math.floor((u * width - left) / cellWidth);
    const r = Math.floor((v * height - top) / cellHeight);
    return PimpaGame.layout[r]?.[c] ?? null;
  }
  globalThis.PimpaBoard = { width, height, left, top, cellWidth, cellHeight, tiles, art, image, center, cellAt };
})();
