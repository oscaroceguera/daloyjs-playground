import { includes, z } from "zod";
import { App, requestId, secureHeaders } from "@daloyjs/core";
import { serve } from "@daloyjs/core/node";
import { printStartupBanner } from "@daloyjs/core/banner";

const app = new App({
  bodyLimitBytes: 64 * 1024,
  requestTimeoutMs: 5_000,
  openapi: { info: { title: "Hello", version: "1.0.0" } },
  docs: true,
});

app.use(requestId());
app.use(secureHeaders());

app.route({
  method: "GET",
  path: "/greet/:name",
  operationId: "greet",
  tags: ["Demo"],
  request: { params: z.object({ name: z.string().min(1) }) },
  responses: {
    200: { description: "Gretting", body: z.object({ msg: z.string() }) },
  },
  handler: async ({ params }) => ({
    status: 200,
    body: { msg: `Hello, ${params.name}` },
  }),
});

const { port } = serve(app, { port: 3000 });

printStartupBanner({
  name: "MyAPI",
  version: "1.0.0",
  url: `http://localhost:${port}`,
  runtime: "Node.js",
  links: [
    {
      label: "API docs",
      url: `http://localhost:${port}/docs`,
    },
    {
      label: "OpenAPI docs",
      url: `http://localhost:${port}/openapi.json`,
    },
    {
      label: "OpenAPI YAML",
      url: `http://localhost:${port}/openapi.yaml`,
    },
    {
      label: "Health",
      url: `http://localhost:${port}/healthz`,
    },
  ],
});
