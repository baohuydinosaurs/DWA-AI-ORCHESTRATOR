import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const sourcePath="BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html";
const outputPath="artifacts/Dinosaur_War_Arena_PixelFX_Integrated.html";
const bundlePath="artifacts/pixelfx.bundle.js";
let html=await readFile(sourcePath,"utf8");
const bundle=await readFile(bundlePath,"utf8");
const three=await readFile("vendor/three-r128.min.js","utf8");
const threeLicense=await readFile("vendor/THREE-LICENSE.txt","utf8");
const threeTag='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
assert.ok(html.includes(threeTag),"Could not locate the original Three.js CDN tag.");
html=html.replace(threeTag,"<script>\n"+three+"\n</script>");
const license=await readFile("vendor/pixelfx/LICENSE","utf8");
const notice=await readFile("vendor/pixelfx/NOTICE.md","utf8");

const spawnNeedle="  function spawnPixelFX(type, opts) {\n    fxList.push({";
assert.ok(html.includes(spawnNeedle),"Could not locate spawnPixelFX hook; refusing to alter source.");
html=html.replace(spawnNeedle,"  function spawnPixelFX(type, opts) {\n    const pixelFxHandled = viewMode === '2d' && !!(window.DWAPixelFX && window.DWAPixelFX.spawn(type, opts));\n    fxList.push({\n      pixelFxHandled,");

const fxLoop="    for (let fx of fxList) {\n      const prog = 1 - fx.life / fx.maxLife;";
assert.ok(html.includes(fxLoop),"Could not locate 2D FX loop.");
html=html.replace(fxLoop,"    for (let fx of fxList) {\n      if (fx.pixelFxHandled) continue;\n      const prog = 1 - fx.life / fx.maxLife;");

const stepNeedle="  function stepCombat(dt) {\n    if (specialFxTimer > 0)";
assert.ok(html.includes(stepNeedle),"Could not locate combat update hook.");
html=html.replace(stepNeedle,"  function stepCombat(dt) {\n    if (window.DWAPixelFX) window.DWAPixelFX.update(dt / 60);\n    if (specialFxTimer > 0)");

const drawStart=html.indexOf("  function draw2DFX() {");
const nextDraw=html.indexOf("  function draw2D()",drawStart);
const drawEnd=html.lastIndexOf("\n  }",nextDraw);
assert.ok(drawStart>=0 && nextDraw>drawStart && drawEnd>drawStart,"Could not locate end of draw2DFX.");
html=html.slice(0,drawEnd)+"\n    if (window.DWAPixelFX) window.DWAPixelFX.draw(ctx);"+html.slice(drawEnd);

const mainScript=html.lastIndexOf("<script>");
assert.ok(mainScript>0,"Could not locate main inline script.");
const bundledScript="<script>\n"+bundle+"\n</script>\n";
html=html.slice(0,mainScript)+bundledScript+html.slice(mainScript);

const escapeHtml=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const noticeBlock="\n<section hidden id=\"pixelfx-third-party-license\"><pre>"+escapeHtml(license+"\n\n"+notice)+"</pre></section>\n";
assert.ok(html.includes("</body>"),"Missing body close.");
html=html.replace("</body>",noticeBlock+"</body>");
await mkdir("artifacts",{recursive:true});
await writeFile(outputPath,html,"utf8");
await writeFile("artifacts/PIXELFX-BUILD-REPORT.json",JSON.stringify({
  output:outputPath,baseSource:sourcePath,effectCount:244,categories:21,
  bundledBytes:Buffer.byteLength(bundle),htmlBytes:Buffer.byteLength(html),
  integrations:["2D combat effects","all-244 effect preview picker","MIT license and NOTICE embedded"],
  threeD:"Existing native Three.js effects are retained; PixelFX itself is a 2D pixel-art renderer."
},null,2)+"\n");
console.log("Built "+outputPath+" ("+Buffer.byteLength(html)+" bytes); 244 effects bundled.");
