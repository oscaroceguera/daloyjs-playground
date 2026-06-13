import { buildApp } from "./build-app";
import { serve } from "@daloyjs/core/node";

const app = buildApp();
const { port } = serve(app, { port: 3000 });

console.log(`bookstore listening on http://localhost:${port}`);
