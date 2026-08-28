import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";

import { getDatabase } from "../db/client";
import { playerQuests, quests } from "../db/schema";
import { findPlayerByUsername, invalidUsername } from "./shared";

export const questRoutes = new Hono();

questRoutes.get("/v1/players/:username/quests", async (context) => {
  const username = context.req.param("username");

  if (invalidUsername(username)) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message: "Username must contain between 1 and 12 characters.",
        requestId: crypto.randomUUID(),
      },
      400,
    );
  }

  const db = getDatabase();
  const player = await findPlayerByUsername(username);

  if (!player) {
    return context.json(
      {
        code: "PLAYER_NOT_FOUND",
        message: "No tracked player was found for that username.",
        requestId: crypto.randomUUID(),
      },
      404,
    );
  }

  const questStatuses = await db
    .select({
      questId: quests.id,
      name: quests.name,
      status: playerQuests.status,
      observedAt: playerQuests.observedAt,
      receivedAt: playerQuests.receivedAt,
    })
    .from(playerQuests)
    .innerJoin(quests, eq(quests.id, playerQuests.questId))
    .where(eq(playerQuests.playerId, player.playerId))
    .orderBy(asc(quests.id));

  return context.json({ ...player, quests: questStatuses });
});
