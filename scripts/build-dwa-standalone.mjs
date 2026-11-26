import fs from "node:fs";
import { build } from "esbuild";

const input = "BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html";
const output = "Dinosaur_War_Arena_Standalone.html";
const source = fs.readFileSync(input, "utf8");

const result = await build({
  entryPoints: ["src/dwa-pixelfx-entry.js"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "none"
});
const bundle = result.outputFiles[0].text;
let html = source;

const threeTag = /<script\s+src=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js["']\s*><\/script>/i;
if (!threeTag.test(html)) throw new Error("Could not find the original Three.js CDN script tag.");
html = html.replace(threeTag, "");

const fxRuntime = String.raw`
  let nativePixelFx = [];
  const PIXELFX_ALIASES = {
    "chain-lightning":"lightning/chain-lightning",
    "dissolve-burn":"spawn/dissolve-burn",
    "earth-stomp":"moves/earth-stomp",
    "freeze-aura":"status/frozen",
    "heal-aoe":"holy/heal-aoe",
    "health-bar-hit":"ui/health-bar-hit",
    "heart-lost":"ui/heart-lost",
    "impact-frame":"impacts/impact-frame",
    "lightning-strike":"lightning/lightning-strike",
    "poison-cloud":"nature/poison-cloud",
    "rage-aura":"status/rage",
    "respawn-beam":"spawn/respawn-beam",
    "warp-in":"scifi/warp-in",
    "weaken-aura":"status/slowed",
    "zap-hit":"lightning/zap-hit"
  };

  function spawnNativePixelFx(type, opts = {}) {
    const lib = window.DWAPixelFX;
    if (!lib || !lib.effects) return;
    const id = PIXELFX_ALIASES[type] || Object.keys(lib.effects).find(k => k.split("/").pop() === type);
    const mod = id && lib.effects[id];
    if (!mod || !mod.meta) return;

    const size = mod.meta.size || [96, 72];
    const w = Math.max(24, Math.min(512, Math.round(size[0] || 96)));
    const h = Math.max(24, Math.min(512, Math.round(size[1] || 72)));
    const origin = mod.meta.origin || [Math.floor(w / 2), Math.floor(h / 2)];
    const ox = Math.max(0, Math.min(w, origin[0] || 0));
    const oy = Math.max(0, Math.min(h, origin[1] || 0));
    const frame = lib.createFrame(w, h);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const canvasCtx = canvas.getContext("2d", { alpha: true });
    if (!canvasCtx) return;

    const fx = lib.createFx(mod, {
      x: ox,
      y: oy,
      seed: (Math.random() * 0x7fffffff) | 0,
      ...(opts.palette ? { palette: opts.palette } : {}),
      ...(opts.light !== undefined ? { light: opts.light } : {})
    });
    const imageData = canvasCtx.createImageData(w, h);
    const item = {
      id, fx, frame, canvas, canvasCtx, imageData,
      x: Number.isFinite(opts.x) ? opts.x : 0,
      y: Number.isFinite(opts.y) ? opts.y : 0,
      originX: ox, originY: oy,
      age: 0,
      maxAge: mod.meta.loop ? Math.max(0.6, (opts.life || 90) / 60) : (mod.meta.duration || 1),
      sprite: null,
      texture: null
    };
    nativePixelFx.push(item);
    rasterizeNativePixelFx(item);
  }

  function rasterizeNativePixelFx(item) {
    const lib = window.DWAPixelFX;
    lib.clearFrame(item.frame);
    item.fx.draw(item.frame);
    lib.composite(item.frame, item.imageData.data, null);
    item.canvasCtx.putImageData(item.imageData, 0, 0);
    if (item.texture) item.texture.needsUpdate = true;
  }

  function stepNativePixelFx(dt) {
    for (let i = nativePixelFx.length - 1; i >= 0; i--) {
      const item = nativePixelFx[i];
      item.age += dt;
      item.fx.update(dt);
      if (item.fx.meta.loop && item.age >= item.maxAge) item.fx.stop();
      if (item.fx.done()) {
        if (item.sprite && scene3D) scene3D.remove(item.sprite);
        if (item.sprite && item.sprite.material) item.sprite.material.dispose();
        if (item.texture) item.texture.dispose();
        nativePixelFx.splice(i, 1);
        continue;
      }
      rasterizeNativePixelFx(item);
    }
  }

  function drawNativePixelFx() {
    if (!ctx) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const item of nativePixelFx) {
      ctx.drawImage(item.canvas, item.x - item.originX, item.y - item.originY);
    }
    ctx.restore();
  }

  function syncNativePixelFx3D() {
    if (typeof THREE === "undefined" || !scene3D) return;
    for (const item of nativePixelFx) {
      if (!item.sprite) {
        item.texture = new THREE.CanvasTexture(item.canvas);
        const material = new THREE.SpriteMaterial({
          map: item.texture,
          transparent: true,
          depthWrite: false,
          depthTest: false
        });
        item.sprite = new THREE.Sprite(material);
        item.sprite.scale.set(item.frame.w * (230 / W), item.frame.h * (165 / H), 1);
        item.sprite.renderOrder = 20;
        scene3D.add(item.sprite);
      }
      item.sprite.position.set(to3DX(item.x), 2.8, to3DZ(item.y));
      if (item.texture) item.texture.needsUpdate = true;
    }
  }
`;

const fxListMarker = "  let fxList = [];";
if (!html.includes(fxListMarker)) throw new Error("Missing fxList insertion point.");
html = html.replace(fxListMarker, fxListMarker + "\n" + fxRuntime);

const spawnPattern = /  function spawnPixelFX\(type, opts\) \{\n    fxList\.push\(\{[\s\S]*?\n    \}\);\n    if \(typeof spawn3DFX === 'function'\) \{\n      spawn3DFX\(type, opts\);\n    \}\n  \}/;
if (!spawnPattern.test(html)) throw new Error("Could not locate spawnPixelFX() safely.");
html = html.replace(spawnPattern, match => match.replace("    if (typeof spawn3DFX", "    spawnNativePixelFx(type, opts);\n    if (typeof spawn3DFX"));

for (const [needle, replacement] of [
  ["    draw2DFX();", "    draw2DFX();\n    drawNativePixelFx();"],
  ["    stepCombat(dt);", "    stepCombat(dt);\n    stepNativePixelFx(dt / 60);"],
  ["    renderer3D.render(scene3D, camera3D);", "    syncNativePixelFx3D();\n    renderer3D.render(scene3D, camera3D);"]
]) {
  if (!html.includes(needle)) throw new Error("Missing integration point: " + needle);
  html = html.replace(needle, replacement);
}

const mainMarker = "<script>\n(() => {";
if (!html.includes(mainMarker)) throw new Error("Could not find main game script marker.");
html = html.replace(mainMarker, "<script>" + bundle + "</script>\n" + mainMarker);

if (/\<script\s+src=/i.test(html)) throw new Error("Standalone HTML still contains an external script dependency.");
const inlineScripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(match => match[1]).filter(code => code.trim());
for (let i = 0; i < inlineScripts.length; i++) {
  try { new Function(inlineScripts[i]); }
  catch (error) { throw new Error(`Inline script ${i + 1} failed syntax validation: ${error.message}`); }
}
fs.writeFileSync(output, html);
console.log("Standalone HTML inline-script syntax check passed.");
console.log(JSON.stringify({
  output,
  bytes: Buffer.byteLength(html),
  pixelFxBundleBytes: Buffer.byteLength(bundle),
  effectCount: 244,
  threeJs: "bundled",
  externalScriptTags: 0
}, null, 2));
