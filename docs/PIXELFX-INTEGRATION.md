# DWA PixelFX integration

- Upstream: https://github.com/patch-gg/pixelfx
- Pinned source: `vendor/pixelfx` submodule at `5294518ce7c72e48b6100a744596e0acf57f2826`
- Catalog: 244 effects across 21 categories.
- License: MIT. The upstream LICENSE and NOTICE are embedded in the generated HTML and retained in the submodule.
- Game base: `BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html`; original files remain unchanged.
- Build output: `artifacts/Dinosaur_War_Arena_PixelFX_Integrated.html`.

The PixelFX runtime and Three.js r128 runtime are bundled into one HTML file; no runtime CDN request is needed. Its 244-effect picker and mapped combat effects run in DWA's 2D canvas renderer. The existing Three.js 3D renderer and its native 3D effects remain intact; PixelFX is a 2D pixel-art effects library, not a 3D dinosaur-model library.

The CI workflow checks every effect module by importing it, advancing it, drawing one frame and compositing it, then builds and uploads the single-file HTML artifact. The Three.js MIT license is embedded alongside the PixelFX license and notices. A successful Node smoke test is not a substitute for Android/browser visual testing.

## Verified build #7 (2026-11-26)

- Commit: `cda6a4f3a126bf6615bec7cb206f14f9ace223ca`
- GitHub Actions run: https://github.com/baohuydinosaurs/DWA-AI-ORCHESTRATOR/actions/runs/45777180793
- Automated tests: 46 passed, 0 failed.
- PixelFX-specific checks: 244 registry entries; every module imported, updated, drawn and composited; runtime smoke test exercised all 244 IDs.
- Build output: 12,873,330 bytes (about 12.3 MiB).
- Artifact: `dwa-pixelfx-single-html`, ID `15096278124`, 8,756,248-byte ZIP, expires 2026-12-10.
- Artifact ZIP SHA-256: `44c0eec5e63a4938edf41f2b1506643bc09fa1625f36c1de56014970df7811a3`.

## Remaining release QA (not yet verified)

The automated tests use a Node.js fake canvas context. They do not prove that the picker is usable on a real Android browser, that touch interaction works, or that frame rate remains stable during a real battle. Before calling this release fully verified, test:

1. Open the HTML offline in Chrome Android and confirm the game initializes without CDN/network access.
2. Open and close the “PixelFX 244” picker using touch.
3. Select and play effects from all 21 categories.
4. Confirm mapped combat effects appear at the correct battle positions rather than only at the preview center.
5. Test simultaneous effects and sustained combat; measure frame rate and memory.
6. Switch between 2D and 3D repeatedly and verify neither renderer stops updating.
7. Confirm the original game controls, audio, recording and battle logic still work.

Known design limit: at most 20 PixelFX instances are kept active by the current runtime to bound memory and rendering load. PixelFX remains a 2D pixel-art effect layer; it does not replace the game's 3D models or native 3D effects.
