(() => {
  "use strict";
  const language = "it-IT";
  const phrases = Object.freeze({ roll: "lancia il dado", move: "muovi" });

  function normalize(transcript) {
    return transcript
      .toLowerCase()
      .trim()
      .replace(/[.!?…]+$/, "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function abort(recognition) {
    try {
      recognition.abort();
    } catch {
      // Some implementations reject abort after the recognition has ended.
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
      if (!ended) abort(attempt.recognition);
      onStatus(status);
      return true;
    }

    function start(action) {
      if (session || !supported || !Object.hasOwn(phrases, action)) return;

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

      const attempt = { recognition };
      session = attempt;
      recognition.onaudiostart = () => {
        if (session === attempt) onStatus("listening");
        else abort(recognition);
      };
      recognition.onaudioend = () => {
        if (session === attempt) onStatus("processing");
      };
      recognition.onresult = (event) => {
        if (session !== attempt) return;
        const result = event.results[event.resultIndex];
        if (!result?.isFinal) return;
        const matches = normalize(result[0]?.transcript ?? "") === phrases[action];
        if (finish(attempt, matches ? "idle" : "unrecognized") && matches) {
          onCommand(action);
        }
      };
      recognition.onnomatch = () => finish(attempt, "unrecognized");
      recognition.onerror = ({ error }) => {
        const status = {
          "no-speech": "empty",
          "not-allowed": "denied",
          aborted: "idle",
        }[error] || "unavailable";
        finish(attempt, status, true);
      };
      recognition.onend = () => finish(attempt, "empty", true);

      onStatus("starting");
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
