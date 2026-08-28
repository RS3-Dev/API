import { app } from "./app";

const port = Number.parseInt(Bun.env.PORT ?? "3000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`RS3.Dev API listening on http://localhost:${port}`);
console.log(`Swagger UI available at http://localhost:${port}/docs`);
