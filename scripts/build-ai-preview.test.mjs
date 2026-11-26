import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { integrateGameHtml } from "./build-ai-preview.mjs";

const fixture = `<html><body><script>
(() => {
  let dinos = [];
  let seconds = 0;
  let running = false;
  let viewMode = "2d";
  function triggerDinoSkill(caster, livingEnemies) {
    const moveId = pick(caster.movePool);
  }
  function checkMatchEnded() { return false; }\n  function stepCombat(dt) {
    const living = dinos.filter((d) => d.alive);
    for (let d of living) {
      const enemies = living.filter((o) => o !== d);
      let nearest = enemies[0];
      let bestDist = Infinity;
      for (let en of enemies) {
        const dist = Math.hypot(en.x - d.x, en.y - d.y);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = en;
        }
      }
      const dx = nearest.x - d.x;
      const dy = nearest.y - d.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const spd = d.baseSpeed * 1.48 * w.speed * freezeFactor;
      if (dist > 38) {
        d.x += dx;
      }
      if (d.skillTimer <= 0) {
        triggerDinoSkill(d, enemies);
      }
    }
  }
})();
</script></body></html>`;

test("injects read-only snapshot and validated policy control without replacing game logic",()=>{
  const output=integrateGameHtml(fixture);
  assert.match(output,/window\.DWA_AI = Object\.freeze/);
  assert.match(output,/getSnapshot\(\)/);
  assert.match(output,/targetMode === "weakest"/);
  assert.match(output,/tactic === "aggressive"/);
  assert.match(output,/tactic === "evasive"/);
  assert.match(output,/preferredSkillId/);
  assert.match(output,/triggerDinoSkill\(d, enemies, preferredSkill\)/);
  assert.match(output,/DWA_AI_POLICIES\.set/);
});

test("rejects an unknown game source layout instead of silently producing a broken preview",()=>{
  assert.throws(()=>integrateGameHtml("<html><body>unrecognized</body></html>"),/inline script/);
});
