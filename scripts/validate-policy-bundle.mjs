import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validatePolicyBundle } from "../src/policy-schema.mjs";

const path=resolve(process.argv[2] || "config/demo-policy-bundle.json");
const bundle=JSON.parse(await readFile(path,"utf8"));
const validated=validatePolicyBundle(bundle);
console.log(`Validated ${validated.policies.length} DWA policy entries from ${path}`);
