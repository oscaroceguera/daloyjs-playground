import { z } from "zod";
import {
  App,
  cors,
  NotFoundError,
  rateLimit,
  requestId,
  secureHeaders,
  bearerAuth,
} from "@daloyjs/core";

export const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().int().optional(),
});

export function buildApp() {
  const books = new Map<string, z.infer<typeof BookSchema>>([
    ["1", { id: "1", title: "Foundation", year: 1951 }],
    ["2", { id: "2", title: "Dune", year: 1965 }],
  ]);

  const app = new App({ bodyLimitBytes: 64 * 1024, requestTimeoutMs: 5_000 });

  app.use(requestId());
  app.use(secureHeaders());
  app.use(cors({ origin: ["http://localhost:5173"] }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  app.route({
    method: "GET",
    path: "/books/:id",
    operationId: "getBookId",
    tags: ["Books"],
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: {
        description: "Found",
        body: BookSchema,
        examples: { default: { id: "1", title: "Foundation", year: 1952 } },
      },
      400: { description: "Not found" },
    },
    handler: async ({ params }) => {
      const book = books.get(params.id);
      if (!book) throw new NotFoundError(`book ${params.id} not found`);
      return { status: 200, body: book };
    },
  });

  app.route({
    method: "POST",
    path: "/books",
    operationId: "createBook",
    tags: ["Books"],
    hooks: bearerAuth({ validate: (t) => t === "demo-token" }),
    request: { body: BookSchema.omit({ id: true }) },
    responses: {
      201: { description: "Created", body: BookSchema },
      401: { description: "Unauthorized" },
      422: { description: "Validation error" },
    },
    handler: async ({ body }) => {
      const id = String(books.size + 1);
      const book = { id, ...body };
      books.set(id, book);
      return { status: 201, body: book };
    },
  });

  return app;
}
