const { test } = require("node:test");
const assert = require("node:assert/strict");
require("../dist/voice.js");

function fixture({ api = "SpeechRecognition", availability = "downloadable", failStart = false } = {}) {
  const statuses = [];
  const commands = [];
  const recognitions = [];
  const availabilityChecks = [];
  const timers = new Map();
  let now = 0;

  class Recognition {
    constructor() {
      this.starts = 0;
      this.aborts = 0;
      recognitions.push(this);
    }
    static async available(options) {
      availabilityChecks.push(options);
      if (availability instanceof Error) throw availability;
      return availability;
    }
    start() {
      this.starts++;
      if (failStart) throw new Error("start() failed");
    }
    abort() {
      this.aborts++;
      this.onerror({ error: "aborted" });
      this.onend();
    }
    result(transcript, isFinal = true) {
      const result = Object.assign([{ transcript }], { isFinal });
      this.onresult({ results: [result], resultIndex: 0 });
    }
  }
  Recognition.prototype.processLocally = false;

  const browser = {
    performance: { now: () => now },
    setTimeout(callback, delay) {
      const timer = Symbol();
      timers.set(timer, { callback, deadline: now + delay });
      return timer;
    },
    clearTimeout(timer) {
      timers.delete(timer);
    },
  };
  if (api) browser[api] = Recognition;

  const voice = PimpaVoice.create({
    browser,
    onStatus: (status) => statuses.push(status),
    onCommand: (command) => commands.push(command),
  });

  return {
    voice, statuses, commands, recognitions, availabilityChecks, timers,
    advance(ms, runTimers = true) {
      now += ms;
      if (!runTimers) return;
      for (const [timer, { callback, deadline }] of timers) {
        if (deadline > now) continue;
        timers.delete(timer);
        callback();
      }
    },
  };
}

test("un tocco apre una sola sessione italiana e il primo risultato finale la chiude", () => {
  const { voice, recognitions, statuses, commands, timers } = fixture();
  assert.equal(recognitions.length, 0);
  voice.start("roll");
  voice.start("roll");
  assert.equal(recognitions.length, 1);
  const [recognition] = recognitions;
  assert.equal(recognition.starts, 1);
  assert.equal(recognition.lang, "it-IT");
  assert.equal(recognition.continuous, false);
  assert.equal(recognition.interimResults, false);
  assert.equal(recognition.maxAlternatives, 1);
  recognition.onaudiostart();
  recognition.result("lancia il dado", false);
  assert.deepEqual(commands, []);
  assert.equal(voice.active, true);
  recognition.onaudioend();
  recognition.result("  LANCIA   il dado!  ");
  recognition.result("lancia il dado");
  assert.deepEqual(commands, ["roll"]);
  assert.equal(recognition.aborts, 1);
  assert.deepEqual(statuses, ["starting", "listening", "processing", "idle"]);
  assert.equal(timers.size, 0);
});

test("muovi è valido nella fase di movimento e funziona con il riconoscitore con prefisso", () => {
  const { voice, recognitions, commands } = fixture({ api: "webkitSpeechRecognition" });
  assert.equal(voice.supported, true);
  voice.start("move");
  recognitions[0].result(" Muovi. ");
  assert.deepEqual(commands, ["move"]);
  assert.equal(voice.active, false);
});

test("una frase estranea, composta o fuori fase chiude l'ascolto senza azioni", () => {
  const cases = [
    ["roll", "tira"],
    ["roll", "lancia il dado e muovi"],
    ["roll", "muovi"],
    ["move", "non muovi"],
    ["move", "lancia il dado"],
  ];
  for (const [phase, phrase] of cases) {
    const { voice, recognitions, statuses, commands } = fixture();
    voice.start(phase);
    recognitions[0].result(phrase);
    recognitions[0].result(PimpaVoice.phrases[phase]);
    assert.deepEqual(commands, [], phrase);
    assert.equal(statuses.at(-1), "unrecognized", phrase);
    assert.equal(recognitions[0].aborts, 1, phrase);
  }
});

test("la voce vale a 3.999 ms e il timer chiude a 4.000 ms dall'attivazione", () => {
  const { voice, recognitions, statuses, commands, advance } = fixture();
  voice.start("roll");
  advance(3999);
  recognitions[0].result("lancia il dado");
  assert.deepEqual(commands, ["roll"]);
  voice.start("move");
  advance(3999);
  assert.equal(voice.active, true);
  advance(1);
  assert.equal(voice.active, false);
  assert.equal(recognitions[1].aborts, 1);
  assert.equal(statuses.at(-1), "empty");
  recognitions[1].result("muovi");
  assert.deepEqual(commands, ["roll"]);
});

test("un risultato a 4.000 ms è scaduto anche se il timer è in ritardo", () => {
  const { voice, recognitions, commands, statuses, timers, advance } = fixture();
  voice.start("roll");
  advance(4000, false);
  recognitions[0].result("lancia il dado");
  assert.deepEqual(commands, []);
  assert.equal(recognitions[0].aborts, 1);
  assert.equal(statuses.at(-1), "empty");
  assert.equal(timers.size, 0);
});

test("un permesso tardivo non riapre l'ascolto né altera la sessione successiva", () => {
  const { voice, recognitions, commands, statuses, advance } = fixture();
  voice.start("roll");
  advance(4000);
  voice.start("move");
  recognitions[0].onaudiostart();
  recognitions[0].onerror({ error: "not-allowed" });
  recognitions[0].result("lancia il dado");
  assert.equal(recognitions[0].aborts, 2);
  assert.equal(statuses.at(-1), "starting");
  assert.equal(voice.active, true);
  assert.deepEqual(commands, []);
  recognitions[1].result("muovi");
  assert.deepEqual(commands, ["move"]);
});

test("annullamento, fine anticipata ed errori liberano la sessione", () => {
  const { voice, recognitions, statuses, commands, timers } = fixture();
  const cases = [
    [() => voice.cancel(), "idle", 1],
    [(recognition) => recognition.onend(), "empty", 0],
    [(recognition) => recognition.onnomatch(), "unrecognized", 1],
    [(recognition) => recognition.onerror({ error: "no-speech" }), "empty", 0],
    [(recognition) => recognition.onerror({ error: "not-allowed" }), "denied", 0],
    [(recognition) => recognition.onerror({ error: "network" }), "unavailable", 0],
  ];
  for (const [close, status, aborts] of cases) {
    voice.start("roll");
    const recognition = recognitions.at(-1);
    close(recognition);
    assert.equal(voice.active, false);
    assert.equal(recognition.aborts, aborts);
    assert.equal(timers.size, 0);
    assert.equal(statuses.at(-1), status);
    recognition.result("lancia il dado");
    assert.deepEqual(commands, []);
  }
  assert.equal(recognitions.length, cases.length);
});

test("un avvio fallito libera il timer e l'assenza dell'API impedisce l'ascolto", () => {
  const missing = fixture({ api: null });
  assert.equal(missing.voice.supported, false);
  missing.voice.start("roll");
  assert.equal(missing.recognitions.length, 0);

  const failed = fixture({ failStart: true });
  failed.voice.start("roll");
  assert.equal(failed.voice.active, false);
  assert.equal(failed.statuses.at(-1), "unavailable");
  assert.equal(failed.timers.size, 0);
});

test("il controllo dell'italiano locale è passivo e usa la modalità locale solo se disponibile", async () => {
  for (const availability of ["available", "downloadable", new Error("policy")]) {
    const { voice, recognitions, availabilityChecks } = fixture({ availability });
    const local = await voice.preferLocal();
    assert.deepEqual(availabilityChecks, [{ langs: ["it-IT"], processLocally: true }]);
    assert.equal(recognitions.length, 0);
    assert.equal(local, availability === "available");
    voice.start("roll");
    assert.equal(recognitions[0].processLocally, local);
    voice.cancel();
  }
});
