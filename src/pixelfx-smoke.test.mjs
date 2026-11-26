import test from "node:test";
import assert from "node:assert/strict";
import { createFrame, clearFrame, createFx, composite } from "../vendor/pixelfx/src/core/index.js";
import { PIXELFX_EFFECTS, PIXELFX_IDS } from "./pixelfx-registry.js";

test("PixelFX registry contains all 244 catalog effects", () => {
  assert.equal(PIXELFX_IDS.length,244);
  assert.equal(Object.keys(PIXELFX_EFFECTS).length,244);
});

test("every PixelFX module can update, draw and composite one frame", () => {
  for (const [id,mod] of Object.entries(PIXELFX_EFFECTS)) {
    const [w,h]=mod.meta?.size || [128,128];
    const frame=createFrame(Math.max(16,w),Math.max(16,h));
    const origin=mod.meta?.origin || [Math.floor(w/2),Math.floor(h/2)];
    const fx=createFx(mod,{x:origin[0],y:origin[1],seed:12345});
    assert.doesNotThrow(()=>{fx.update(1/60);fx.draw(frame);});
    const out=composite(frame,new Uint8ClampedArray(frame.w*frame.h*4),null);
    assert.equal(out.length,frame.w*frame.h*4,id);
    clearFrame(frame);
  }
});
