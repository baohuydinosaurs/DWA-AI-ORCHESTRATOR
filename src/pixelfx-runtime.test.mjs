import test from "node:test";
import assert from "node:assert/strict";

class FakeImageData {
  constructor(data,width,height){this.data=data;this.width=width;this.height=height;}
}
function fakeContext(){
  return {imageSmoothingEnabled:false,putImageData(){},drawImage(){}};
}
class FakeElement {
  constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.style={};this.value="";this.textContent="";this.id="";}
  append(...items){for(const item of items){this.children.push(item);if(this.tagName==="select"&&item.tagName==="optgroup"&&!this.value&&item.children[0])this.value=item.children[0].value;}}
  appendChild(item){this.children.push(item);return item;}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
  click(){for(const fn of this.listeners.click||[])fn();}
}
const host=new FakeElement("div");
host.id="arenaViewport";
const elements=[host];
globalThis.ImageData=FakeImageData;
globalThis.document={
  readyState:"complete",
  getElementById(id){return elements.find(el=>el.id===id)||null;},
  createElement(tag){const el=tag==="canvas"?{width:0,height:0,getContext(){return fakeContext();}}:new FakeElement(tag);elements.push(el);return el;}
};
globalThis.window={};

await import("./pixelfx-entry.js");

test("browser runtime exposes and can play all 244 effects without a DOM renderer",()=>{
  const api=window.DWAPixelFX;
  assert.ok(api);
  const ids=api.list();
  assert.equal(ids.length,244);
  const ctx=fakeContext();
  for(const id of ids){
    assert.equal(api.play(id,{x:1200,y:700,color:"#f97316"}),true,id);
    api.update(1/60);
    assert.doesNotThrow(()=>api.draw(ctx),id);
  }
  assert.ok(api.activeCount>0);
});

test("PixelFX picker mounts, lists all 244 effects and responds to button clicks",()=>{
  const root=host.children.find(el=>el.id==="dwaPixelFxRoot");
  assert.ok(root,"picker root should be mounted in arenaViewport");
  const toggle=root.children[0];
  const panel=root.children[1];
  assert.equal(toggle.textContent,"✨ PixelFX 244");
  assert.equal(panel.style.display,"none");
  toggle.click();
  assert.equal(panel.style.display,"block");
  const select=panel.children[0];
  const optionCount=select.children.reduce((n,group)=>n+group.children.length,0);
  assert.equal(optionCount,244);
  const playButton=panel.children[1];
  const before=window.DWAPixelFX.activeCount;
  playButton.click();
  assert.equal(window.DWAPixelFX.activeCount,before+1);
});
