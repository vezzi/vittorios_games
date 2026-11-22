/* A perspective tabletop for browsers that cannot allocate a WebGL context. */
(() => {
  function create(actions) {
    const host = document.getElementById("scene"),
      frame = document.getElementById("scene-frame");
    const node = (tag, cls) => {
      const elem = document.createElement(tag);
      elem.className = cls;
      return elem;
    };
    const surface = node("div", "compat-surface"),
      board = node("div", "compat-board");
    const coordinates = new Map(),
      pieces = new Map();
    const ids = Object.keys(PimpaGame.characters);
    let roster = [],
      active,
      angle = 9,
      tilt = 33,
      zoom = 1;
    host.replaceChildren(surface);
    surface.append(board);
    PimpaBoard.tiles.forEach((tile, n) => {
        const btn = node("button", "compat-cell");
        const [u, v] = PimpaBoard.center(n);
        coordinates.set(n, [u * 500, v * 700]);
        Object.assign(btn.style, {
          left: tile.x / 2 + "px", top: tile.y / 2 + "px",
          width: PimpaBoard.cellWidth / 2 + "px", height: PimpaBoard.cellHeight / 2 + "px",
        });
        btn.setAttribute(
          "aria-label",
          n === 0 ? "Partenza" : n === 31 ? "Arrivo" : "Casella " + n,
        );
        btn.onclick = () => actions.onCell(n);
        board.append(btn);
    });
    for (const id of ids) {
      const spot = node("button", "compat-pawn"),
        img = node("img", "");
      img.src = `assets/characters/${id}.png`;
      img.alt = PimpaGame.characters[id].name;
      img.draggable = false;
      spot.append(img);
      spot.style.setProperty("--color", PimpaGame.characters[id].color);
      spot.onclick = () => {
        if (id === active) actions.onPawn();
        else if (roster.some((p) => p.id === id))
          actions.onCell(roster.find((p) => p.id === id).position);
        else actions.onEdit();
      };
      board.append(spot);
      pieces.set(id, spot);
    }
    function spotAt(id, n) {
      const pt = coordinates.get(n),
        group = roster.filter((p) => p.id === id || p.position === n);
      const i = group.findIndex((p) => p.id === id);
      return [
        pt[0] + (group.length > 1 ? (i % 2 ? 23 : -23) : 0),
        pt[1] + (group.length > 2 ? (i < 2 ? 18 : -18) : 0),
      ];
    }
    function position(spot, [x, y]) {
      spot.style.left = x + "px";
      spot.style.top = y + "px";
    }
    const cube = node("button", "compat-die");
    cube.setAttribute("aria-label", "Lancia il dado");
    cube.onclick = actions.onDie;
    const dots = [
      [4],
      [0, 8],
      [0, 4, 8],
      [0, 2, 6, 8],
      [0, 2, 4, 6, 8],
      [0, 2, 3, 5, 6, 8],
    ];
    const orient = [
      "rotateY(0deg)",
      "rotateY(90deg)",
      "rotateX(90deg)",
      "rotateX(-90deg)",
      "rotateY(-90deg)",
      "rotateY(180deg)",
    ];
    for (let f = 0; f < 6; f++) {
      const face = node("span", "compat-face");
      face.style.transform = orient[f] + " translateZ(31px)";
      for (const d of dots[f]) {
        const pip = node("b", "");
        pip.style.gridArea = Math.floor(d / 3) + 1 + " / " + ((d % 3) + 1);
        face.append(pip);
      }
      cube.append(face);
    }
    board.append(cube);
    function setDie(value) {
      cube.style.transform =
        "translateZ(34px) rotateZ(-15deg) " +
        [
          "rotateY(0deg)",
          "rotateY(-90deg)",
          "rotateX(-90deg)",
          "rotateX(90deg)",
          "rotateY(90deg)",
          "rotateY(180deg)",
        ][value - 1];
    }
    function view() {
      const rect = host.getBoundingClientRect(),
        f = frame.getBoundingClientRect();
      const scale =
        Math.min(
          f.width / 690,
          f.height / (740 * Math.cos((tilt * Math.PI) / 180) + 125),
        ) *
        0.94 *
        zoom;
      surface.style.left = f.left - rect.left + f.width * 0.49 + "px";
      surface.style.top = f.top - rect.top + f.height * 0.49 + "px";
      board.style.transform = `scale(${scale}) rotateX(${tilt}deg) rotateZ(${angle}deg)`;
    }
    function setView(mode) {
      if (mode === "reset") {
        angle = 9;
        tilt = 33;
        zoom = 1;
      }
      if (mode === "top") {
        tilt = tilt === 5 ? 33 : 5;
        angle = tilt === 5 ? 0 : 9;
      }
      if (mode === "in" || mode === "out")
        zoom = Math.max(
          0.7,
          Math.min(2.6, zoom * (mode === "in" ? 1.2 : 1 / 1.2)),
        );
      actions.onView(tilt === 5);
      view();
    }
    let drag = null,
      moved = false;
    host.addEventListener("pointerdown", (e) => {
      drag = [e.clientX, e.clientY];
      moved = false;
    });
    host.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag[0],
        dy = e.clientY - drag[1];
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      drag = [e.clientX, e.clientY];
      angle += dx * 0.28;
      tilt = Math.max(5, Math.min(60, tilt - dy * 0.15));
      actions.onView(tilt === 5);
      view();
    });
    window.addEventListener("pointerup", () => {
      drag = null;
    });
    host.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.stopPropagation();
          moved = false;
        }
      },
      true,
    );
    host.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        zoom = Math.max(
          0.7,
          Math.min(2.6, zoom * Math.exp(-e.deltaY * 0.0011)),
        );
        view();
      },
      { passive: false },
    );
    new ResizeObserver(view).observe(frame);
    view();
    return {
      setView,
      setDie,
      setPieces(people, id) {
        roster = people;
        active = id;
        let bench = 0;
        for (const [key, spot] of pieces) {
          const p = people.find((player) => player.id === key);
          position(
            spot,
            p ? spotAt(key, p.position) : [-43, 520 - 115 * bench++],
          );
        }
      },
      async toss(value) {
        const tilt = matchMedia("(prefers-reduced-motion:reduce)").matches
          ? 0
          : 690;
        if (tilt)
          await cube.animate(
            [
              { transform: "translate3d(0,-65px,70px) rotate3d(1,1,.3,20deg)" },
              {
                transform: "translate3d(0,-25px,95px) rotate3d(1,1,.3,190deg)",
                offset: 0.45,
              },
              { transform: "translateZ(33px) rotate3d(1,1,.3,360deg)" },
            ],
            { duration: tilt, easing: "ease-out" },
          ).finished;
        setDie(value);
      },
      async hop(id, n, duration) {
        const spot = pieces.get(id);
        spot.style.transitionDuration = duration + "ms";
        position(spot, spotAt(id, n));
        if (duration)
          await new Promise((resolve) => setTimeout(resolve, duration));
      },
    };
  }
  window.PimpaTableFallback = { create };
})();
