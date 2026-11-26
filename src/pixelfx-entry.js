import { createFrame, clearFrame, createFx, composite } from "../vendor/pixelfx/src/core/index.js";
import { PIXELFX_EFFECTS, PIXELFX_IDS } from "./pixelfx-registry.js";

const SCALE = 1;
const MAX_ACTIVE = 20;
const active = [];
const shortIndex = new Map();
for (const id of PIXELFX_IDS) {
  const short = id.split("/").at(-1);
  if (!shortIndex.has(short)) shortIndex.set(short, id);
}
const aliases = Object.freeze({
  "fireball-throw": "moves/fireball-throw",
  "meteor-call": "moves/meteor-call",
  "fire-tornado": "fire/fire-tornado",
  "big-explosion": "explosions/big-explosion",
  "nuke": "explosions/nuke",
  "ground-pound": "moves/ground-pound",
  "earth-stomp": "moves/earth-stomp",
  "dirt-explosion": "explosions/dirt-explosion",
  "waterfall": "water/waterfall",
  "wave-crash": "water/wave-crash",
  "ice-lance-throw": "moves/ice-lance-throw",
  "frost-nova": "ice/frost-nova",
  "ice-spikes": "ice/ice-spikes",
  "blizzard-vortex": "ice/blizzard-vortex",
  "lightning-call": "moves/lightning-call",
  "chain-lightning": "lightning/chain-lightning",
  "zap-hit": "lightning/zap-hit",
  "thunderclap": "lightning/thunderclap",
  "holy-smite": "moves/holy-smite",
  "heal-aoe": "holy/heal-aoe",
  "heal": "holy/heal",
  "dissolve-burn": "spawn/dissolve-burn",
  "health-bar-hit": "ui/health-bar-hit",
  "heart-lost": "ui/heart-lost",
  "impact-frame": "impacts/impact-frame"
});

function resolveId(type) {
  if (PIXELFX_EFFECTS[type]) return type;
  if (aliases[type]) return aliases[type];
  return shortIndex.get(type) || null;
}
function shade(hex, factor) {
  const raw = String(hex || "#ffd36a").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return "#ffd36a";
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * factor)));
  return "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
}
function paletteFor(color) {
  if (!color) return undefined;
  return [shade(color,.22), shade(color,.48), color, shade(color,1.28), "#ffffff"];
}
function play(idOrType, options = {}) {
  const id = resolveId(idOrType);
  const mod = id && PIXELFX_EFFECTS[id];
  if (!mod) return false;
  const [mw,mh] = mod.meta?.size || [128,128];
  const width = Math.max(16, Math.min(512, Math.round(mw)));
  const height = Math.max(16, Math.min(384, Math.round(mh)));
  const origin = mod.meta?.origin || [Math.round(width/2),Math.round(height/2)];
  const frame = createFrame(width,height);
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const outCtx = canvas.getContext("2d",{alpha:true});
  if (!outCtx) return false;
  const pixels = new Uint8ClampedArray(width*height*4);
  const imageData = new ImageData(pixels,width,height);
  const x = Number.isFinite(options.x) ? options.x : 1200;
  const y = Number.isFinite(options.y) ? options.y : 700;
  const fxOptions = {
    x: origin[0], y: origin[1],
    seed: Math.floor(Math.random()*2147483646)+1,
    flip: options.flip ?? (Number.isFinite(options.tx) && options.tx < x),
    angle: options.angle || 0
  };
  const customPalette = paletteFor(options.color);
  if (customPalette) fxOptions.palette = customPalette;
  const instance = createFx(mod,fxOptions);
  const maxLife = Number.isFinite(options.life) ? Math.max(.25,options.life/60) : 2.4;
  active.push({id,fx:instance,frame,canvas,outCtx,pixels,imageData,x,y,originX:origin[0],originY:origin[1],age:0,maxLife,loop:!!mod.meta?.loop});
  while(active.length>MAX_ACTIVE) { active[0].fx.stop(); active.shift(); }
  return true;
}
function update(dt) {
  const step = Math.max(0,Math.min(.05,Number(dt)||0));
  for (let i=active.length-1;i>=0;i--) {
    const item=active[i];
    item.age+=step;
    item.fx.update(step);
    if(item.loop && item.age>=item.maxLife) item.fx.stop();
    if(item.fx.done()) active.splice(i,1);
  }
}
function draw(ctx) {
  if(!ctx || !active.length) return;
  const smoothing=ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled=false;
  for(const item of active) {
    clearFrame(item.frame);
    item.fx.draw(item.frame);
    composite(item.frame,item.pixels,null);
    item.outCtx.putImageData(item.imageData,0,0);
    ctx.drawImage(item.canvas,item.x-item.originX,item.y-item.originY);
  }
  ctx.imageSmoothingEnabled=smoothing;
}
function mountPicker() {
  const host=document.getElementById("arenaViewport");
  if(!host || document.getElementById("dwaPixelFxRoot")) return;
  const root=document.createElement("div");
  root.id="dwaPixelFxRoot";
  root.style.cssText="position:absolute;z-index:80;right:10px;top:10px;font:11px system-ui,sans-serif;pointer-events:auto";
  const toggle=document.createElement("button");
  toggle.type="button"; toggle.textContent="✨ PixelFX 244";
  toggle.style.cssText="border:1px solid #67e8f9;border-radius:7px;padding:6px 9px;background:rgba(5,20,32,.94);color:#e0f2fe;font-weight:800;box-shadow:0 0 12px #22d3ee55";
  const panel=document.createElement("div");
  panel.style.cssText="display:none;width:min(270px,72vw);margin-top:6px;padding:8px;border:1px solid #38bdf8;border-radius:9px;background:rgba(3,10,18,.96);box-shadow:0 8px 26px #0009";
  const select=document.createElement("select");
  select.style.cssText="width:100%;padding:7px;background:#102033;color:#e5f3ff;border:1px solid #38536a;border-radius:6px";
  const categories=new Map();
  for(const id of PIXELFX_IDS){const [cat,name]=id.split("/");if(!categories.has(cat))categories.set(cat,[]);categories.get(cat).push({id,name});}
  for(const [cat,items] of categories){const group=document.createElement("optgroup");group.label=cat+" ("+items.length+")";for(const item of items){const opt=document.createElement("option");opt.value=item.id;opt.textContent=item.name.replaceAll("-"," ");group.appendChild(opt);}select.appendChild(group);}
  const playButton=document.createElement("button");
  playButton.type="button";playButton.textContent="▶ Xem hiệu ứng ở giữa đấu trường";
  playButton.style.cssText="width:100%;margin-top:7px;padding:7px;border:1px solid #34d399;border-radius:6px;background:#064e3b;color:#ecfdf5;font-weight:800";
  const note=document.createElement("div");
  note.textContent="Thư viện 244 hiệu ứng pixel-art · chế độ 2D";
  note.style.cssText="margin-top:6px;color:#94a3b8;font-size:10px";
  toggle.addEventListener("click",()=>{panel.style.display=panel.style.display==="none"?"block":"none";});
  playButton.addEventListener("click",()=>{play(select.value,{x:1200,y:700,life:150});});
  panel.append(select,playButton,note);root.append(toggle,panel);host.appendChild(root);
}
const api=Object.freeze({spawn:(type,opts)=>play(type,opts||{}),play,list:()=>PIXELFX_IDS.slice(),update,draw,get activeCount(){return active.length;}});
window.DWAPixelFX=api;
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mountPicker,{once:true}); else mountPicker();
