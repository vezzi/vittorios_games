/* The rules and commands are independent of the browser and its input devices. */
(() => {
  "use strict";
  const characters = {
    pimpa: { name: "Pimpa", color: "#e74b3d", light: "#fbe5df" },
    tito: { name: "Tito", color: "#268bc8", light: "#dceff7" },
    colombina: { name: "Colombina", color: "#e8893f", light: "#ffecd7" },
    olivia: { name: "Olivia", color: "#d6a820", light: "#fbf0c9" },
  };
  const cells = [
    ["Partenza", "#ebac37"],
    ["", "#efb54d"],
    [
      "Il vampiro",
      "#adbf6f",
      "Incontri un vampiro! Nasconditi per un turno.",
      "skip",
    ],
    ["", "#e79b9d"],
    [
      "Il corvo Nicola",
      "#d99192",
      "Il corvo Nicola ti fa tirare di nuovo il dado!",
      "again",
    ],
    ["Le caramelle", "#91a8d0"],
    ["", "#acbdd5"],
    [
      "Il pipistrello",
      "#7eb9bb",
      "Voli con il pipistrello nella caverna al n° 12.",
      12,
    ],
    ["", "#b8c68a"],
    [
      "La zucca",
      "#f2c95a",
      "Inciampi in una zucca e ti fermi un turno.",
      "skip",
    ],
    ["", "#b4bba1"],
    [
      "La ragnatela",
      "#adbe8c",
      "Rimani impigliato nella ragnatela. Salta un turno.",
      "skip",
    ],
    ["La caverna", "#daa399"],
    ["", "#92acca"],
    [
      "Il fantasma",
      "#efbd73",
      "Il fantasma ti invita nel suo castello. Vai al n° 22.",
      22,
    ],
    ["", "#e6a574"],
    [
      "L’orco",
      "#d9a879",
      "L’orco ti trascina nella sua caverna. Torna al n° 12.",
      12,
    ],
    ["", "#d5b599"],
    [
      "Il cappello della maga",
      "#e7a590",
      "La maga ti fa tirare di nuovo il dado!",
      "again",
    ],
    ["", "#d1bea0"],
    [
      "Il ragno Peppino",
      "#c6ba97",
      "Accompagni il ragno Peppino alla sua ragnatela. Torna al n° 11.",
      11,
    ],
    ["", "#edbf80"],
    ["Il castello", "#b8b5ac"],
    ["", "#efc64e"],
    ["", "#edb47b"],
    [
      "Il drago",
      "#e0bd6f",
      "Tira di nuovo il dado per scappare dal drago!",
      "again",
    ],
    ["", "#b6c878"],
    [
      "La zucca che ride",
      "#aebe8c",
      "Che fortuna! La zucca che ride ti fa volare fino all’arrivo!",
      31,
    ],
    ["", "#bd93a3"],
    [
      "La strega",
      "#9aabca",
      "La strega ti regala dei dolcetti, ma devi tornare al n° 5.",
      5,
    ],
    [
      "Il pirata",
      "#89b9b8",
      "Il pirata ti imprigiona sul suo vascello. Ti fermi un turno.",
      "skip",
    ],
    ["Arrivo", "#7d9dbf", "Hai raggiunto la maga. Hai vinto!"],
  ].map(([name, color, text, effect], n) => ({
    n,
    name: name || `Casella ${n}`,
    color,
    text: text || "",
    effect,
  }));
  const layout = [
    [0, 1, 2, 3, 4],
    [19, 20, 21, 22, 5],
    [18, 31, null, 23, 6],
    [17, 30, null, 24, 7],
    [16, 29, null, 25, 8],
    [15, 28, 27, 26, 9],
    [14, 13, 12, 11, 10],
  ];
  const finish = 31;
  const standardPlayer = (id) => ({
    id,
    name: characters[id].name,
    position: 0,
    skip: false,
  });
  function newGame(roster = ["pimpa", "tito"].map(standardPlayer)) {
    return {
      players: roster.map(({ id, name }) => ({
        ...standardPlayer(id),
        name: name.trim() || characters[id].name,
      })),
      active: 0,
      die: null,
      phase: "roll",
      notice: "",
      turns: 0,
    };
  }
  function valid(game) {
    if (
      !game ||
      !Array.isArray(game.players) ||
      game.players.length < 1 ||
      game.players.length > 4
    )
      return false;
    const ids = new Set(game.players.map((p) => p?.id));
    if (
      ids.size !== game.players.length ||
      !game.players.every(
        (p) =>
          p &&
          Object.hasOwn(characters, p.id) &&
          typeof p.name === "string" &&
          p.name.trim() &&
          Number.isInteger(p.position) &&
          p.position >= 0 &&
          p.position <= finish &&
          typeof p.skip === "boolean",
      )
    )
      return false;
    if (
      !Number.isInteger(game.active) ||
      !game.players[game.active] ||
      !Number.isInteger(game.turns) ||
      game.turns < 0 ||
      typeof game.notice !== "string" ||
      !["roll", "move", "won"].includes(game.phase)
    )
      return false;
    if (
      game.die !== null &&
      (!Number.isInteger(game.die) || game.die < 1 || game.die > 6)
    )
      return false;
    return (
      (game.phase !== "move" || game.die !== null) &&
      (game.phase === "won"
        ? game.players[game.active].position === finish
        : game.players.every((p) => p.position < finish))
    );
  }
  function roll(game, value) {
    if (
      game.phase !== "roll" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 6
    )
      return false;
    game.die = value;
    game.phase = "move";
    return true;
  }
  function move(game) {
    if (game.phase !== "move") return null;
    const player = game.players[game.active];
    const start = player.position;
    const landed = Math.min(finish, start + game.die);
    const path = Array.from(
      { length: landed - start },
      (_, i) => start + i + 1,
    );
    const cell = cells[landed];
    const target = typeof cell.effect === "number" ? cell.effect : landed;
    const effect = cells[target].effect;
    player.position = target;
    game.turns++;
    const messages = [
      `${player.name} raggiunge ${landed === finish ? "l’arrivo" : "la casella " + landed}.`,
    ];
    if (cell.effect) messages.push(cell.text);
    if (target !== landed && effect) messages.push(cells[target].text);
    if (target === finish) {
      game.phase = "won";
    } else {
      game.phase = "roll";
      if (effect === "skip") player.skip = true;
      if (effect !== "again") {
        game.active = (game.active + 1) % game.players.length;
        while (game.players[game.active].skip) {
          const resting = game.players[game.active];
          resting.skip = false;
          messages.push(`${resting.name} salta questo turno.`);
          game.active = (game.active + 1) % game.players.length;
        }
      }
    }
    game.notice = messages.join(" ");
    return { path, landed, target };
  }
  function editPlayers(game, roster) {
    if (game.phase === "won") return newGame(roster);
    const previous = game.players[game.active].id;
    const next = roster.map(({ id, name }) => ({
      ...(game.players.find((p) => p.id === id) || standardPlayer(id)),
      name: name.trim() || characters[id].name,
    }));
    const index = next.findIndex((p) => p.id === previous);
    game.players = next;
    game.active = Math.max(index, 0);
    if (index === -1) {
      game.phase = "roll";
      game.die = null;
      while (next[game.active].skip) {
        next[game.active].skip = false;
        game.active = (game.active + 1) % next.length;
      }
    }
    return game;
  }
  globalThis.PimpaGame = {
    characters,
    cells,
    layout,
    finish,
    newGame,
    valid,
    roll,
    move,
    editPlayers,
  };
})();
