(() => {
  "use strict";
  const W = 5.8,
    D = (W * 7) / 5,
    boardY = 0.135;
  const initialBearing = 0.12,
    initialElevation = 1.03;
  const ids = Object.keys(PimpaGame.characters);
  const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  async function create({ onCell, onDie, onPawn, onEdit, onView }) {
    const T = window.THREE,
      host = document.getElementById("scene"),
      frame = document.getElementById("scene-frame");
    const renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.01;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Tabellone in tre dimensioni. Usa le frecce per ruotare, più e meno per lo zoom e Home per tornare alla visuale iniziale.",
    );
    host.replaceChildren(canvas);
    const scene = new T.Scene();
    scene.background = new T.Color(0x644d39);
    const camera = new T.PerspectiveCamera(33, 1, 0.08, 120);
    const loader = new T.TextureLoader();
    if (location.protocol === "file:") {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "assets/local-textures.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    const fileTexture = (url) =>
      loader
        .loadAsync(window.PimpaLocalTextures?.[url] || url)
        .then((texture) => {
          texture.colorSpace = T.SRGBColorSpace;
          texture.anisotropy = Math.min(
            12,
            renderer.capabilities.getMaxAnisotropy(),
          );
          return texture;
        });
    const [wood, print, ...faces] = await Promise.all([
      fileTexture("assets/table-wood.jpg"),
      fileTexture("assets/illustrazioni-tabellone.webp"),
      ...ids.map((id) => fileTexture(`assets/characters/${id}.png`)),
    ]);
    const hemi = new T.HemisphereLight(0xfff5e4, 0xb48c64, 1.25);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xffedce, 1.85);
    key.position.set(-4.8, 8, -3.4);
    key.castShadow = true;
    Object.assign(key.shadow.camera, {
      left: -7.5,
      right: 7.5,
      top: 7.5,
      bottom: -7.5,
      near: 0.2,
      far: 24,
    });
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.00014;
    key.shadow.normalBias = 0.009;
    key.shadow.radius = 3.2;
    key.shadow.blurSamples = 5;
    scene.add(key, key.target);
    const fill = new T.DirectionalLight(0xd7e7ff, 0.46);
    fill.position.set(3, 4, 5);
    scene.add(fill);
    // A large window and warm walls reflected in the satin die and varnished table.
    const room = new T.Scene();
    room.background = new T.Color(0x746559);
    const windowPanel = new T.Mesh(
      new T.PlaneGeometry(5, 4),
      new T.MeshBasicMaterial({
        color: new T.Color(3.2, 2.85, 2.4),
        side: T.DoubleSide,
      }),
    );
    windowPanel.position.set(-4, 4, 1);
    windowPanel.lookAt(0, 0, 0);
    room.add(windowPanel);
    const ceiling = new T.Mesh(
      new T.PlaneGeometry(12, 9),
      new T.MeshBasicMaterial({
        color: new T.Color(1.12, 1.08, 1.02),
        side: T.DoubleSide,
      }),
    );
    ceiling.position.y = 6;
    ceiling.rotation.x = Math.PI / 2;
    room.add(ceiling);
    const pmrem = new T.PMREMGenerator(renderer),
      env = pmrem.fromScene(room, 0.025);
    scene.environment = env.texture;
    pmrem.dispose();
    windowPanel.geometry.dispose();
    windowPanel.material.dispose();
    ceiling.geometry.dispose();
    ceiling.material.dispose();
    wood.wrapS = wood.wrapT = T.MirroredRepeatWrapping;
    wood.repeat.set(8, 11);
    wood.rotation = -0.12;
    wood.center.set(0.5, 0.5);
    const table = new T.Mesh(
      new T.PlaneGeometry(130, 130),
      new T.MeshStandardMaterial({
        map: wood,
        color: 0x998a78,
        roughness: 0.63,
        metalness: 0.015,
        envMapIntensity: 0.17,
        bumpMap: wood,
        bumpScale: 0.019,
      }),
    );
    table.rotation.x = -Math.PI / 2;
    table.receiveShadow = true;
    scene.add(table);
    function makeShadow(board = false) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d");
      if (board) {
        ctx.filter = "blur(4px)";
        ctx.fillStyle = "rgba(39,22,11,.57)";
        ctx.fillRect(9, 9, 110, 110);
      } else {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
        g.addColorStop(0, "rgba(32,21,12,.63)");
        g.addColorStop(0.37, "rgba(37,23,14,.38)");
        g.addColorStop(1, "rgba(37,23,14,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      }
      const tex = new T.CanvasTexture(c);
      tex.colorSpace = T.SRGBColorSpace;
      const mesh = new T.Mesh(
        new T.PlaneGeometry(1, 1),
        new T.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 1;
      return mesh;
    }
    const boardShade = makeShadow(true);
    boardShade.position.set(0.05, 0.006, 0.07);
    boardShade.scale.set(W * 1.15, D * 1.15, 1);
    scene.add(boardShade);
    function roundedShape(w, h, r) {
      const s = new T.Shape(),
        x = -w / 2,
        y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return s;
    }
    const shape = roundedShape(W, D, 0.115);
    function boardLayer(bottom, thickness, color) {
      const geo = new T.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.009,
        bevelSize: 0.011,
        bevelSegments: 2,
        curveSegments: 6,
      });
      const mesh = new T.Mesh(
        geo,
        new T.MeshStandardMaterial({
          color,
          roughness: 0.94,
          envMapIntensity: 0.12,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = bottom;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
    boardLayer(0.015, 0.085, 0x917651);
    boardLayer(0.108, 0.014, 0xf3e6c9);
    const topGeo = new T.ShapeGeometry(shape, 9);
    const pos = topGeo.attributes.position,
      uv = topGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++)
      uv.setXY(i, pos.getX(i) / W + 0.5, pos.getY(i) / D + 0.5);
    const paper = new T.Mesh(
      topGeo,
      new T.MeshStandardMaterial({
        map: print,
        color: 0xfffffa,
        roughness: 0.91,
        envMapIntensity: 0.11,
      }),
    );
    paper.rotation.x = -Math.PI / 2;
    paper.position.y = boardY;
    paper.receiveShadow = true;
    scene.add(paper);
    // The printed square stays visible inside a narrow gold outline.
    const tileWidth = W * PimpaBoard.cellWidth / PimpaBoard.width;
    const tileDepth = D * PimpaBoard.cellHeight / PimpaBoard.height;
    const border = roundedShape(tileWidth * .96, tileDepth * .96, .07);
    border.holes.push(roundedShape(tileWidth * .88, tileDepth * .88, .05));
    const outline = new T.Mesh(new T.ShapeGeometry(border), new T.MeshBasicMaterial({
      color: 0xffce45, toneMapped: false,
    }));
    outline.rotation.x = -Math.PI / 2;
    outline.visible = false;
    scene.add(outline);

    const die = PimpaDie.create(T);
    scene.add(die.object);
    const dieHome = new T.Vector3(W / 2 + 0.77, 0, D * 0.32);
    die.object.position.set(dieHome.x, 0.38, dieHome.z);
    die.orient(4);
    const dieShadow = makeShadow();
    dieShadow.position.y = 0.009;
    scene.add(dieShadow);
    const pieces = new Map();
    faces.forEach((tex, i) => {
      const id = ids[i],
        piece = PimpaPawn.create(T, tex, id);
      piece.scale.setScalar(0.93);
      scene.add(piece);
      const shadow = makeShadow();
      shadow.scale.set(0.82, 0.42, 1);
      scene.add(shadow);
      pieces.set(id, { piece, shadow });
    });

    let players = [],
      activeId = null,
      animating = 0,
      dirty = true,
      animation = null,
      drawDieUntil = 0,
      lastTick = 0;
    function cellPoint(n) {
      const [u, v] = PimpaBoard.center(n);
      return new T.Vector3((u - 0.5) * W, boardY + 0.004, (v - 0.5) * D);
    }
    function highlight(n) {
      outline.visible = n != null;
      if (outline.visible) {
        outline.position.copy(cellPoint(n));
        outline.position.y += .012;
      }
      dirty = true;
    }
    function screenPoint(n) {
      const point = cellPoint(n).project(camera);
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + (1 + point.x) * rect.width / 2,
        y: rect.top + (1 - point.y) * rect.height / 2 };
    }
    function revealPath(numbers) {
      const fr = frame.getBoundingClientRect();
      if (numbers.some(n => {
        const {x, y} = screenPoint(n);
        return x < fr.left + 20 || x > fr.right - 20 || y < fr.top + 24 || y > fr.bottom - 20;
      })) {
        focused = null;
        zoom = 1;
        view();
      }
    }
    function occupiedPoint(id, n) {
      const point = cellPoint(n);
      const others = players
        .filter((p) => p.position === n || p.id === id)
        .map((p) => p.id);
      const i = others.indexOf(id);
      if (others.length === 2) {
        point.x += i === 0 ? -0.25 : 0.25;
        point.z += i === 0 ? 0.13 : -0.14;
      }
      if (others.length > 2) {
        point.x += i % 2 === 0 ? -0.27 : 0.27;
        point.z += i < 2 ? 0.21 : -0.25;
      }
      return point;
    }
    const bench = [
      new T.Vector3(-W / 2 - 0.69, 0.006, D * 0.27),
      new T.Vector3(-W / 2 - 0.79, 0.006, D * 0.06),
      new T.Vector3(-W / 2 - 0.62, 0.006, -D * 0.18),
    ];
    function setPieces(people, active) {
      players = people.map((p) => ({ ...p }));
      activeId = active;
      let waiting = 0;
      for (const [id, { piece, shadow }] of pieces) {
        const p = players.find((p) => p.id === id);
        const point = p ? occupiedPoint(id, p.position) : bench[waiting++];

        piece.position.copy(point);
        piece.rotation.y = p
          ? 0.23 + (ids.indexOf(id) % 2) * 0.14
          : 0.48 - waiting * 0.11;
        piece.scale.setScalar(
          p &&
            players.filter((player) => player.position === p.position).length >
              2
            ? 0.74
            : 0.93,
        );
        shadow.position.set(point.x, point.y + 0.004, point.z);
        shadow.visible = true;
      }
      dirty = true;
    }
    function hop(id, n, duration, flight = false) {
      const { piece, shadow } = pieces.get(id),
        from = piece.position.clone(),
        to = occupiedPoint(id, n);
      if (!duration) {
        piece.position.copy(to);
        shadow.position.set(to.x, to.y + 0.004, to.z);
        dirty = true;
        return Promise.resolve();
      }
      animating++;
      return new Promise((resolve) => {
        animation = {
          start: performance.now(),
          duration,
          lift: flight ? 1.05 : 0.23,
          from,
          to,
          piece,
          shadow,
          resolve,
        };
      });
    }
    let bearing = initialBearing,
      elevation = initialElevation,
      zoom = 1,
      overhead = false,
      focused = null;
    const focus = new T.Vector3(0, 0.16, 0);
    const bounds = [];
    for (const x of [-W / 2, W / 2])
      for (const z of [-D / 2, D / 2]) bounds.push(new T.Vector3(x, boardY, z));
    bounds.push(
      new T.Vector3(-W / 2 - 0.87, 1.03, D * 0.27),
      new T.Vector3(dieHome.x + 0.48, 0.5, dieHome.z + 0.38),
      new T.Vector3(-W / 2 + 0.3, 1.05, -D / 2 + 0.4),
    );
    function view() {
      const rect = host.getBoundingClientRect(),
        fr = frame.getBoundingClientRect();
      const w = Math.max(1, rect.width),
        h = Math.max(1, rect.height);
      focus.set(0, 0.16, 0);
      renderer.setSize(w, h, false);
      camera.clearViewOffset();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const direction = new T.Vector3(
        Math.sin(bearing) * Math.cos(elevation),
        Math.sin(elevation),
        Math.cos(bearing) * Math.cos(elevation),
      );
      const place = (distance) => {
        camera.position.copy(focus).addScaledVector(direction, distance);
        camera.lookAt(focus);
        camera.updateMatrixWorld();
      };
      function projected(distance) {
        place(distance);
        const box = new T.Box2();
        bounds.forEach((p) => {
          const v = p.clone().project(camera);
          box.expandByPoint(
            new T.Vector2(((v.x + 1) * w) / 2, ((1 - v.y) * h) / 2),
          );
        });
        return box;
      }
      let lo = 5.2,
        hi = 40;
      for (let n = 0; n < 14; n++) {
        const mid = (lo + hi) / 2,
          b = projected(mid);
        if (
          b.max.x - b.min.x > fr.width * 0.96 ||
          b.max.y - b.min.y > fr.height * 0.97
        )
          lo = mid;
        else hi = mid;
      }
      // Use the same framing centre while zooming so a close-up really does crop into the table.
      const fitted = projected(hi),
        center = fitted.getCenter(new T.Vector2());
      if (focused !== null) {
        focus.copy(cellPoint(focused));
        center.set(w / 2, h / 2);
      }
      place(hi / zoom);
      const desiredX = fr.left - rect.left + fr.width / 2,
        desiredY = fr.top - rect.top + fr.height / 2;
      camera.setViewOffset(
        w,
        h,
        center.x - desiredX,
        center.y - desiredY,
        w,
        h,
      );
      camera.updateProjectionMatrix();
      dirty = true;
    }
    function setView(mode, n) {
      if (mode === "cell") {
        focused = n;
        zoom = 1.85;
        highlight(n);
      }
      if (mode === "reset" || mode === "top") {
        focused = null;
        highlight(null);
      }
      if (mode === "reset") {
        bearing = initialBearing;
        elevation = initialElevation;
        zoom = 1;
        overhead = false;
      }
      if (mode === "top") {
        overhead = !overhead;
        bearing = overhead ? 0 : initialBearing;
        elevation = overhead ? Math.PI * 0.492 : initialElevation;
        zoom = 1;
      }
      if (mode === "in" || mode === "out")
        zoom = clamp(zoom * (mode === "in" ? 1.2 : 1 / 1.2), 0.68, 2.8);
      onView(overhead);
      view();
    }
    const pointers = new Map();
    let drag = null,
      lastPinch = 0;
    const distance = () => {
      const [a, b] = pointers.values();
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1)
        drag = { x: e.clientX, y: e.clientY, moved: false };
      else if (pointers.size === 2) {
        lastPinch = distance();
        drag.moved = true;
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      const previous = pointers.get(e.pointerId);
      if (!previous) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const d = distance();
        if (lastPinch > 0) zoom = clamp((zoom * d) / lastPinch, 0.68, 2.8);
        lastPinch = d;
        view();
        return;
      }
      if (
        !drag ||
        (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4)
      )
        return;
      drag.moved = true;
      bearing -= (e.clientX - previous.x) * 0.006;
      elevation = clamp(
        elevation + (e.clientY - previous.y) * 0.005,
        0.39,
        Math.PI * 0.492,
      );
      overhead = false;
      onView(false);
      view();
    });
    const ray = new T.Raycaster();
    function pick(e) {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new T.Vector2(
          (2 * (e.clientX - r.left)) / r.width - 1,
          1 - (2 * (e.clientY - r.top)) / r.height,
        ),
        camera,
      );
      const intersections = ray.intersectObjects(
        [paper, die.object, ...[...pieces.values()].map((p) => p.piece)],
        true,
      );
      if (!intersections.length) return;
      const hit = intersections[0];
      let object = hit.object;
      while (object && object !== paper && object !== die.object) {
        const pawn = [...pieces].find(([, p]) => p.piece === object);
        if (pawn) {
          if (pawn[0] === activeId) onPawn();
          else if (!players.some((p) => p.id === pawn[0])) onEdit();
          else onCell(players.find((p) => p.id === pawn[0]).position);
          return;
        }
        object = object.parent;
      }
      if (object === die.object) {
        onDie();
        return;
      }
      if (object === paper) {
        const n = PimpaBoard.cellAt(hit.point.x / W + 0.5, hit.point.z / D + 0.5);
        if (n !== null) onCell(n);
      }
    }
    canvas.addEventListener("pointerup", (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (drag && !drag.moved) pick(e);
        drag = null;
      }
    });
    canvas.addEventListener("pointercancel", (e) => {
      pointers.delete(e.pointerId);
      drag = null;
    });
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0011), 0.68, 2.8);
        view();
      },
      { passive: false },
    );
    canvas.addEventListener("keydown", (e) => {
      if (e.key === "Home") setView("reset");
      else if (e.key === "+" || e.key === "=") setView("in");
      else if (e.key === "-") setView("out");
      else if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        bearing +=
          e.key === "ArrowLeft" ? 0.1 : e.key === "ArrowRight" ? -0.1 : 0;
        elevation = clamp(
          elevation +
            (e.key === "ArrowUp" ? 0.08 : e.key === "ArrowDown" ? -0.08 : 0),
          0.39,
          Math.PI * 0.492,
        );
        overhead = false;
        onView(false);
        view();
      } else return;
      e.preventDefault();
    });
    new ResizeObserver(view).observe(host);
    new ResizeObserver(view).observe(frame);
    function tick(now) {
      requestAnimationFrame(tick);
      if (!dirty && !animating && now > drawDieUntil && lastTick > drawDieUntil)
        return;
      die.update(now);
      const height = Math.max(0, die.object.position.y - 0.38),
        ds = 1.1 + height * 0.32;
      dieShadow.scale.set(ds, ds * 0.89, 1);
      dieShadow.position.x = die.object.position.x;
      dieShadow.position.z = die.object.position.z;
      dieShadow.material.opacity = 0.85 / (1 + height);
      if (animation) {
        const a = animation,
          t = clamp((now - a.start) / a.duration, 0, 1),
          smooth = t * t * (3 - 2 * t);
        a.piece.position.lerpVectors(a.from, a.to, smooth);
        a.shadow.position.copy(a.piece.position);
        a.shadow.position.y = a.to.y + 0.004;
        a.piece.position.y += Math.sin(Math.PI * t) * a.lift;
        a.piece.rotation.z = Math.sin(2 * Math.PI * t) * 0.06;
        if (t >= 1) {
          animation = null;
          animating--;
          a.resolve();
        }
      }
      renderer.render(scene, camera);
      dirty = false;
      lastTick = now;
    }
    view();
    requestAnimationFrame(tick);
    return {
      setPieces, highlight, screenPoint, revealPath,
      hop,
      setView,
      setDie(value) {
        die.orient(value);
        dirty = true;
      },
      async toss(value) {
        const end = dieHome.clone(),
          start = end.clone().add(new T.Vector3(0.15, 0, -1.65));
        drawDieUntil = performance.now() + 1550;
        dirty = true;
        await die.throwTo(value, start, end, reducedMotion());
        dirty = true;
      },
    };
  }
  window.PimpaTable = { create };
})();
