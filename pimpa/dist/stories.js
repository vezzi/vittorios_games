/* The encounter is always staged with the pawn that actually landed here. */
(() => {
  "use strict";
  const encounters = {
    2: "Cucù! Nasconditi dal vampiro.",
    4: "Il corvo Nicola ti passa il dado.",
    5: "Ecco le caramelle!",
    7: "Il pipistrello ti prende in volo.",
    9: "Ops! Sei inciampato nella zucca.",
    11: "La ragnatela ti trattiene qui.",
    12: "Eccoti nella caverna!",
    14: "Il fantasma ti invita al castello.",
    16: "L’orco ti prende per mano.",
    18: "La maga fa apparire un dado per te.",
    20: "Il ragno Peppino cammina con te.",
    22: "Il portone del castello è aperto!",
    25: "Arriva il drago! Prendi il dado per scappare.",
    27: "La zucca ride e ti fa volare!",
    29: "La strega ti regala un dolcetto.",
    30: "Sali sulla nave del pirata.",
    31: "La maga ti accoglie. Hai vinto!",
  };
  const walkers = [16, 20];
  function storyFor(cell) {
    const { n, effect } = cell;
    const story = {
      title: PimpaBoard.art[n] ? cell.name : "Una sosta nel bosco",
      line: encounters[n] || "Una piccola sosta sul sentiero.",
      cue: "Qui aspetti il prossimo turno.",
      button: "Continua",
      symbol: "footprint",
    };
    if (typeof effect === "number") {
      const fly = !walkers.includes(n);
      const verb = fly ? "Vola" : "Cammina";
      story.cue =
        effect === PimpaGame.finish
          ? "Vola fino all’arrivo!"
          : effect < n
            ? `Torna alla casella ${effect}.`
            : `Vai alla casella ${effect}.`;
      story.button =
        effect === PimpaGame.finish
          ? "Vola all’arrivo"
          : `${verb} al ${effect}`;
      story.symbol = "trail";
    } else if (effect === "skip") {
      Object.assign(story, {
        cue: "Riposa per un turno.",
        button: "Mi riposo",
        symbol: "skip",
      });
    } else if (effect === "again") {
      Object.assign(story, {
        cue: "Tira ancora il dado!",
        button: "Al dado",
        symbol: "die",
      });
    } else if (n === PimpaGame.finish) {
      Object.assign(story, {
        cue: "È il momento della festa!",
        button: "Festeggiamo!",
        symbol: "win",
      });
    }
    return story;
  }

  // A recurring movement belongs to a particular actor or prop, in its own local space.
  const motions = {
    nod: ["none", "rotate(-9deg)", "rotate(7deg)", "none"],
    receive: ["none", "none", "translate(-5%,-5%) rotate(-5deg)", "none"],
    walk: [
      "none",
      "translate(-8%,-6%)",
      "translate(-16%,0)",
      "translate(-24%,-6%)",
      "translate(-32%,0)",
    ],
    guide: [
      "none",
      "translate(24%,-5%)",
      "translate(48%,0)",
      "translate(66%,-7%)",
      "translate(81%,0)",
    ],
    fly: [
      "none",
      "translate(40%,-15%) rotate(-8deg)",
      "translate(68%,0)",
      "translate(75%,-24%)",
    ],
    lift: [
      "none",
      "none",
      "translate(-6%,0)",
      "translate(-8%,-23%) rotate(5deg)",
    ],
    jump: [
      "none",
      "translateY(-17%) rotate(-4deg)",
      "none",
      "translateY(-9%)",
      "none",
    ],
    stumble: [
      "none",
      "translate(-35%,-4%)",
      "translate(-54%,-12%) rotate(-16deg)",
      "translate(-65%,5%) rotate(-9deg)",
    ],
    sway: ["none", "rotate(-7deg)", "rotate(8deg)", "none"],
    hide: [
      "none",
      "translate(-5%,0)",
      "translate(0,15%) rotate(6deg)",
      "translate(0,20%) rotate(5deg)",
    ],
    climb: [
      "none",
      "translate(-56%,-8%)",
      "translate(-122%,-39%)",
      "translate(-170%,-15%)",
    ],
    net: [
      "none",
      "scale(.9)",
      "translateX(107%) rotate(12deg)",
      "translateX(126%) scale(1.04)",
    ],
    give: [
      "scale(.65)",
      "scale(.9)",
      "translate(80%,-27%) rotate(-12deg)",
      "translate(182%,22%) rotate(12deg)",
    ],
    toss: [
      "scale(.6)",
      "translate(36%,-40%) rotate(80deg)",
      "translate(110%,-62%) rotate(210deg)",
      "translate(180%,25%) rotate(360deg)",
    ],
    appear: ["scale(0)", "scale(0)", "scale(1.1)", "scale(1)"],
    flutter: [
      "none",
      "translate(20%,-12%) rotate(-5deg)",
      "translate(42%,-3%)",
      "translate(56%,-12%)",
    ],
    scurry: [
      "none",
      "translateX(15%) rotate(-9deg)",
      "translateX(35%) rotate(8deg)",
      "translateX(54%) rotate(-6deg)",
    ],
  };
  // [encounter actor, player's reaction, optional prop, prop movement]
  const scenes = {
    2: ["nod", "hide", "bush", "appear"],
    4: ["nod", "receive", "dice", "toss"],
    5: ["jump", "receive"],
    7: ["fly", "lift"],
    9: ["sway", "stumble"],
    11: ["net", "hide"],
    12: ["nod", "walk"],
    14: ["flutter", "receive", "key", "give"],
    16: ["guide", "walk"],
    18: ["nod", "receive", "dice", "toss"],
    20: ["scurry", "walk"],
    22: ["nod", "walk"],
    25: ["flutter", "jump", "dice", "toss"],
    27: ["fly", "lift"],
    29: ["nod", "receive", "caramella", "give"],
    30: ["sway", "climb"],
    31: ["nod", "jump", "star", "give"],
  };
  const props = {
    dice: '<rect x="6" y="6" width="52" height="52" rx="12" fill="#db5847" stroke="#713b42" stroke-width="3"/><g fill="#fff6ce"><circle cx="19" cy="20" r="5"/><circle cx="32" cy="32" r="5"/><circle cx="45" cy="44" r="5"/></g>',
    key: '<g fill="#ffd965" stroke="#845731" stroke-width="3"><path d="m27 32 22-20 5 5-5 5 4 4-6 6-4-4-12 10z"/><circle cx="24" cy="40" r="12"/></g><circle cx="24" cy="40" r="5" fill="#ac7438"/>',
    star: '<path d="m32 3 9 18 20 4-15 15 2 21-16-10-18 9 3-21L3 24l21-3z" fill="#ffdb66" stroke="#ac7236" stroke-width="3"/>',
    bush: '<path d="M3 59Q-3 44 10 42Q4 22 21 24Q20 4 34 9Q47 5 45 24Q65 17 58 37Q68 45 60 58Z" fill="#429073" stroke="#275f53" stroke-width="2"/><path d="M15 52q3-10 10-13m5 15q5-15 17-20" fill="none" stroke="#8bc492" stroke-width="3"/>',
  };
  const propSvg = (key) =>
    `<svg aria-hidden="true" viewBox="0 0 64 64">${props[key]}</svg>`;
  const byId = (id) => document.getElementById(id);
  function illustration(parent, src) {
    const img = document.createElement("img");
    img.alt = "";
    img.src = src;
    img.draggable = false;
    parent.replaceChildren(img);
  }
  async function show({
    cell,
    player,
    anchor,
    icon,
    soundEnabled,
    toggleSound,
  }) {
    const dialog = byId("arrival");
    const { n, effect } = cell;
    const story = storyFor(cell);
    const stage = byId("story-stage");
    const actor = byId("story-actor"),
      hero = byId("story-pawn"),
      prop = byId("story-prop");
    const cueIcon = byId("story-symbol");
    const pause = byId("story-pause"),
      speaker = byId("story-sound"),
      replay = byId("story-replay");
    const voice = byId("story-voice");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.dataset.cell = n;
    byId("story-number").textContent = n;
    byId("story-player").textContent = player.name;
    byId("story-title").textContent = story.title;
    byId("story-line").textContent = story.line;
    byId("story-cue").textContent = story.cue;
    byId("story-next").innerHTML = icon(story.symbol);
    byId("story-next").append(document.createTextNode(story.button));
    cueIcon.replaceChildren();
    if (typeof effect === "number") {
      const number = document.createElement("b");
      number.textContent = effect;
      cueIcon.append(number);
      illustration(
        byId("story-place"),
        PimpaBoard.image(PimpaBoard.art[effect]),
      );
    } else {
      cueIcon.innerHTML = icon(story.symbol);
      byId("story-place").replaceChildren();
    }
    const art = PimpaBoard.art[n];
    actor.hidden = !art;
    if (art) illustration(actor, PimpaBoard.image(art));
    illustration(hero, `assets/characters/${player.id}.png`);
    hero.classList.toggle("solo", !art);
    const [act, reaction, item, propMotion] = scenes[n] || [null, "jump"];
    prop.hidden = !item;
    prop.dataset.prop = item || "";
    if (item === "caramella") illustration(prop, PimpaBoard.image(item));
    else if (item) prop.innerHTML = propSvg(item);
    dialog.showModal();
    const rect = dialog.getBoundingClientRect();
    dialog.style.setProperty(
      "--from-x",
      anchor.x - rect.left - rect.width / 2 + "px",
    );
    dialog.style.setProperty(
      "--from-y",
      anchor.y - rect.top - rect.height / 2 + "px",
    );
    if (!reduced)
      dialog.animate(
        [
          {
            transform: "translate(var(--from-x), var(--from-y)) scale(.12)",
            opacity: 0.2,
          },
          { transform: "translate(0,0) scale(1)", opacity: 1 },
        ],
        { duration: 370, easing: "cubic-bezier(.17,.76,.25,1)" },
      );

    let animations = [],
      timer,
      deadline,
      remaining,
      paused = false;
    // A paused page keeps its place while a child looks elsewhere.
    let manuallyPaused = false;
    voice.src = `assets/voce/${n}.mp3`;
    function syncSound() {
      speaker.innerHTML = icon(soundEnabled() ? "sound" : "muted");
      speaker.setAttribute("aria-pressed", String(soundEnabled()));
      speaker.setAttribute(
        "aria-label",
        soundEnabled() ? "Disattiva la voce" : "Attiva la voce",
      );
    }
    function runVoice() {
      if (soundEnabled() && !paused) voice.play().catch(() => {});
    }
    function setTimer() {
      clearTimeout(timer);
      if (paused) return;
      deadline = performance.now() + remaining;
      timer = setTimeout(() => dialog.close(), remaining);
    }
    function setPaused(value) {
      if (value === paused) return;
      paused = value;
      if (paused) {
        remaining = Math.max(100, deadline - performance.now());
        clearTimeout(timer);
        animations.forEach((a) => a.pause());
        voice.pause();
      } else {
        animations.forEach((a) => a.play());
        runVoice();
        setTimer();
      }
      pause.innerHTML = icon(paused ? "play" : "skip");
      pause.append(document.createTextNode(paused ? "Riprendi" : "Pausa"));
    }
    function animate(node, motion) {
      if (!motion) return;
      const frames = motions[motion].map((transform) => ({ transform }));
      const animation = node.animate(reduced ? [frames.at(-1)] : frames, {
        duration: reduced ? 0 : 1900,
        delay: reduced ? 0 : 220,
        easing: "ease-in-out",
        fill: "both",
      });
      animations.push(animation);
    }
    function start() {
      clearTimeout(timer);
      animations.forEach((a) => a.cancel());
      animations = [];
      paused = false;
      manuallyPaused = false;
      pause.innerHTML = icon("skip") + "Pausa";
      animate(actor, act);
      animate(hero, reaction);
      animate(prop, propMotion);
      voice.pause();
      voice.currentTime = 0;
      remaining = cell.effect || n === PimpaGame.finish ? 5100 : 3500;
      if (soundEnabled()) {
        remaining = Math.max(
          remaining,
          Number.isFinite(voice.duration) ? voice.duration * 1000 + 850 : 7000,
        );
        runVoice();
      }
      setTimer();
      if (document.hidden) setPaused(true);
    }
    const onVisibility = () => setPaused(document.hidden || manuallyPaused);
    const closed = new Promise((resolve) =>
      dialog.addEventListener("close", resolve, { once: true }),
    );
    replay.onclick = start;
    pause.onclick = () => {
      manuallyPaused = !paused;
      setPaused(manuallyPaused);
    };
    speaker.onclick = () => {
      toggleSound();
      syncSound();
      start();
    };
    byId("story-next").onclick = () => dialog.close();
    voice.onloadedmetadata = () => {
      if (!soundEnabled()) return;
      const left = (voice.duration - voice.currentTime) * 1000 + 850;
      remaining = Math.max(
        paused ? remaining : deadline - performance.now(),
        left,
      );
      setTimer();
    };
    document.addEventListener("visibilitychange", onVisibility);
    syncSound();
    start();
    await closed;
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    voice.onloadedmetadata = null;
    voice.pause();
    animations.forEach((a) => a.cancel());
  }
  globalThis.PimpaStories = {
    show,
    storyFor,
    travelsOnFoot: (n) => walkers.includes(n),
  };
})();
