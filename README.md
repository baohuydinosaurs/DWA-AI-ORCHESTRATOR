# DWA-AI-ORCHESTRATOR
# 🦖 Dinosaur War Arena (DWA)

## Project Overview
Dinosaur War Arena is a dinosaur battle simulation project featuring 2D and 3D environments, AI-controlled combatants, combat mechanics, and animations.

## Main Game Source Files
The repository currently contains these two original HTML game files:

- [BAOHUY_Dinosaur_War_Arena_Enhanced.html](./BAOHUY_Dinosaur_War_Arena_Enhanced.html)
- [BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html](./BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html)

Keep both originals unchanged. Work on separate copies when source inspection or integration begins.

## Development Goals
- Build and validate the 1 Master AI → 10 team leads → 100 worker identity orchestration structure.
- Distinguish registered worker identities from real model inference processes.
- Test AI behavior, stability, and combat performance before integration.
- Improve dinosaur movement and combat animations: walk, run, roar, attack, death, and special.
- Improve environments, visual effects, sound, and Android performance.
- Preserve and combine verified unique features from all workers, regardless of tournament rank.

## Development Rules
- Preserve existing project features whenever possible.
- Do not add dinosaur species or individuals without user-provided images and explicit approval.
- Do not impose a limit on the number of individuals per species.
- Keep the 60-minute competition rules unchanged.
- Do not use paid AI/API usage without explicit owner approval.
- Test changes before considering them complete.

## Current Status
- Both original HTML game files are present in the repository.
- The orchestration foundation, task queue, worker registry, tournament rules, and recording controller are under development.
- GitHub Actions validation run #44 completed successfully; this validates the automated Node.js test suite and Master AI plan generation, not live 100-worker inference or in-game integration.
- Real Gemini inference, gameplay integration, actual tournament recording, browser/Android testing, and a release build remain unverified.

## Key Documentation
- [Implementation status](./docs/STATUS.md)
- [Core directive](./docs/DWA-CORE-DIRECTIVE.md)
- [Real AI worker](./docs/REAL-AI-WORKER.md)
- [Tournament recording](./docs/RECORDING.md)
- [Task runner](./docs/TASK-RUNNER.md)
