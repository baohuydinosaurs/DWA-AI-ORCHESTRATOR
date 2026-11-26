import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

const files = [
  "BAOHUY_Dinosaur_War_Arena_Enhanced.html",
  "BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html"
];

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function collect(source, pattern, limit = 20) {
  return [...source.matchAll(pattern)]
    .map((match) => match[1] ?? match[0])
    .filter(Boolean)
    .slice(0, limit);
}

for (const relativePath of files) {
  const path = resolve(relativePath);
  const [html, info] = await Promise.all([readFile(path, "utf8"), stat(path)]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  const scripts = collect(html, /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, 40);
  const stylesheets = collect(html, /<link\b[^>]*\bhref=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/gi, 40);
  const ids = collect(html, /\bid=["']([^"']+)["']/gi, 80);
  const classes = collect(html, /\bclass=["']([^"']+)["']/gi, 40);
  const functionNames = collect(html, /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g, 80);
  const classNames = collect(html, /\bclass\s+([A-Za-z_$][\w$]*)\b/g, 80);
  const report = {
    file: basename(path),
    bytes: info.size,
    lineCount: html.split("\n").length,
    title,
    hasDoctype: /<!doctype\s+html/i.test(html),
    canvasCount: countMatches(html, /<canvas\b/gi),
    scriptTagCount: countMatches(html, /<script\b/gi),
    inlineScriptCount: countMatches(html, /<script\b(?![^>]*\bsrc=)/gi),
    externalScriptCount: scripts.length,
    externalScripts: scripts,
    stylesheetCount: countMatches(html, /<link\b[^>]*\brel=["']stylesheet["']/gi),
    stylesheetHrefs: stylesheets,
    hasThreeJs: /\bTHREE\b|three\.module|three\.min\.js/i.test(html),
    hasWebGL: /WebGLRenderingContext|webgl2?|getContext\(["']webgl/i.test(html),
    hasBabylon: /BABYLON|babylon(?:\.max)?\.js/i.test(html),
    hasPhaser: /\bPhaser\b|phaser\.min\.js/i.test(html),
    hasMediaRecorder: /MediaRecorder/.test(html),
    hasCanvasCaptureStream: /captureStream/.test(html),
    hasRequestAnimationFrame: /requestAnimationFrame/.test(html),
    hasLocalStorage: /localStorage/.test(html),
    hasIndexedDB: /indexedDB/.test(html),
    hasWebAudio: /AudioContext|webkitAudioContext/.test(html),
    ids,
    classAttributes: classes,
    functionNames,
    classNames
  };
  console.log(JSON.stringify(report, null, 2));
}
