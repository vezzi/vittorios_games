const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../dist/game.js");
require("../dist/board.js");
require("../dist/stories.js");

const { newGame, planMove, roll, move, valid, cells, finish } = PimpaGame;

test("la stampa, la selezione delle caselle e le storie usano lo stesso percorso", () => {
  for (const cell of cells) {
    assert.equal(PimpaBoard.cellAt(...PimpaBoard.center(cell.n)), cell.n);
    if (!cell.n) continue;
    assert.ok(fs.existsSync(path.join(__dirname, "../dist/assets/voce", cell.n + ".mp3")));
    const story = PimpaStories.storyFor(cell);
    if (typeof cell.effect === "number") {
      assert.ok(PimpaBoard.art[cell.effect]);
      assert.match(story.cue, new RegExp(cell.effect === finish ? "arrivo" : String(cell.effect)));
    }
    if (PimpaBoard.art[cell.n]) {
      const file = PimpaBoard.image(PimpaBoard.art[cell.n]);
      assert.ok(fs.existsSync(path.join(__dirname, "../dist", file)));
    }
  }
  assert.equal(PimpaBoard.cellAt(.5, .5), null);
  assert.equal(PimpaBoard.cellAt(0, 0), null);
});

test("un arrivo ripreso in qualsiasi fase applica la regola una volta sola", () => {
  for (let start = 0; start < finish; start++) {
    for (let die = 1; die <= 6; die++) {
      const game = newGame();
      game.players[0].position = start;
      roll(game, die);
      assert.ok(valid(game)); // Existing saved games have no journey field.
      const before = JSON.stringify(game);
      const plan = planMove(game);
      assert.equal(JSON.stringify(game), before);
      assert.equal(plan.landed, Math.min(start + die, finish));
      const phases = ["walk", "landed"];
      if (plan.target !== plan.landed) phases.push("travel", "target");
      for (const phase of phases) {
        const restored = JSON.parse(before);
        restored.journey = phase;
        assert.ok(valid(restored));
        assert.deepEqual(move(restored), plan);
        assert.ok(valid(restored));
        assert.equal(restored.journey, undefined);
        assert.equal(restored.turns, 1);
        assert.equal(restored.players[0].position, plan.target);
        assert.equal(restored.players[0].skip, cells[plan.target].effect === "skip");
        assert.equal(restored.phase, plan.target === finish ? "won" : "roll");
        assert.equal(restored.active, plan.target === finish || cells[plan.target].effect === "again" ? 0 : 1);
        assert.equal(move(restored), null);
        assert.equal(restored.turns, 1);
      }
    }
  }
});

test("Peppino accompagna alla ragnatela e la zucca che ride arriva alla festa", () => {
  for (const [at, target] of [[20, 11], [27, 31], [29, 5]]) {
    const game = newGame([{ id: "olivia", name: "Vittorio" }]);
    game.players[0].position = at - 1;
    roll(game, 1);
    const result = move(game);
    assert.equal(result.target, target);
    assert.equal(game.active, 0);
    assert.equal(game.players[0].skip, false);
    if (at === 20) assert.match(game.notice, /Vittorio salta questo turno/);
    if (at === 27) assert.equal(game.phase, "won");
  }
});
