// scripts/dump-openapi.ts
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { generateOpenAPI } from "@daloyjs/core/openapi";
import { buildApp } from "../src/build-app.js";

const app = buildApp();
const out = "./generated/openapi.json";
const doc = generateOpenAPI(app, {
  info: { title: "Bookstore API", version: "1.0.0" },
  securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
});

await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(doc, null, 2));
console.log(`wrote ${out}`);
