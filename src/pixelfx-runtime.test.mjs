import test from "node:test";
import assert from "node:assert/strict";

class FakeImageData {
  constructor(data,width,height){this.data=data;this.width=width;this.height=height;}
}
function fakeContext(){
  return {imageSmoothingEnabled:false,putImageData(){},drawImage(){}};
}
globalThis.ImageData=FakeImageData;
globalThis.document={
  readyState:"complete",
  getElementById(){return null;},
  createElement(tag){
    assert.equal(tag,"canvas");
    return {width:0,height:0,getContext(){return fakeContext();}};
  }
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
