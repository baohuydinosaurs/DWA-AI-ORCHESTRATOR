import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { integrateGameHtml, getPolicyBridgeSource } from "./build-ai-preview.mjs";

const fixture = `<html><body><script>
(() => {
  let dinos = [];
  let seconds = 0;
  let running = false;
  let viewMode = "2d";
  function triggerDinoSkill(caster, livingEnemies) {
    const moveId = pick(caster.movePool);
  }
  function stepCombat(dt) {
    const living = dinos.filter((d) => d.alive);
    for (let d of living) {
      const enemies = living.filter((o) => o !== d);
      let nearest = enemies[0];
      let bestDist = Infinity;
      for (let en of enemies) {
        const dist = Math.hypot(en.x - d.x, en.y - d.y);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = en;
        }
      }
      const dx = nearest.x - d.x;
      const dy = nearest.y - d.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const spd = d.baseSpeed * 1.48 * w.speed * freezeFactor;
      if (dist > 38) {
        d.x += dx;
      }
      if (d.skillTimer <= 0) {
        triggerDinoSkill(d, enemies);
      }
    }
  }
  function checkMatchEnded() { return false; }
})();
</script></body></html>`;

test("injects read-only snapshot and validated policy control without replacing game logic",()=>{
  const output=integrateGameHtml(fixture);
  assert.match(output,/window\.DWA_AI = Object\.freeze/);
  assert.match(output,/getSnapshot\(\)/);
  assert.match(output,/targetMode === "weakest"/);
  assert.match(output,/tactic === "aggressive"/);
  assert.match(output,/tactic === "evasive"/);
  assert.match(output,/preferredSkillId/);
  assert.match(output,/triggerDinoSkill\(d, enemies, preferredSkill\)/);
  assert.match(output,/DWA_AI_POLICIES\.set/);
  assert.match(output,/Nạp AI policy/);
  assert.match(output,/dwaPolicyFileInput/);
  assert.match(output,/await file\.text\(\)/);
  assert.match(output,/Unknown policy fields/);
  assert.match(output,/Duplicate skill IDs/);
  assert.match(output,/schemaVersion 1/);
});

test("rejects an unknown game source layout instead of silently producing a broken preview",()=>{
  assert.throws(()=>integrateGameHtml("<html><body>unrecognized</body></html>"),/inline script/);
});


test("runs policy bridge API with a stub browser and game state",()=>{
  const elements=[];
  const document={
    createElement(tag){
      return {
        tag,
        style:{},
        attributes:{},
        listeners:{},
        children:[],
        files:[],
        setAttribute(key,value){this.attributes[key]=value;},
        addEventListener(name,callback){this.listeners[name]=callback;},
        append(...children){this.children.push(...children);},
        click(){this.clicked=true;}
      };
    },
    body:{appendChild(element){elements.push(element);}}
  };
  const context={
    Map,Set,Object,Number,String,Array,TypeError,Error,RangeError,JSON,
    window:{},
    document,
    running:true,
    seconds:17,
    viewMode:"3d",
    dinos:[{id:0,name:"Demo Rex",species:"existing",teamIdx:0,hp:80,maxHp:100,atk:50,x:12,y:20,alive:true,movePool:["buff-power","heal-aoe"]}]
  };
  new Script("const DWA_AI_POLICIES = new Map();\n"+getPolicyBridgeSource()).runInNewContext(context);
  const api=context.window.DWA_AI;
  assert.equal(api.setPolicy(0,{targetMode:"weakest",tactic:"aggressive",skillPriority:["buff-power"]},"worker-demo-01"),true);
  assert.equal(api.getPolicyAssignments()[0].workerId,"worker-demo-01");
  const snapshot=api.getSnapshot();
  assert.equal(snapshot.elapsedSeconds,17);
  assert.equal(snapshot.roster[0].name,"Demo Rex");
  assert.equal(snapshot.roster[0].skills.length,2);
  assert.throws(()=>api.setPolicy(1,{unknown:true},"worker-demo-02"),/Unknown policy fields/);
  assert.throws(()=>api.setPolicy(1,{skillPriority:["buff-power","buff-power"]},"worker-demo-02"),/Duplicate skill IDs/);
  assert.equal(api.loadPolicyBundle({schemaVersion:1,policies:[
    {dinoId:1,workerId:"worker-demo-02",policy:{targetMode:"nearest"}}
  ]}).loaded,1);
  assert.throws(()=>api.loadPolicyBundle({schemaVersion:2,policies:[]}),/schemaVersion 1/);
  assert.equal(elements.length,1,"mobile policy panel should be mounted");
  const panel=elements[0];
  assert.equal(panel.children[0].textContent,"🧠 Nạp AI policy");
  assert.equal(panel.children[1].textContent,"Xóa policy");
});

test("mobile policy loader reports successful JSON file selection",async()=>{
  const elements=[];
  const document={
    createElement(tag){return {tag,style:{},listeners:{},children:[],files:[],setAttribute(){},addEventListener(name,callback){this.listeners[name]=callback;},append(...children){this.children.push(...children);},click(){}};},
    body:{appendChild(element){elements.push(element);}}
  };
  const context={Map,Set,Object,Number,String,Array,TypeError,Error,RangeError,JSON,window:{},document,running:false,seconds:0,viewMode:"2d",dinos:[]};
  new Script("const DWA_AI_POLICIES = new Map();\n"+getPolicyBridgeSource()).runInNewContext(context);
  const panel=elements[0];
  const input=panel.children[2];
  const status=panel.children[3];
  input.files=[{name:"demo.json",text:async()=>JSON.stringify({schemaVersion:1,policies:[{dinoId:0,workerId:"demo-worker",policy:{}}]})}];
  await input.listeners.change();
  assert.match(status.textContent,/Đã nạp 1 policy từ demo.json/);
});
