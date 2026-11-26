import test from "node:test";
import assert from "node:assert/strict";
import { createTournamentRecorder, createRecordingFilename } from "./recording-controller.mjs";

class FakeRecorder {
  static isTypeSupported(type) { return type.startsWith("video/webm"); }
  constructor(stream, options) { this.stream=stream; this.mimeType=options.mimeType; this.state="inactive"; this.listeners={}; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  removeEventListener(type, fn) { this.listeners[type]=(this.listeners[type] ?? []).filter(x=>x!==fn); }
  emit(type, event={}) { for(const fn of [...(this.listeners[type] ?? [])]) fn(event); }
  start() { this.state="recording"; this.emit("start"); }
  stop() { this.emit("dataavailable",{data:new Blob(["recorded-frame"],{type:this.mimeType})}); this.state="inactive"; this.emit("stop"); }
}

test("recorder captures chunks and returns a WebM blob with metadata",async()=>{
  const recorder=createTournamentRecorder({stream:{getTracks:()=>[]},MediaRecorderClass:FakeRecorder});
  assert.ok(recorder.start(1000));
  const result=await recorder.stop();
  assert.equal(result.mimeType,"video/webm;codecs=vp9");
  assert.equal(result.chunkCount,1);
  assert.ok(result.blob.size>0);
  assert.ok(result.durationMs>=0);
});
test("recorder rejects missing stream and invalid timeslice",()=>{
  assert.throws(()=>createTournamentRecorder({MediaRecorderClass:FakeRecorder}),/MediaStream/);
  const recorder=createTournamentRecorder({stream:{getTracks:()=>[]},MediaRecorderClass:FakeRecorder});
  assert.throws(()=>recorder.start(10),/at least 250ms/);
});
test("recording filename sanitizes tournament and stage ids",()=>{
  assert.equal(createRecordingFilename({tournamentId:"DWA 60m",stageId:"final/round"}),"dwa-DWA-60m-final-round.webm");
});
