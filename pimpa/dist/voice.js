(() => {
  "use strict";
  const language = "it-IT";
  const limit = 4000;
  const phrases = Object.freeze({ roll: "lancia il dado", move: "muovi" });

  function normalize(transcript) {
    return transcript
      .toLowerCase()
      .trim()
      .replace(/[\p{P}\s]+$/u, "")
      .replace(/\s+/g, " ");
  }

  function abort(recognition) {
    try {
      recognition.abort();
    } catch {
      // A browser-side failure to abort must not block the game controls.
    }
  }

  function create({ onStatus, onCommand, browser = globalThis }) {
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    const supported = typeof Recognition === "function";
    let session = null;
    let local = false;

    async function preferLocal() {
      try {
        if (supported && "processLocally" in Recognition.prototype) {
          const availability = await Recognition.available?.({
            langs: [language],
            processLocally: true,
          });
          local = availability === "available";
        }
      } catch {
        local = false;
      }
      return local;
    }

    function finish(attempt, status, ended = false) {
      if (session !== attempt) return false;
      session = null;
      browser.clearTimeout(attempt.timer);
      if (!ended) abort(attempt.recognition);
      onStatus(status);
      return true;
    }

    function isLive(attempt) {
      if (session !== attempt) return false;
      if (browser.performance.now() < attempt.deadline) return true;
      finish(attempt, "empty");
      return false;
    }

    function start(action) {
      if (session || !supported || !Object.hasOwn(phrases, action)) return;

      const deadline = browser.performance.now() + limit;
      let recognition;
      try {
        recognition = new Recognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        if (local) recognition.processLocally = true;
      } catch {
        onStatus("unavailable");
        return;
      }

      const attempt = { recognition, deadline };
      session = attempt;
      recognition.onaudiostart = () => {
        // A delayed microphone permission can outlive this attempt.
        if (session !== attempt) abort(recognition);
        else if (isLive(attempt)) onStatus("listening");
      };
      recognition.onaudioend = () => {
        if (isLive(attempt)) onStatus("processing");
      };
      recognition.onresult = (event) => {
        if (!isLive(attempt)) return;
        const result = event.results[event.resultIndex];
        if (!result?.isFinal) return;
        const matches = normalize(result[0]?.transcript ?? "") === phrases[action];
        if (finish(attempt, matches ? "idle" : "unrecognized") && matches) {
          onCommand(action);
        }
      };
      recognition.onnomatch = () => {
        if (isLive(attempt)) finish(attempt, "unrecognized");
      };
      recognition.onerror = ({ error }) => {
        if (!isLive(attempt)) return;
        const status = {
          "no-speech": "empty",
          "not-allowed": "denied",
          aborted: "idle",
        }[error] || "unavailable";
        finish(attempt, status, true);
      };
      recognition.onend = () => finish(attempt, "empty", true);

      attempt.timer = browser.setTimeout(
        () => finish(attempt, "empty"),
        Math.max(0, Math.ceil(deadline - browser.performance.now())),
      );
      onStatus("starting");
      if (!isLive(attempt)) return;
      try {
        recognition.start();
      } catch {
        finish(attempt, "unavailable");
      }
    }

    return {
      supported,
      get active() {
        return session !== null;
      },
      preferLocal,
      start,
      cancel() {
        if (session) finish(session, "idle");
      },
    };
  }

  globalThis.PimpaVoice = { create, phrases };
})();
