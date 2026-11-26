import test from "node:test";
import assert from "node:assert/strict";
import { extractGeminiText } from "./gemini-adapter.mjs";

test("extracts text from the documented Interactions API model_output step",()=>{
  const payload={
    id:"interaction-1",
    steps:[
      {type:"thought",content:[]},
      {type:"model_output",content:[{type:"text",text:"Phân tích đã hoàn tất."}]}
    ]
  };
  assert.equal(extractGeminiText(payload),"Phân tích đã hoàn tất.");
});

test("joins multiple model_output text parts and ignores non-output steps",()=>{
  const payload={steps:[
    {type:"function_call",content:[{text:"do not show"}]},
    {type:"model_output",content:[{text:"Phần một."},{text:"Phần hai."}]}
  ]};
  assert.equal(extractGeminiText(payload),"Phần một.\nPhần hai.");
});

test("supports output_text and compatibility chat response shapes",()=>{
  assert.equal(extractGeminiText({output_text:"direct text"}),"direct text");
  assert.equal(extractGeminiText({choices:[{message:{content:"chat text"}}]}),"chat text");
});

test("returns empty text when a response has no user-facing model output",()=>{
  assert.equal(extractGeminiText({steps:[{type:"thought",content:[{text:"private reasoning"}]}]}),"");
});
