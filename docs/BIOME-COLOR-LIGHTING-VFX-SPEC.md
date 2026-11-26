# DWA — Biome color, lighting, and environmental VFX art direction

Status: approved design specification; visual implementation and in-game verification are pending.

## Visual target
- Every biome must have a recognizable dominant hue, supporting colors, readable silhouettes, and its own atmospheric effects.
- Use bright, natural, directional lighting that reveals terrain texture, dinosaur anatomy, foliage, water, rocks, and particles. Avoid muddy grey/brown grading and avoid overexposed whites.
- Keep colors vivid but physically coherent: sky/water/foliage/sand/ice/lava should read as distinct materials.
- Use layered 2D parallax backgrounds, foreground silhouettes, terrain details, ambient particles, and biome-specific light overlays.
- Lighting and VFX must not obscure dinosaurs, HP bars, skill indicators, or combat readability.
- Palette colors are art-direction targets, not hard-coded final pixel values; tune for display contrast and color accessibility.

## Biome palettes and signature effects

### 1. Tropical ocean / deep ocean
- Dominant: clear sky blue, turquoise, deep marine blue.
- Supporting: aqua, teal, seafoam, coral orange/pink, pale sand, white sun glints.
- Scene: bright sky horizon at the surface; underwater layers shift from turquoise near the surface to deep navy at depth; visible seabed, reefs, rocks, aquatic plants, bubbles, caustic light.
- Effects: animated caustics, refracted sun shafts, bubbles, drifting plankton, gentle current ribbons, splash rings at the surface.
- Deep zones: controlled dark blue gradient with readable silhouettes and bioluminescent accents; never make the arena uniformly black.

### 2. Lush forest / nature
- Dominant: vivid leaf green with clear sky blue.
- Supporting: emerald, lime, moss, fern green, warm sunlight gold, flower colors, bark brown.
- Scene: layered trees, canopy gaps, ferns, vines, flowers, grass, fallen logs, sunlit clearings.
- Effects: moving leaf shadows, floating pollen, fireflies, god rays through canopy, subtle wind in foliage.

### 3. Desert / dunes
- Dominant: golden sand and warm yellow.
- Supporting: amber, ochre, burnt orange, pale cream, turquoise sky, distant mauve rock.
- Scene: dune ridges, cracked earth, sandstone formations, dry shrubs, scattered bones/rocks, heat-haze horizon.
- Effects: drifting sand grains, wind streaks, mirage shimmer, dust bursts on heavy footsteps, long warm shadows.

### 4. Swamp / marsh
- Dominant: rich green and blue-green.
- Supporting: olive, jade, dark teal water, muted yellow-green, occasional bioluminescent cyan.
- Scene: shallow pools, reeds, mangrove roots, mossy trunks, lily pads, wet mud, mist pockets.
- Effects: water ripples, bubbles, insects, low drifting fog, spores and small glowing marsh lights.
- Keep the floor and dinosaur feet readable despite mist and dark water.

### 5. Prehistoric plains
- Dominant: fresh grass green and open sky blue.
- Supporting: straw yellow, wildflower colors, warm earth, distant blue-grey mountains.
- Scene: broad grasslands, ferns, cycads, distant tree lines, rocky outcrops, layered mountains.
- Effects: wind waves through grass, seed fluff, drifting clouds, dust from herds and impacts.

### 6. Volcanic badlands
- Dominant: charcoal rock contrasted with molten orange and lava red.
- Supporting: ember yellow, dark burgundy, smoke grey, small mineral highlights.
- Scene: basalt columns, lava channels, scorched ground, volcanic vents, distant volcano silhouette.
- Effects: rising embers, heat distortion, lava glow lighting nearby surfaces, ash fall, smoke plumes.
- Preserve strong contrast; lava glow is localized and must not tint the whole screen red.

### 7. Arctic / glacial
- Dominant: ice blue and snow white.
- Supporting: cyan, deep glacier blue, slate, aurora green/violet.
- Scene: snowfields, ice cliffs, frozen pools, snow-laden rocks, distant glaciers.
- Effects: windblown snow, frost motes, breath vapor, ice sparkle, aurora bands in the sky.

### 8. Crystal cavern
- Dominant: luminous cyan and violet.
- Supporting: sapphire, amethyst, pale lavender, mineral white, restrained magenta.
- Scene: faceted crystal clusters, reflective mineral walls, underground pools, layered cave depth.
- Effects: refracted light beams, crystal glints, floating motes, subtle pulse from crystal veins.

### 9. Ancient ruins / overgrown temple
- Dominant: weathered stone grey with emerald foliage and warm gold light.
- Supporting: turquoise inlays, moss, sandstone, muted crimson banners.
- Scene: broken pillars, carved platforms, roots, vines, ancient stone paths, overgrown statues.
- Effects: drifting dust, shafts of light, falling leaves, faint glyph glows.

### 10. Bioluminescent night forest
- Dominant: midnight blue and teal, contrasted with vivid cyan/green glow.
- Supporting: violet, soft pink fungi, moonlit silver, deep forest green.
- Scene: dark but readable forest layers, glowing fungi, luminous plants, reflective puddles.
- Effects: fireflies, spores, pulsing fungi, moonbeams, gentle fog.

## Lighting pipeline for 2D
1. Base biome background and parallax layers.
2. Terrain material colors and local highlights.
3. Directional daylight or biome-specific key light.
4. Soft ambient fill and contact shadows under dinosaurs/objects.
5. Local emissive glows for lava, crystals, bioluminescence, and skills.
6. Weather/air particles and foreground layers.
7. Final color grading kept subtle so species colors remain accurate.

## Readability and performance constraints
- Render the biome as 2D canvas layers; do not reintroduce 3D/WebGL as part of this art direction.
- Use deterministic particle budgets and object pooling; cap particle counts on mobile and scale down gracefully under load.
- Keep foreground effects behind or around combatants; never cover the selected dinosaur or the player's controls.
- Ensure HP/skill HUD contrast against every palette using a stable backing/outline rather than changing HUD colors per biome.
- Provide reduced-particles / reduced-flashes accessibility mode; avoid rapid full-screen flashing.
- Keep biome colors consistent between arena, minimap, inspection panel biome label, and round summary.

## Acceptance checks
1. Every biome is visually distinguishable at a glance from its dominant palette.
2. Sky blue, sea blue, leaf green, and golden sand are clearly represented in the relevant environments.
3. Light reveals terrain and dinosaur sprites without washing out their colors.
4. Each biome has its own ambient VFX and material cues.
5. Combatants, skill VFX, HP bars, and touch controls remain readable.
6. Mobile frame time remains stable with particle caps and pooling.
7. Reduced-effects mode lowers particle/flash load without removing essential gameplay feedback.