(() => {
  "use strict";
  const {
    characters,
    cells,
    layout,
    finish,
    newGame,
    valid,
    roll,
    move,
    editPlayers,
  } = PimpaGame;
  const $ = (id) => document.getElementById(id);
  const icons = {
    perspective: '<path d="m3 8 9-5 9 5-9 5-9-5Zm0 0v8l9 5 9-5V8m-9 5v8"/>',
    plus: '<path d="M4 12h16M12 4v16"/>',
    minus: '<path d="M4 12h16"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',
    book: '<path d="M12 6C8 3.5 5 4 2.8 4.8v14c3.2-1.2 6-1 9.2 1 3.2-2 6-2.2 9.2-1v-14C19 4 16 3.5 12 6Zm0 0v13.5"/>',
    board:
      '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 10h18M10 3v18M15 15h2"/>',
    people:
      '<circle cx="9" cy="8" r="3.3"/><path d="M2.5 20v-2c0-3 2.8-5 6.5-5s6.5 2 6.5 5v2M16 5.2c3.6 0 4.8 4.5 1.1 6.2m.7 2.7c2.3.4 3.7 2 3.7 4.1v1.5"/>',
    die: '<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="currentColor" stroke="none"><circle cx="7.6" cy="7.6" r="1.55"/><circle cx="12" cy="12" r="1.55"/><circle cx="16.4" cy="16.4" r="1.55"/></g>',
    pencil:
      '<path d="m4 16-.8 4.8L8 20 20.2 7.8a2 2 0 0 0 0-2.8l-1.1-1.1a2 2 0 0 0-2.8 0L4 16Zm10.6-10.1 3.5 3.5"/>',
    expand:
      '<path d="M8.7 3.5H3.5v5.2m11.8-5.2h5.2v5.2M3.5 15.3v5.2h5.2m11.8-5.2v5.2h-5.2"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    restart: '<path d="M3 5.5v5.6h5.6M3.5 10.2a8.3 8.3 0 1 1 .8 6.2"/>',
    star: '<path d="m12 2.1 2.8 6.5 7.1.7-5.4 4.8 1.6 7-6.1-3.7-6.1 3.7 1.6-7-5.4-4.8 7.1-.7Z"/>',
    sparkle:
      '<path d="M12 2.2c.5 5.7 4.2 9.3 9.6 9.8-5.4.6-9 4.1-9.6 9.8-.7-5.7-4.3-9.2-9.6-9.8 5.3-.5 8.9-4.1 9.6-9.8Z"/>',
    flag: '<path d="M4.5 21V4.3c4.5-4 9.1 4.1 15.5-.2v10c-6.2 4-11.1-4.1-15.5.1"/>',
    finish:
      '<path d="M4 21V4m1 1c4-3 9 3.5 15-.6v8c-6 4-11-2-15 .7"/><path d="M7.5 4v4l4 1V5.7m0 3.3v4l4 1v-4.1m.1-4.1V10l4.3-1V4.6" fill="currentColor" stroke-width=".7"/>',
    again: '<path d="M3.5 5V11H9m-5-.9a8.2 8.2 0 1 1 .6 7.2"/>',
    skip: '<path d="M8 5v14m8-14v14" stroke-width="3"/>',
    forward: '<path d="m4 7 5 5-5 5m8-10 5 5-5 5"/>',
    back: '<path d="m12 7-5 5 5 5m8-10-5 5 5 5"/>',
    hand: '<path d="M8.8 12V5.2a1.6 1.6 0 0 1 3.2 0V11l1.5-.6c.8-.3 1.7.1 2.1.7.9-.5 2.1-.2 2.6.6 1.4-.3 2.6.7 2.6 2v2c0 3.6-2.3 6-5.7 6h-1.8c-1.9 0-3.6-.8-4.9-2.4l-4.3-5.6c-.9-1.3.6-2.8 1.9-2l2.8 2.2M5.5 4.7C6.3 2.9 7.5 2 9.1 1.6"/>',
    sound:
      '<path d="M3 9h4l5-4v14l-5-4H3zM16 8c2.4 2.2 2.4 5.8 0 8m3-11c4 3.8 4 10.2 0 14"/>',
    muted: '<path d="M3 9h4l5-4v14l-5-4H3zM16.5 9l5 6m0-6-5 6"/>',
    trail:
      '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h5a3 3 0 0 0 0-6h-1a3 3 0 0 1 0-6h5"/>',
    footprint:
      '<g fill="currentColor" stroke="none"><ellipse cx="8" cy="8" rx="3.1" ry="5" transform="rotate(-19 8 8)"/><ellipse cx="10" cy="16" rx="2.3" ry="2.8" transform="rotate(-19 10 16)"/><ellipse cx="16" cy="6" rx="2.5" ry="3.8" transform="rotate(12 16 6)"/><ellipse cx="15" cy="12.3" rx="1.8" ry="2.1"/></g>',
    win: '<path d="m3 7 4.5 3.5L12 3l4.5 7.5L21 7l-2 11H5L3 7Zm3 14h12"/>',
  };
  const icon = (key, cls = "") =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]}</svg>`;
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, el.className);
  });
  const el = (tag, cls, label) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (label !== undefined) node.textContent = label;
    return node;
  };
  const portrait = (id, className) => {
    const img = el("img", className);
    img.src = `assets/characters/${id}.png`;
    img.alt = "";
    img.draggable = false;
    return img;
  };
  const art = (cell) => PimpaBoard.image(PimpaBoard.art[cell.n]);
  const hasArt = (n) => Boolean(PimpaBoard.art[n]);
  const location = (n) =>
    n === 0 ? "Alla partenza" : n === finish ? "All’arrivo" : `Casella ${n}`;
  const effectIcon = (cell) =>
    typeof cell.effect === "number"
      ? cell.effect > cell.n
        ? "forward"
        : "back"
      : cell.effect;
  const modal = $("modal");
  const body = $("modal-body");
  let table;
  const saveKey = "pimpa.oca.v1";
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let game = newGame();
  let sound = false;

  let audio;
  let busy = false;

  try {
    const saved = JSON.parse(localStorage.getItem(saveKey));
    if (valid(saved)) game = saved;
    sound = localStorage.getItem("pimpa.suono") === "1";
  } catch {}
  function save() {
    try {
      localStorage.setItem(saveKey, JSON.stringify(game));
    } catch {}
  }
  function announce(message) {
    $("announcement").textContent = message;
  }
  function chirp(notes) {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume().catch(() => {});
      notes.forEach(([frequency, when, duration]) => {
        const tone = audio.createOscillator();
        const gain = audio.createGain();
        const start = audio.currentTime + when;
        tone.type = "sine";
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.1, start + 0.009);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        tone.connect(gain).connect(audio.destination);
        tone.start(start);
        tone.stop(start + duration + 0.015);
      });
    } catch {}
  }
  function renderSound() {
    $("sound-button").innerHTML = icon(sound ? "sound" : "muted");
    const label = sound ? "Disattiva i suoni" : "Attiva i suoni";
    $("sound-button").setAttribute("aria-label", label);
    $("sound-button").title = label;
    $("sound-button").setAttribute("aria-pressed", String(sound));
  }
  function render() {
    const current = game.players[game.active];
    $("current-name").textContent = current.name;
    $("hero-character").src = `assets/characters/${current.id}.png`;
    $("current-position").innerHTML = icon(
      game.phase === "won" ? "win" : "flag",
    );
    $("current-position").append(
      document.createTextNode(location(current.position)),
    );
    $("turn-label").textContent =
      game.phase === "won" ? "VITTORIA" : "DI TURNO";
    const rolled = game.phase === "move",
      won = game.phase === "won";
    $("dice-caption").textContent = won
      ? "Hai vinto!"
      : rolled
        ? `È uscito il ${game.die}!`
        : "Il dado è pronto!";
    $("dice-hint").textContent = won
      ? "La maga ti aspetta all’arrivo."
      : rolled
        ? "Ora muovi la tua pedina sul tabellone."
        : "Lancia per scoprire di quanti passi muoverti.";
    $("play-button").innerHTML = icon(
      won ? "win" : rolled ? "footprint" : "die",
    );
    $("play-button").append(
      el(
        "span",
        "",
        won
          ? "Festeggiamo!"
          : rolled
            ? `Muovi di ${game.die} ${game.die === 1 ? "passo" : "passi"}`
            : "Lancia il dado",
      ),
    );

    const roster = $("player-list");
    roster.replaceChildren();
    game.players.forEach((p, i) => {
      const li = el("li", "player-item" + (i === game.active ? " active" : ""));
      li.append(avatar(p.id));
      const names = el("div", "player-names");
      names.append(
        el("strong", "", p.name),
        el("small", "", p.skip ? "Fermo un turno" : location(p.position)),
      );
      li.append(names);
      if (i === game.active)
        li.append(el("span", "turn-chip", won ? "Ha vinto" : "Di turno"));
      roster.append(li);
    });
    $("last-move").hidden = !game.notice;
    $("last-text").textContent = game.notice;
    table?.setPieces(game.players, current.id);
    lockControls(busy);
  }
  function avatar(id) {
    const av = el("span", "avatar");
    av.style.setProperty("--light", characters[id].light);
    av.append(portrait(id, ""));
    return av;
  }
  function lockControls(locked) {
    [
      "play-button",
      "new-game",
      "edit-players",
      "find-pawn",
      "inspect-cells",
      "rules-button",
    ].forEach((id) => {
      $(id).disabled = locked;
    });
  }
  function modalHeading(title) {
    body.replaceChildren();
    const head = el("div", "dialog-top");
    const h = el("h2", "", title);
    h.id = "dialog-title";
    const close = el("button", "icon-button");
    close.type = "button";
    close.innerHTML = icon("close");
    close.setAttribute("aria-label", "Chiudi");
    close.onclick = () => modal.close();
    head.append(h, close);
    body.append(head);
    modal.setAttribute("aria-labelledby", h.id);
  }
  const openModal = () => {
    if (!modal.open) modal.showModal();
  };
  function modalButton(label, action, symbol) {
    const button = el("button", "primary");
    if (symbol) button.innerHTML = icon(symbol);
    button.append(document.createTextNode(label));
    button.type = "button";
    button.onclick = action;
    body.append(button);
    return button;
  }
  function showCell(n) {
    table?.highlight(n);
    const cell = cells[n];
    modalHeading(n === 0 || n === finish ? cell.name : `Casella ${n}`);
    const info = el("div", "tile-detail");
    if (hasArt(n)) {
      const img = el("img", "tile-detail-image");
      img.alt = "";
      img.src = art(cell);
      info.append(img);
    } else {
      const number = el("div", "detail-number");
      number.style.background = cell.color;
      if (n === 0) number.innerHTML = icon("flag");
      else number.textContent = n;
      info.append(number);
    }
    if (hasArt(n) && n !== finish) info.append(el("h3", "", cell.name));
    info.append(
      el(
        "p",
        "",
        cell.text ||
          (n === 0
            ? "Da qui comincia l’avventura di tutti i giocatori."
            : "Puoi riposarti qui fino al tuo prossimo turno."),
      ),
    );
    body.append(info);
    const browse = el("div", "browse-cells");
    const previous = el("button", "", "← Precedente");
    const next = el("button", "", "Successiva →");
    previous.disabled = n === 0;
    next.disabled = n === finish;
    function browseTo(number, index) {
      showCell(number);
      const arrows = body.querySelectorAll(".browse-cells button");
      (arrows[index].disabled ? arrows[1 - index] : arrows[index]).focus();
    }
    previous.onclick = () => browseTo(n - 1, 0);
    next.onclick = () => browseTo(n + 1, 1);
    browse.append(previous, next);
    body.append(browse);
    modalButton("Guarda sul tavolo", () => {
      table.setView("cell", n);
      modal.close();
    }, "search");
    openModal();
  }
  function showRules() {
    modalHeading("Come si gioca");
    const steps = el("ol", "rule-steps");
    [
      "Scegli da uno a quattro personaggi. Puoi dare a ogni giocatore il suo nome.",
      "Quando è il tuo turno, lancia il dado. Guarda i puntini e premi “Muovi” per avanzare di altrettante caselle.",
      "Sulle caselle speciali segui le istruzioni. Il gioco applica anche l’effetto della casella di destinazione e ricorda i turni da saltare.",
      "Vince chi raggiunge la maga dopo la casella 30. Se il dado dà più passi del necessario, ti fermi all’arrivo.",
    ].forEach((t) => steps.append(el("li", "", t)));
    body.append(steps);
    const details = el("details", "rules-details");
    details.append(el("summary", "", "Le caselle speciali"));
    const list = el("ul", "rule-list");
    cells
      .filter((c) => c.effect)
      .forEach((c) => {
        const li = el("li");
        const number = el("b", "rule-number", c.n);
        number.style.background = c.color;
        li.append(number, el("span", "", c.text));
        list.append(li);
      });
    details.append(list);
    body.append(details);
    modalButton("Ho capito", () => modal.close());
    openModal();
  }
  function setup(restart) {
    modalHeading(restart ? "Nuova partita" : "I giocatori");
    body.append(
      el(
        "p",
        "dialog-intro",
        "Scegli da 1 a 4 pedine. Per ciascuna puoi scrivere il nome di chi gioca.",
      ),
    );
    const form = el("div", "roster");
    body.append(form);
    const inputs = [];
    for (const [id, character] of Object.entries(characters)) {
      const player = game.players.find((p) => p.id === id);
      const row = el("div", "roster-row");
      const check = el("input");
      check.type = "checkbox";
      check.checked = Boolean(player);
      check.setAttribute("aria-label", `Gioca con ${character.name}`);
      const label = el("label", "roster-name");
      const input = el("input");
      input.type = "text";
      input.maxLength = 24;
      input.autocomplete = "off";
      input.value = player?.name || character.name;
      label.append(
        el("span", "", `Nome di chi gioca con ${character.name}`),
        input,
      );
      row.append(check, avatar(id), label);
      form.append(row);
      inputs.push({ id, check, input, row });
      check.addEventListener("change", sync);
    }
    if (restart && (game.turns || game.phase === "move"))
      body.append(
        el(
          "p",
          "setup-warning",
          "Con una nuova partita tutte le pedine ripartono dalla partenza.",
        ),
      );
    const button = modalButton(
      restart ? "Inizia la partita" : "Salva giocatori",
      () => {
        const roster = inputs
          .filter((x) => x.check.checked)
          .map((x) => ({
            id: x.id,
            name: x.input.value.trim() || characters[x.id].name,
          }));
        if (!roster.length) return;
        game = restart ? newGame(roster) : editPlayers(game, roster);
        save();
        render();
        modal.close();
        announce(`Tocca a ${game.players[game.active].name}.`);
      },
      restart ? "flag" : "people",
    );
    function sync() {
      for (const { check, input, row } of inputs) {
        input.disabled = !check.checked;
        row.classList.toggle("chosen", check.checked);
      }
      button.disabled = !inputs.some((x) => x.check.checked);
    }
    sync();
    openModal();
  }
  function showVictory() {
    const p = game.players[game.active];
    modalHeading("Festa all’arrivo");
    const win = el("div", "victory");
    win.append(el("div", "sunburst"), portrait(p.id, ""));
    const confetti = el("div", "confetti");
    confetti.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 24; i++) {
      const bit = el("b");
      bit.style.left = 3 + ((i * 29) % 94) + "%";
      bit.style.top = 3 + ((i * 19) % 85) + "%";
      bit.style.background = ["#ec655d", "#7eafa0", "#efba56", "#89a7cf"][
        i % 4
      ];
      bit.style.setProperty("--angle", i * 43 + "deg");
      bit.style.animationDelay = (i % 7) * -0.25 + "s";
      confetti.append(bit);
    }
    win.append(
      confetti,
      el("h2", "", "Congratulazioni, hai vinto!!!"),
      el(
        "p",
        "",
        `Che avventura, ${p.name}! La maga ti dà il benvenuto all’arrivo.`,
      ),
    );
    body.append(win);
    modalButton("Giochiamo ancora", () => setup(true), "die");
    openModal();
  }
  function dieRoll() {
    // Discard the four spare byte values to keep all six faces equally likely.
    if (!globalThis.crypto?.getRandomValues)
      return Math.floor(Math.random() * 6) + 1;
    const bytes = new Uint8Array(1);
    do {
      crypto.getRandomValues(bytes);
    } while (bytes[0] >= 252);
    return (bytes[0] % 6) + 1;
  }
  // Buttons and future input adapters (e.g. gestures) use the same two commands.
  async function command(action) {
    if (busy || modal.open || !table || document.hidden) return false;
    if (action !== game.phase || !["roll", "move"].includes(action))
      return false;
    busy = true;
    lockControls(true);
    try {
      if (action === "roll") {
        const value = dieRoll();
        roll(game, value);
        save();
        $("dice-caption").textContent = "Il dado rotola…";
        chirp([
          [370, 0, 0.07],
          [430, 0.09, 0.08],
          [520, 0.18, 0.09],
        ]);
        await table.toss(value);
        render();
        announce(`È uscito il ${value}. Ora muovi la pedina.`);
      } else {
        const player = game.players[game.active];
        const result = move(game);
        save();
        $("dice-caption").textContent = `${player.name} in cammino…`;
        $("dice-hint").textContent = "Conta le caselle insieme alla pedina.";
        for (const step of result.path) {
          $("current-position").innerHTML = icon("footprint");
          $("current-position").append(document.createTextNode(location(step)));
          chirp([[260 + step * 9, 0, 0.07]]);
          await table.hop(player.id, step, reduced() ? 0 : 300);
        }
        if (result.target !== result.landed) {
          $("dice-caption").textContent = cells[result.landed].name;
          $("dice-hint").textContent = cells[result.landed].text;
          announce(cells[result.landed].text);
          await pause(reduced() ? 0 : 900);
          await table.hop(player.id, result.target, reduced() ? 0 : 600);
          chirp([
            [390, 0, 0.1],
            [result.target > result.landed ? 580 : 260, 0.12, 0.15],
          ]);
          await pause(reduced() ? 0 : 360);
        }
        render();
        announce(
          game.notice +
            (game.phase === "won"
              ? ""
              : ` Tocca a ${game.players[game.active].name}.`),
        );
        if (game.phase === "won") {
          chirp([
            [523, 0, 0.14],
            [659, 0.14, 0.16],
            [784, 0.31, 0.19],
            [1046, 0.52, 0.32],
          ]);
          showVictory();
        }
      }
      return true;
    } finally {
      busy = false;
      lockControls(false);
    }
  }
  $("play-button").onclick = () =>
    game.phase === "won" ? showVictory() : command(game.phase);
  $("rules-button").onclick = showRules;
  $("new-game").onclick = () => setup(true);
  $("edit-players").onclick = () => setup(game.phase === "won");
  $("sound-button").onclick = () => {
    sound = !sound;
    try {
      localStorage.setItem("pimpa.suono", sound ? "1" : "0");
    } catch {}
    renderSound();
    if (sound)
      chirp([
        [440, 0, 0.1],
        [600, 0.13, 0.14],
      ]);
  };
  $("inspect-cells").onclick = () => {
    modalHeading("Esplora le caselle");
    body.append(
      el(
        "p",
        "dialog-intro",
        "Scegli un numero per leggere la sua casella. Puoi anche toccarla sul tavolo.",
      ),
    );
    const picker = el("div", "cell-picker");
    for (const c of cells) {
      const b = el("button", "", c.n === 0 || c.n === finish ? c.name : c.n);
      b.style.setProperty("--tile", c.color);
      b.onclick = () => showCell(c.n);
      picker.append(b);
    }
    body.append(picker);
    openModal();
  };
  modal.addEventListener("click", (e) => {
    if (e.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      modal.close();
  });
  const setView = (mode) => table?.setView(mode);
  $("find-pawn").onclick = () => table?.setView("cell", game.players[game.active].position);
  $("view-reset").onclick = () => setView("reset");
  $("view-top").onclick = () => setView("top");
  $("zoom-in").onclick = () => setView("in");
  $("zoom-out").onclick = () => setView("out");
  window.PimpaControls = Object.freeze({
    roll: () => command("roll"),
    move: () => command("move"),
  });
  renderSound();
  render();
  lockControls(true);
  const actions = {
    onCell: (n) => {
      if (!busy && !modal.open) showCell(n);
    },
    onDie: () => command("roll"),
    onPawn: () => {
      if (game.phase === "move") command("move");
      else if (!busy) showCell(game.players[game.active].position);
    },
    onEdit: () => {
      if (!busy) setup(game.phase === "won");
    },
    onView: (top) => $("view-top").setAttribute("aria-pressed", String(top)),
  };
  async function start() {
    try {
      table = await PimpaTable.create(actions);
    } catch (error) {
      console.warn(
        "La visuale WebGL richiede il tavolo 3D compatibile.",
        error,
      );
      table = await PimpaTableFallback.create(actions);
    }
    $("scene-loading").hidden = true;
    table.setDie(game.die || 4);
    render();
    if (game.phase === "won") showVictory();
  }
  start();
})();
