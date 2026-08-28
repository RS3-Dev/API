import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";

import { achievementRoutes } from "./routes/achievements";
import { bossRoutes } from "./routes/bosses";
import { playerLogRoutes } from "./routes/player-logs";
import { questRoutes } from "./routes/quests";
import { referenceRoutes } from "./routes/references";

const openApiFile = Bun.file(new URL("../openapi.yaml", import.meta.url));

export const app = new Hono();

app.route("/", achievementRoutes);
app.route("/", bossRoutes);
app.route("/", playerLogRoutes);
app.route("/", questRoutes);
app.route("/", referenceRoutes);

app.get("/health", (context) => context.json({ status: "ok" }));

app.get("/openapi.yaml", async (context) =>
  context.body(await openApiFile.text(), 200, {
    "Content-Type": "application/yaml; charset=utf-8",
  }),
);

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.yaml",
  }),
);

app.onError((error, context) => {
  console.error(error);

  return context.json(
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      requestId: crypto.randomUUID(),
    },
    500,
  );
});
