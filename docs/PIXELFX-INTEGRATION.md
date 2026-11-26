# DWA PixelFX integration

- Upstream: https://github.com/patch-gg/pixelfx
- Pinned source: `vendor/pixelfx` submodule at `5294518ce7c72e48b6100a744596e0acf57f2826`
- Catalog: 244 effects across 21 categories.
- License: MIT. The upstream LICENSE and NOTICE are embedded in the generated HTML and retained in the submodule.
- Game base: `BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html`; original files remain unchanged.
- Build output: `artifacts/Dinosaur_War_Arena_PixelFX_Integrated.html`.

The PixelFX runtime is bundled into one HTML file. Its 244-effect picker and mapped combat effects run in DWA's 2D canvas renderer. The existing Three.js 3D renderer and its native 3D effects remain intact; PixelFX is a 2D pixel-art effects library, not a 3D dinosaur-model library.

The CI workflow checks every effect module by importing it, advancing it, drawing one frame and compositing it, then builds and uploads the single-file HTML artifact. A successful Node smoke test is not a substitute for Android/browser visual testing.
