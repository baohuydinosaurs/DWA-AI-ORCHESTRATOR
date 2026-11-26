import assert from "node:assert/strict";
import { createFrame, createFx, composite } from "../vendor/pixelfx/src/core/index.js";
import { effects } from "../vendor/pixelfx/src/fx/index.js";

const ids = Object.keys(effects);
assert.equal(ids.length, 244, "Expected exactly 244 PixelFX effects");
let rendered = 0;
for (const [id, mod] of Object.entries(effects)) {
  const [w, h] = mod.meta?.size ?? [128, 96];
  const [ox, oy] = mod.meta?.origin ?? [Math.floor(w / 2), Math.floor(h / 2)];
  const frame = createFrame(w, h);
  const fx = createFx(mod, { x: ox, y: oy, seed: 20261126 });
  fx.update(1 / 60);
  fx.draw(frame);
  const rgba = new Uint8ClampedArray(w * h * 4);
  composite(frame, rgba, null);
  assert.equal(rgba.length, w * h * 4, `Bad RGBA buffer for ${id}`);
  rendered++;
}
console.log(`PixelFX smoke test passed: ${rendered}/244 effects instantiated, updated, drawn and composited.`);
