import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { createHash } from "node:crypto";

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

const sources = new Map();

for (const relativePath of files) {
  const path = resolve(relativePath);
  const [html, info] = await Promise.all([readFile(path, "utf8"), stat(path)]);
  sources.set(relativePath, html);
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

  const threeDTerms = ["viewMode", "viewport3d", "render3D", "init3D", "THREE.", "WebGLRenderer", "camera3D", "setViewMode"];
  report.threeDReferences = Object.fromEntries(threeDTerms.map((term) => {
    const positions = [];
    let from = 0;
    while (positions.length < 12) {
      const at = html.indexOf(term, from);
      if (at < 0) break;
      positions.push(html.slice(Math.max(0, at - 180), Math.min(html.length, at + 320)));
      from = at + term.length;
    }
    return [term, { count: html.split(term).length - 1, samples: positions }];
  }));
  report.threeDUiLabels = [...html.matchAll(/<(?:button|option|label)\b[^>]*>[\s\S]{0,240}?<\/(?:button|option|label)>/gi)].map((match) => match[0]).filter((value) => /3D|3-D|WebGL|camera|perspective/i.test(value)).slice(0, 30);
  const integrationHooks = [
    "createDinosaurRoster",
    "stepCombat",
    "triggerDinoSkill",
    "startMatch",
    "stopMatch",
    "mainLoop",
    "draw2D",
    "render3D",
    "init3D"
  ];
  report.inlineScriptTail = html.slice(html.lastIndexOf("</script>") - 2400, html.lastIndexOf("</script>"));
  report.integrationSnippets = Object.fromEntries(integrationHooks.map((name) => {
    const pattern = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`);
    const match = pattern.exec(html);
    const snippetLength = name === "stepCombat" ? 4200 : name === "createDinosaurRoster" ? 2400 : name === "triggerDinoSkill" ? 1800 : 900;
    return [name, match ? html.slice(match.index, match.index + snippetLength) : null];
  }));
  console.log(JSON.stringify(report, null, 2));
}

const [leftName, rightName] = files;
const left = sources.get(leftName);
const right = sources.get(rightName);
let firstDifference = 0;
while (firstDifference < Math.min(left.length, right.length) && left[firstDifference] === right[firstDifference]) {
  firstDifference += 1;
}
let suffixLength = 0;
while (
  suffixLength < left.length - firstDifference &&
  suffixLength < right.length - firstDifference &&
  left[left.length - 1 - suffixLength] === right[right.length - 1 - suffixLength]
) {
  suffixLength += 1;
}
let changedRanges = 0;
let inDifference = false;
const firstRanges = [];
const scanLength = Math.max(left.length, right.length);
for (let index = firstDifference; index < scanLength - suffixLength; index += 1) {
  const differs = left[index] !== right[index];
  if (differs && !inDifference) {
    changedRanges += 1;
    if (firstRanges.length < 8) firstRanges.push(index);
  }
  inDifference = differs;
}
console.log(JSON.stringify({
  comparison: [leftName, rightName],
  identical: left === right,
  sha256: {
    [leftName]: createHash("sha256").update(left).digest("hex"),
    [rightName]: createHash("sha256").update(right).digest("hex")
  },
  firstDifferenceIndex: firstDifference,
  commonPrefixCharacters: firstDifference,
  commonSuffixCharacters: suffixLength,
  changedRanges,
  firstChangedOffsets: firstRanges,
  contextAtFirstDifference: {
    [leftName]: left.slice(Math.max(0, firstDifference - 180), firstDifference + 320),
    [rightName]: right.slice(Math.max(0, firstDifference - 180), firstDifference + 320)
  }
}, null, 2));
