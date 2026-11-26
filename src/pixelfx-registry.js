// Generated from patch-gg/pixelfx. Do not hand-edit this file.
import * as fx000 from "../vendor/pixelfx/src/fx/arcane/arcane-beam.js";
import * as fx001 from "../vendor/pixelfx/src/fx/arcane/arcane-missiles.js";
import * as fx002 from "../vendor/pixelfx/src/fx/arcane/arcane-orb.js";
import * as fx003 from "../vendor/pixelfx/src/fx/arcane/blink-in.js";
import * as fx004 from "../vendor/pixelfx/src/fx/arcane/blink-out.js";
import * as fx005 from "../vendor/pixelfx/src/fx/arcane/magic-circle-cast.js";
import * as fx006 from "../vendor/pixelfx/src/fx/arcane/mana-burst.js";
import * as fx007 from "../vendor/pixelfx/src/fx/arcane/portal.js";
import * as fx008 from "../vendor/pixelfx/src/fx/arcane/rune-circle.js";
import * as fx009 from "../vendor/pixelfx/src/fx/arcane/spell-charge.js";
import * as fx010 from "../vendor/pixelfx/src/fx/arcane/star-fall.js";
import * as fx011 from "../vendor/pixelfx/src/fx/arcane/time-stop.js";
import * as fx012 from "../vendor/pixelfx/src/fx/critters/bat.js";
import * as fx013 from "../vendor/pixelfx/src/fx/critters/bird.js";
import * as fx014 from "../vendor/pixelfx/src/fx/critters/butterfly.js";
import * as fx015 from "../vendor/pixelfx/src/fx/critters/eyeball.js";
import * as fx016 from "../vendor/pixelfx/src/fx/critters/fish-school.js";
import * as fx017 from "../vendor/pixelfx/src/fx/critters/flying-skull.js";
import * as fx018 from "../vendor/pixelfx/src/fx/critters/frog.js";
import * as fx019 from "../vendor/pixelfx/src/fx/critters/ghost.js";
import * as fx020 from "../vendor/pixelfx/src/fx/critters/jellyfish.js";
import * as fx021 from "../vendor/pixelfx/src/fx/critters/slime.js";
import * as fx022 from "../vendor/pixelfx/src/fx/critters/snake.js";
import * as fx023 from "../vendor/pixelfx/src/fx/critters/wisp.js";
import * as fx024 from "../vendor/pixelfx/src/fx/explosions/barrel-explosion.js";
import * as fx025 from "../vendor/pixelfx/src/fx/explosions/big-explosion.js";
import * as fx026 from "../vendor/pixelfx/src/fx/explosions/cartoon-pow.js";
import * as fx027 from "../vendor/pixelfx/src/fx/explosions/dirt-explosion.js";
import * as fx028 from "../vendor/pixelfx/src/fx/explosions/firework-burst.js";
import * as fx029 from "../vendor/pixelfx/src/fx/explosions/firework-rocket.js";
import * as fx030 from "../vendor/pixelfx/src/fx/explosions/grenade.js";
import * as fx031 from "../vendor/pixelfx/src/fx/explosions/implosion.js";
import * as fx032 from "../vendor/pixelfx/src/fx/explosions/nuke.js";
import * as fx033 from "../vendor/pixelfx/src/fx/explosions/plasma-explosion.js";
import * as fx034 from "../vendor/pixelfx/src/fx/explosions/small-explosion.js";
import * as fx035 from "../vendor/pixelfx/src/fx/explosions/smoke-bomb.js";
import * as fx036 from "../vendor/pixelfx/src/fx/fire/brazier.js";
import * as fx037 from "../vendor/pixelfx/src/fx/fire/campfire.js";
import * as fx038 from "../vendor/pixelfx/src/fx/fire/candle.js";
import * as fx039 from "../vendor/pixelfx/src/fx/fire/fire-breath.js";
import * as fx040 from "../vendor/pixelfx/src/fx/fire/fire-ring.js";
import * as fx041 from "../vendor/pixelfx/src/fx/fire/fire-tornado.js";
import * as fx042 from "../vendor/pixelfx/src/fx/fire/fireball.js";
import * as fx043 from "../vendor/pixelfx/src/fx/fire/flame-pillar.js";
import * as fx044 from "../vendor/pixelfx/src/fx/fire/flamethrower.js";
import * as fx045 from "../vendor/pixelfx/src/fx/fire/meteor.js";
import * as fx046 from "../vendor/pixelfx/src/fx/fire/spirit-flame.js";
import * as fx047 from "../vendor/pixelfx/src/fx/fire/torch.js";
import * as fx048 from "../vendor/pixelfx/src/fx/holy/blessing.js";
import * as fx049 from "../vendor/pixelfx/src/fx/holy/divine-shield.js";
import * as fx050 from "../vendor/pixelfx/src/fx/holy/feather-burst.js";
import * as fx051 from "../vendor/pixelfx/src/fx/holy/halo.js";
import * as fx052 from "../vendor/pixelfx/src/fx/holy/heal-aoe.js";
import * as fx053 from "../vendor/pixelfx/src/fx/holy/heal.js";
import * as fx054 from "../vendor/pixelfx/src/fx/holy/holy-pillar.js";
import * as fx055 from "../vendor/pixelfx/src/fx/holy/resurrection.js";
import * as fx056 from "../vendor/pixelfx/src/fx/holy/smite.js";
import * as fx057 from "../vendor/pixelfx/src/fx/holy/sunburst.js";
import * as fx058 from "../vendor/pixelfx/src/fx/ice/blizzard-vortex.js";
import * as fx059 from "../vendor/pixelfx/src/fx/ice/freeze.js";
import * as fx060 from "../vendor/pixelfx/src/fx/ice/frost-breath.js";
import * as fx061 from "../vendor/pixelfx/src/fx/ice/frost-nova.js";
import * as fx062 from "../vendor/pixelfx/src/fx/ice/ice-crystal.js";
import * as fx063 from "../vendor/pixelfx/src/fx/ice/ice-lance.js";
import * as fx064 from "../vendor/pixelfx/src/fx/ice/ice-shatter.js";
import * as fx065 from "../vendor/pixelfx/src/fx/ice/ice-spikes.js";
import * as fx066 from "../vendor/pixelfx/src/fx/ice/icicle-fall.js";
import * as fx067 from "../vendor/pixelfx/src/fx/ice/snowflake-burst.js";
import * as fx068 from "../vendor/pixelfx/src/fx/impacts/blunt-hit.js";
import * as fx069 from "../vendor/pixelfx/src/fx/impacts/bullet-impact.js";
import * as fx070 from "../vendor/pixelfx/src/fx/impacts/crit-hit.js";
import * as fx071 from "../vendor/pixelfx/src/fx/impacts/ground-slam.js";
import * as fx072 from "../vendor/pixelfx/src/fx/impacts/heavy-landing.js";
import * as fx073 from "../vendor/pixelfx/src/fx/impacts/hit-flash.js";
import * as fx074 from "../vendor/pixelfx/src/fx/impacts/hit-spark.js";
import * as fx075 from "../vendor/pixelfx/src/fx/impacts/impact-frame.js";
import * as fx076 from "../vendor/pixelfx/src/fx/impacts/parry.js";
import * as fx077 from "../vendor/pixelfx/src/fx/impacts/ricochet.js";
import * as fx078 from "../vendor/pixelfx/src/fx/impacts/shield-block.js";
import * as fx079 from "../vendor/pixelfx/src/fx/lightning/ball-lightning.js";
import * as fx080 from "../vendor/pixelfx/src/fx/lightning/chain-lightning.js";
import * as fx081 from "../vendor/pixelfx/src/fx/lightning/charge-up.js";
import * as fx082 from "../vendor/pixelfx/src/fx/lightning/electrified.js";
import * as fx083 from "../vendor/pixelfx/src/fx/lightning/lightning-strike.js";
import * as fx084 from "../vendor/pixelfx/src/fx/lightning/plasma-ball.js";
import * as fx085 from "../vendor/pixelfx/src/fx/lightning/spark-arc.js";
import * as fx086 from "../vendor/pixelfx/src/fx/lightning/storm-cloud.js";
import * as fx087 from "../vendor/pixelfx/src/fx/lightning/tesla-coil.js";
import * as fx088 from "../vendor/pixelfx/src/fx/lightning/thunderclap.js";
import * as fx089 from "../vendor/pixelfx/src/fx/lightning/zap-hit.js";
import * as fx090 from "../vendor/pixelfx/src/fx/melee/claw-swipe.js";
import * as fx091 from "../vendor/pixelfx/src/fx/melee/dagger-flurry.js";
import * as fx092 from "../vendor/pixelfx/src/fx/melee/double-slash.js";
import * as fx093 from "../vendor/pixelfx/src/fx/melee/hammer-smash.js";
import * as fx094 from "../vendor/pixelfx/src/fx/melee/heavy-cleave.js";
import * as fx095 from "../vendor/pixelfx/src/fx/melee/scythe-reap.js";
import * as fx096 from "../vendor/pixelfx/src/fx/melee/spear-sweep.js";
import * as fx097 from "../vendor/pixelfx/src/fx/melee/spin-slash.js";
import * as fx098 from "../vendor/pixelfx/src/fx/melee/sword-slash.js";
import * as fx099 from "../vendor/pixelfx/src/fx/melee/thrust.js";
import * as fx100 from "../vendor/pixelfx/src/fx/melee/uppercut.js";
import * as fx101 from "../vendor/pixelfx/src/fx/melee/whip-crack.js";
import * as fx102 from "../vendor/pixelfx/src/fx/moves/arrow-shot.js";
import * as fx103 from "../vendor/pixelfx/src/fx/moves/dash-strike.js";
import * as fx104 from "../vendor/pixelfx/src/fx/moves/earth-stomp.js";
import * as fx105 from "../vendor/pixelfx/src/fx/moves/fireball-throw.js";
import * as fx106 from "../vendor/pixelfx/src/fx/moves/ground-pound.js";
import * as fx107 from "../vendor/pixelfx/src/fx/moves/holy-smite.js";
import * as fx108 from "../vendor/pixelfx/src/fx/moves/ice-lance-throw.js";
import * as fx109 from "../vendor/pixelfx/src/fx/moves/lightning-call.js";
import * as fx110 from "../vendor/pixelfx/src/fx/moves/meteor-call.js";
import * as fx111 from "../vendor/pixelfx/src/fx/moves/pistol-shots.js";
import * as fx112 from "../vendor/pixelfx/src/fx/moves/rocket-launcher.js";
import * as fx113 from "../vendor/pixelfx/src/fx/moves/sword-combo.js";
import * as fx114 from "../vendor/pixelfx/src/fx/nature/acid-splash.js";
import * as fx115 from "../vendor/pixelfx/src/fx/nature/boulder.js";
import * as fx116 from "../vendor/pixelfx/src/fx/nature/earth-spike.js";
import * as fx117 from "../vendor/pixelfx/src/fx/nature/healing-bloom.js";
import * as fx118 from "../vendor/pixelfx/src/fx/nature/leaf-storm.js";
import * as fx119 from "../vendor/pixelfx/src/fx/nature/poison-cloud.js";
import * as fx120 from "../vendor/pixelfx/src/fx/nature/quake.js";
import * as fx121 from "../vendor/pixelfx/src/fx/nature/root-snare.js";
import * as fx122 from "../vendor/pixelfx/src/fx/nature/spore-burst.js";
import * as fx123 from "../vendor/pixelfx/src/fx/nature/thorns.js";
import * as fx124 from "../vendor/pixelfx/src/fx/nature/tornado.js";
import * as fx125 from "../vendor/pixelfx/src/fx/nature/toxic-puddle.js";
import * as fx126 from "../vendor/pixelfx/src/fx/nature/vine-whip.js";
import * as fx127 from "../vendor/pixelfx/src/fx/pickups/chest-open.js";
import * as fx128 from "../vendor/pixelfx/src/fx/pickups/coin-spin.js";
import * as fx129 from "../vendor/pixelfx/src/fx/pickups/collect-burst.js";
import * as fx130 from "../vendor/pixelfx/src/fx/pickups/crystal-shard.js";
import * as fx131 from "../vendor/pixelfx/src/fx/pickups/gem-spin.js";
import * as fx132 from "../vendor/pixelfx/src/fx/pickups/heart-pickup.js";
import * as fx133 from "../vendor/pixelfx/src/fx/pickups/key-glint.js";
import * as fx134 from "../vendor/pixelfx/src/fx/pickups/loot-beam.js";
import * as fx135 from "../vendor/pixelfx/src/fx/pickups/potion.js";
import * as fx136 from "../vendor/pixelfx/src/fx/pickups/power-star.js";
import * as fx137 from "../vendor/pixelfx/src/fx/pickups/xp-orb.js";
import * as fx138 from "../vendor/pixelfx/src/fx/projectiles/arrow.js";
import * as fx139 from "../vendor/pixelfx/src/fx/projectiles/bullet-tracer.js";
import * as fx140 from "../vendor/pixelfx/src/fx/projectiles/cannonball.js";
import * as fx141 from "../vendor/pixelfx/src/fx/projectiles/energy-disc.js";
import * as fx142 from "../vendor/pixelfx/src/fx/projectiles/flare.js";
import * as fx143 from "../vendor/pixelfx/src/fx/projectiles/homing-missile.js";
import * as fx144 from "../vendor/pixelfx/src/fx/projectiles/laser-bolt.js";
import * as fx145 from "../vendor/pixelfx/src/fx/projectiles/magic-missile.js";
import * as fx146 from "../vendor/pixelfx/src/fx/projectiles/muzzle-pistol.js";
import * as fx147 from "../vendor/pixelfx/src/fx/projectiles/muzzle-shotgun.js";
import * as fx148 from "../vendor/pixelfx/src/fx/projectiles/muzzle-smg.js";
import * as fx149 from "../vendor/pixelfx/src/fx/projectiles/plasma-shot.js";
import * as fx150 from "../vendor/pixelfx/src/fx/projectiles/rocket.js";
import * as fx151 from "../vendor/pixelfx/src/fx/scifi/emp-blast.js";
import * as fx152 from "../vendor/pixelfx/src/fx/scifi/energy-core.js";
import * as fx153 from "../vendor/pixelfx/src/fx/scifi/force-field.js";
import * as fx154 from "../vendor/pixelfx/src/fx/scifi/glitch.js";
import * as fx155 from "../vendor/pixelfx/src/fx/scifi/hologram.js";
import * as fx156 from "../vendor/pixelfx/src/fx/scifi/jetpack.js";
import * as fx157 from "../vendor/pixelfx/src/fx/scifi/laser-grid.js";
import * as fx158 from "../vendor/pixelfx/src/fx/scifi/scanner.js";
import * as fx159 from "../vendor/pixelfx/src/fx/scifi/teleporter-pad.js";
import * as fx160 from "../vendor/pixelfx/src/fx/scifi/tractor-beam.js";
import * as fx161 from "../vendor/pixelfx/src/fx/scifi/warp-in.js";
import * as fx162 from "../vendor/pixelfx/src/fx/scifi/warp-out.js";
import * as fx163 from "../vendor/pixelfx/src/fx/shadow/black-hole.js";
import * as fx164 from "../vendor/pixelfx/src/fx/shadow/curse.js";
import * as fx165 from "../vendor/pixelfx/src/fx/shadow/dark-explosion.js";
import * as fx166 from "../vendor/pixelfx/src/fx/shadow/eclipse.js";
import * as fx167 from "../vendor/pixelfx/src/fx/shadow/grasping-hands.js";
import * as fx168 from "../vendor/pixelfx/src/fx/shadow/hex-sigil.js";
import * as fx169 from "../vendor/pixelfx/src/fx/shadow/life-steal.js";
import * as fx170 from "../vendor/pixelfx/src/fx/shadow/necro-skulls.js";
import * as fx171 from "../vendor/pixelfx/src/fx/shadow/shadow-flames.js";
import * as fx172 from "../vendor/pixelfx/src/fx/shadow/shadow-tendrils.js";
import * as fx173 from "../vendor/pixelfx/src/fx/shadow/soul-drain.js";
import * as fx174 from "../vendor/pixelfx/src/fx/shadow/void-orb.js";
import * as fx175 from "../vendor/pixelfx/src/fx/spawn/coin-drop.js";
import * as fx176 from "../vendor/pixelfx/src/fx/spawn/disintegrate.js";
import * as fx177 from "../vendor/pixelfx/src/fx/spawn/dissolve-burn.js";
import * as fx178 from "../vendor/pixelfx/src/fx/spawn/egg-hatch.js";
import * as fx179 from "../vendor/pixelfx/src/fx/spawn/poof.js";
import * as fx180 from "../vendor/pixelfx/src/fx/spawn/respawn-beam.js";
import * as fx181 from "../vendor/pixelfx/src/fx/spawn/shatter-death.js";
import * as fx182 from "../vendor/pixelfx/src/fx/spawn/soul-rise.js";
import * as fx183 from "../vendor/pixelfx/src/fx/spawn/spawn-portal.js";
import * as fx184 from "../vendor/pixelfx/src/fx/spawn/summon-rise.js";
import * as fx185 from "../vendor/pixelfx/src/fx/status/bleeding.js";
import * as fx186 from "../vendor/pixelfx/src/fx/status/burning.js";
import * as fx187 from "../vendor/pixelfx/src/fx/status/charmed.js";
import * as fx188 from "../vendor/pixelfx/src/fx/status/confused.js";
import * as fx189 from "../vendor/pixelfx/src/fx/status/cursed.js";
import * as fx190 from "../vendor/pixelfx/src/fx/status/frozen.js";
import * as fx191 from "../vendor/pixelfx/src/fx/status/haste.js";
import * as fx192 from "../vendor/pixelfx/src/fx/status/petrified.js";
import * as fx193 from "../vendor/pixelfx/src/fx/status/poisoned.js";
import * as fx194 from "../vendor/pixelfx/src/fx/status/rage.js";
import * as fx195 from "../vendor/pixelfx/src/fx/status/sleep.js";
import * as fx196 from "../vendor/pixelfx/src/fx/status/slowed.js";
import * as fx197 from "../vendor/pixelfx/src/fx/status/stunned.js";
import * as fx198 from "../vendor/pixelfx/src/fx/transitions/blinds.js";
import * as fx199 from "../vendor/pixelfx/src/fx/transitions/burn-away.js";
import * as fx200 from "../vendor/pixelfx/src/fx/transitions/crt-off.js";
import * as fx201 from "../vendor/pixelfx/src/fx/transitions/diamond-wipe.js";
import * as fx202 from "../vendor/pixelfx/src/fx/transitions/glitch-wipe.js";
import * as fx203 from "../vendor/pixelfx/src/fx/transitions/iris.js";
import * as fx204 from "../vendor/pixelfx/src/fx/transitions/pixel-dissolve.js";
import * as fx205 from "../vendor/pixelfx/src/fx/transitions/shatter-wipe.js";
import * as fx206 from "../vendor/pixelfx/src/fx/transitions/slash-wipe.js";
import * as fx207 from "../vendor/pixelfx/src/fx/transitions/star-iris.js";
import * as fx208 from "../vendor/pixelfx/src/fx/ui/achievement.js";
import * as fx209 from "../vendor/pixelfx/src/fx/ui/coin-collect.js";
import * as fx210 from "../vendor/pixelfx/src/fx/ui/combo-counter.js";
import * as fx211 from "../vendor/pixelfx/src/fx/ui/confetti.js";
import * as fx212 from "../vendor/pixelfx/src/fx/ui/countdown.js";
import * as fx213 from "../vendor/pixelfx/src/fx/ui/crit-number.js";
import * as fx214 from "../vendor/pixelfx/src/fx/ui/damage-number.js";
import * as fx215 from "../vendor/pixelfx/src/fx/ui/exclamation.js";
import * as fx216 from "../vendor/pixelfx/src/fx/ui/health-bar-hit.js";
import * as fx217 from "../vendor/pixelfx/src/fx/ui/heart-lost.js";
import * as fx218 from "../vendor/pixelfx/src/fx/ui/level-up.js";
import * as fx219 from "../vendor/pixelfx/src/fx/ui/quest-complete.js";
import * as fx220 from "../vendor/pixelfx/src/fx/water/bubbles.js";
import * as fx221 from "../vendor/pixelfx/src/fx/water/drip.js";
import * as fx222 from "../vendor/pixelfx/src/fx/water/fountain.js";
import * as fx223 from "../vendor/pixelfx/src/fx/water/geyser.js";
import * as fx224 from "../vendor/pixelfx/src/fx/water/rain-splash.js";
import * as fx225 from "../vendor/pixelfx/src/fx/water/ripples.js";
import * as fx226 from "../vendor/pixelfx/src/fx/water/splash.js";
import * as fx227 from "../vendor/pixelfx/src/fx/water/water-jet.js";
import * as fx228 from "../vendor/pixelfx/src/fx/water/water-orb.js";
import * as fx229 from "../vendor/pixelfx/src/fx/water/waterfall.js";
import * as fx230 from "../vendor/pixelfx/src/fx/water/wave-crash.js";
import * as fx231 from "../vendor/pixelfx/src/fx/water/whirlpool.js";
import * as fx232 from "../vendor/pixelfx/src/fx/weather/aurora.js";
import * as fx233 from "../vendor/pixelfx/src/fx/weather/blizzard.js";
import * as fx234 from "../vendor/pixelfx/src/fx/weather/cherry-blossoms.js";
import * as fx235 from "../vendor/pixelfx/src/fx/weather/clouds.js";
import * as fx236 from "../vendor/pixelfx/src/fx/weather/falling-leaves.js";
import * as fx237 from "../vendor/pixelfx/src/fx/weather/fireflies.js";
import * as fx238 from "../vendor/pixelfx/src/fx/weather/fog.js";
import * as fx239 from "../vendor/pixelfx/src/fx/weather/god-rays.js";
import * as fx240 from "../vendor/pixelfx/src/fx/weather/rain.js";
import * as fx241 from "../vendor/pixelfx/src/fx/weather/shooting-stars.js";
import * as fx242 from "../vendor/pixelfx/src/fx/weather/snow.js";
import * as fx243 from "../vendor/pixelfx/src/fx/weather/storm.js";

export const PIXELFX_EFFECTS = Object.freeze({
  "arcane/arcane-beam": fx000,
  "arcane/arcane-missiles": fx001,
  "arcane/arcane-orb": fx002,
  "arcane/blink-in": fx003,
  "arcane/blink-out": fx004,
  "arcane/magic-circle-cast": fx005,
  "arcane/mana-burst": fx006,
  "arcane/portal": fx007,
  "arcane/rune-circle": fx008,
  "arcane/spell-charge": fx009,
  "arcane/star-fall": fx010,
  "arcane/time-stop": fx011,
  "critters/bat": fx012,
  "critters/bird": fx013,
  "critters/butterfly": fx014,
  "critters/eyeball": fx015,
  "critters/fish-school": fx016,
  "critters/flying-skull": fx017,
  "critters/frog": fx018,
  "critters/ghost": fx019,
  "critters/jellyfish": fx020,
  "critters/slime": fx021,
  "critters/snake": fx022,
  "critters/wisp": fx023,
  "explosions/barrel-explosion": fx024,
  "explosions/big-explosion": fx025,
  "explosions/cartoon-pow": fx026,
  "explosions/dirt-explosion": fx027,
  "explosions/firework-burst": fx028,
  "explosions/firework-rocket": fx029,
  "explosions/grenade": fx030,
  "explosions/implosion": fx031,
  "explosions/nuke": fx032,
  "explosions/plasma-explosion": fx033,
  "explosions/small-explosion": fx034,
  "explosions/smoke-bomb": fx035,
  "fire/brazier": fx036,
  "fire/campfire": fx037,
  "fire/candle": fx038,
  "fire/fire-breath": fx039,
  "fire/fire-ring": fx040,
  "fire/fire-tornado": fx041,
  "fire/fireball": fx042,
  "fire/flame-pillar": fx043,
  "fire/flamethrower": fx044,
  "fire/meteor": fx045,
  "fire/spirit-flame": fx046,
  "fire/torch": fx047,
  "holy/blessing": fx048,
  "holy/divine-shield": fx049,
  "holy/feather-burst": fx050,
  "holy/halo": fx051,
  "holy/heal-aoe": fx052,
  "holy/heal": fx053,
  "holy/holy-pillar": fx054,
  "holy/resurrection": fx055,
  "holy/smite": fx056,
  "holy/sunburst": fx057,
  "ice/blizzard-vortex": fx058,
  "ice/freeze": fx059,
  "ice/frost-breath": fx060,
  "ice/frost-nova": fx061,
  "ice/ice-crystal": fx062,
  "ice/ice-lance": fx063,
  "ice/ice-shatter": fx064,
  "ice/ice-spikes": fx065,
  "ice/icicle-fall": fx066,
  "ice/snowflake-burst": fx067,
  "impacts/blunt-hit": fx068,
  "impacts/bullet-impact": fx069,
  "impacts/crit-hit": fx070,
  "impacts/ground-slam": fx071,
  "impacts/heavy-landing": fx072,
  "impacts/hit-flash": fx073,
  "impacts/hit-spark": fx074,
  "impacts/impact-frame": fx075,
  "impacts/parry": fx076,
  "impacts/ricochet": fx077,
  "impacts/shield-block": fx078,
  "lightning/ball-lightning": fx079,
  "lightning/chain-lightning": fx080,
  "lightning/charge-up": fx081,
  "lightning/electrified": fx082,
  "lightning/lightning-strike": fx083,
  "lightning/plasma-ball": fx084,
  "lightning/spark-arc": fx085,
  "lightning/storm-cloud": fx086,
  "lightning/tesla-coil": fx087,
  "lightning/thunderclap": fx088,
  "lightning/zap-hit": fx089,
  "melee/claw-swipe": fx090,
  "melee/dagger-flurry": fx091,
  "melee/double-slash": fx092,
  "melee/hammer-smash": fx093,
  "melee/heavy-cleave": fx094,
  "melee/scythe-reap": fx095,
  "melee/spear-sweep": fx096,
  "melee/spin-slash": fx097,
  "melee/sword-slash": fx098,
  "melee/thrust": fx099,
  "melee/uppercut": fx100,
  "melee/whip-crack": fx101,
  "moves/arrow-shot": fx102,
  "moves/dash-strike": fx103,
  "moves/earth-stomp": fx104,
  "moves/fireball-throw": fx105,
  "moves/ground-pound": fx106,
  "moves/holy-smite": fx107,
  "moves/ice-lance-throw": fx108,
  "moves/lightning-call": fx109,
  "moves/meteor-call": fx110,
  "moves/pistol-shots": fx111,
  "moves/rocket-launcher": fx112,
  "moves/sword-combo": fx113,
  "nature/acid-splash": fx114,
  "nature/boulder": fx115,
  "nature/earth-spike": fx116,
  "nature/healing-bloom": fx117,
  "nature/leaf-storm": fx118,
  "nature/poison-cloud": fx119,
  "nature/quake": fx120,
  "nature/root-snare": fx121,
  "nature/spore-burst": fx122,
  "nature/thorns": fx123,
  "nature/tornado": fx124,
  "nature/toxic-puddle": fx125,
  "nature/vine-whip": fx126,
  "pickups/chest-open": fx127,
  "pickups/coin-spin": fx128,
  "pickups/collect-burst": fx129,
  "pickups/crystal-shard": fx130,
  "pickups/gem-spin": fx131,
  "pickups/heart-pickup": fx132,
  "pickups/key-glint": fx133,
  "pickups/loot-beam": fx134,
  "pickups/potion": fx135,
  "pickups/power-star": fx136,
  "pickups/xp-orb": fx137,
  "projectiles/arrow": fx138,
  "projectiles/bullet-tracer": fx139,
  "projectiles/cannonball": fx140,
  "projectiles/energy-disc": fx141,
  "projectiles/flare": fx142,
  "projectiles/homing-missile": fx143,
  "projectiles/laser-bolt": fx144,
  "projectiles/magic-missile": fx145,
  "projectiles/muzzle-pistol": fx146,
  "projectiles/muzzle-shotgun": fx147,
  "projectiles/muzzle-smg": fx148,
  "projectiles/plasma-shot": fx149,
  "projectiles/rocket": fx150,
  "scifi/emp-blast": fx151,
  "scifi/energy-core": fx152,
  "scifi/force-field": fx153,
  "scifi/glitch": fx154,
  "scifi/hologram": fx155,
  "scifi/jetpack": fx156,
  "scifi/laser-grid": fx157,
  "scifi/scanner": fx158,
  "scifi/teleporter-pad": fx159,
  "scifi/tractor-beam": fx160,
  "scifi/warp-in": fx161,
  "scifi/warp-out": fx162,
  "shadow/black-hole": fx163,
  "shadow/curse": fx164,
  "shadow/dark-explosion": fx165,
  "shadow/eclipse": fx166,
  "shadow/grasping-hands": fx167,
  "shadow/hex-sigil": fx168,
  "shadow/life-steal": fx169,
  "shadow/necro-skulls": fx170,
  "shadow/shadow-flames": fx171,
  "shadow/shadow-tendrils": fx172,
  "shadow/soul-drain": fx173,
  "shadow/void-orb": fx174,
  "spawn/coin-drop": fx175,
  "spawn/disintegrate": fx176,
  "spawn/dissolve-burn": fx177,
  "spawn/egg-hatch": fx178,
  "spawn/poof": fx179,
  "spawn/respawn-beam": fx180,
  "spawn/shatter-death": fx181,
  "spawn/soul-rise": fx182,
  "spawn/spawn-portal": fx183,
  "spawn/summon-rise": fx184,
  "status/bleeding": fx185,
  "status/burning": fx186,
  "status/charmed": fx187,
  "status/confused": fx188,
  "status/cursed": fx189,
  "status/frozen": fx190,
  "status/haste": fx191,
  "status/petrified": fx192,
  "status/poisoned": fx193,
  "status/rage": fx194,
  "status/sleep": fx195,
  "status/slowed": fx196,
  "status/stunned": fx197,
  "transitions/blinds": fx198,
  "transitions/burn-away": fx199,
  "transitions/crt-off": fx200,
  "transitions/diamond-wipe": fx201,
  "transitions/glitch-wipe": fx202,
  "transitions/iris": fx203,
  "transitions/pixel-dissolve": fx204,
  "transitions/shatter-wipe": fx205,
  "transitions/slash-wipe": fx206,
  "transitions/star-iris": fx207,
  "ui/achievement": fx208,
  "ui/coin-collect": fx209,
  "ui/combo-counter": fx210,
  "ui/confetti": fx211,
  "ui/countdown": fx212,
  "ui/crit-number": fx213,
  "ui/damage-number": fx214,
  "ui/exclamation": fx215,
  "ui/health-bar-hit": fx216,
  "ui/heart-lost": fx217,
  "ui/level-up": fx218,
  "ui/quest-complete": fx219,
  "water/bubbles": fx220,
  "water/drip": fx221,
  "water/fountain": fx222,
  "water/geyser": fx223,
  "water/rain-splash": fx224,
  "water/ripples": fx225,
  "water/splash": fx226,
  "water/water-jet": fx227,
  "water/water-orb": fx228,
  "water/waterfall": fx229,
  "water/wave-crash": fx230,
  "water/whirlpool": fx231,
  "weather/aurora": fx232,
  "weather/blizzard": fx233,
  "weather/cherry-blossoms": fx234,
  "weather/clouds": fx235,
  "weather/falling-leaves": fx236,
  "weather/fireflies": fx237,
  "weather/fog": fx238,
  "weather/god-rays": fx239,
  "weather/rain": fx240,
  "weather/shooting-stars": fx241,
  "weather/snow": fx242,
  "weather/storm": fx243
});
export const PIXELFX_IDS = Object.freeze(Object.keys(PIXELFX_EFFECTS));
