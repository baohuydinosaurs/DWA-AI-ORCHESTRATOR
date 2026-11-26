# DWA — 2D camera focus, dinosaur inspection, and player possession

Status: implementation specification; not yet wired into the runtime.

## 1. Camera follow
- Keep the game strictly 2D. No Three.js, WebGL, perspective camera, or 3D mode is required.
- Tap/click any living dinosaur to set it as the camera focus target.
- Follow with smooth interpolation (lerp), plus a small look-ahead based on velocity and facing direction.
- Keep zoom bounded by existing 2D camera limits. Show a follow indicator and a button to return to full-arena view.
- During player possession, camera follow is locked to the player-controlled dinosaur. On death, release follow safely.
- Do not crop the dinosaur, skill effects, or HUD overlays.

## 2. Tap-to-inspect panel
Selecting any dinosaur opens a compact live panel without pausing combat:
- Name, species/variant, team, biome/sub-biome.
- Current HP / max HP with live bar; ATK and other available base attributes.
- Five equipped active skills, with names and cooldown/ready states.
- Passive skills, if assigned.
- Positive effects: buffs, healing/regeneration, shields, biome and pack bonuses.
- Negative effects: poison, burn, bleed, freeze, weakness, oxygen loss, biome penalties, crowd-control.
- Explain environmental advantages/disadvantages in text, not only icons.
- Display only real runtime values; never fabricate missing stats or timers.

## 3. Player possession mode
- Add an explicit “Control this dinosaur” action to the inspection panel.
- Only one dinosaur can be player-controlled at a time; switching requires an explicit tap.
- Disable AI steering/target selection for that dinosaur only. Preserve combat, collision, HP, species attributes, skills, and team rules.
- Mobile: thumb joystick, attack button, and five skill buttons.
- Desktop: WASD/arrow keys, attack key, and skill hotkeys.
- Show the controlled dinosaur's live HP, skill slots, cooldowns, and a release-control button.
- Apply map bounds, biome modifiers, collision, and underwater oxygen rules exactly as for AI.
- No invulnerability or free stat boosts.
- On death, disable controls immediately, stop camera follow, and show a clear defeat state. Do not silently transfer control.

## 4. Input and accessibility
- Support touch and mouse selection using coordinates transformed through the current 2D camera, including zoom and pan.
- Use a generous mobile hit radius; resolve overlaps by choosing the closest visible living dinosaur.
- Joystick and skill buttons must not also trigger arena panning or dinosaur selection.
- Avoid per-frame DOM reconstruction.

## 5. Required tests
1. Inspect any living dinosaur before and during combat; verify identity and live values.
2. Hit testing remains correct while zoomed or panned.
3. Follow camera tracks walking, running, knockback, flying, and teleport movement smoothly.
4. Changing selection changes focus without resetting combat state.
5. Possession disables AI steering only for the controlled dinosaur; other AIs continue.
6. Touch joystick and skill buttons work without moving the arena camera.
7. Keyboard controls work and never leave movement stuck.
8. HP, cooldowns, status effects, biome modifiers, oxygen, collisions, and death remain simulation-authoritative.
9. On controlled-dinosaur death, input is disabled and camera returns to a safe overview.
10. Regression-test start/stop/reset, 2D rendering, skill VFX, and recording.

## 6. Source inspection findings
- The game already has a 2D camera (cam2D) and canvas renderer (draw2D), suitable for smooth follow.
- Existing roster objects expose id, name, species, eco, movePool, skills, maxHp, hp, atk, baseSpeed, position/velocity, alive state, and several status timers.
- Current source snippet creates four active skill slots, not five. The fifth slot must be connected to the agreed skill system, not added as a cosmetic button.
- Current source contains a 3D mode and Three.js. 2D-only conversion is a separate prerequisite and needs regression testing before removing 3D code.