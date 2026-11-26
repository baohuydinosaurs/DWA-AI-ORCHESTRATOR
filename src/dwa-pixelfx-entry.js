import * as THREE from "three";
import * as PixelFXCore from "../vendor/pixelfx/src/core/index.js";
import { effects, categories } from "../vendor/pixelfx/src/fx/index.js";

// Keep the existing Dinosaur War Arena renderer compatible while bundling Three.js locally.
globalThis.THREE = THREE;
globalThis.DWAPixelFX = Object.freeze({
  ...PixelFXCore,
  effects,
  categories,
  version: "0.3.1",
  effectCount: Object.keys(effects).length
});
