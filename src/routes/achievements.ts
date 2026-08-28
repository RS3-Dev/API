import { and, asc, count, eq } from "drizzle-orm";
import { Hono } from "hono";

import { getDatabase } from "../db/client";
import {
  achievements as achievementDefinitions,
  playerAchievements,
} from "../db/schema";
import {
  findPlayerByUsername,
  invalidUsername,
  paginationMetadata,
  parsePagination,
} from "./shared";

export const achievementRoutes = new Hono();

achievementRoutes.get("/v1/players/:username/achievements", async (context) => {
  const username = context.req.param("username");
  const type = context.req.query("type");
  const pagination = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );

  if (
    invalidUsername(username) ||
    pagination === undefined ||
    (type !== undefined && (type.length < 1 || type.length > 32))
  ) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message:
          "Username must contain between 1 and 12 characters, type must contain between 1 and 32 characters, page must be positive, and pageSize must be between 1 and 50.",
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

  const where =
    type === undefined
      ? eq(playerAchievements.playerId, player.playerId)
      : and(
          eq(playerAchievements.playerId, player.playerId),
          eq(achievementDefinitions.type, type),
        );

  const totals = await db
    .select({ total: count() })
    .from(playerAchievements)
    .innerJoin(
      achievementDefinitions,
      eq(achievementDefinitions.id, playerAchievements.achievementId),
    )
    .where(where);
  const total = totals[0]?.total ?? 0;

  const playerAchievementRows = await db
    .select({
      achievementId: playerAchievements.achievementId,
      name: achievementDefinitions.name,
      type: achievementDefinitions.type,
      completed: playerAchievements.completed,
      observedAt: playerAchievements.observedAt,
      receivedAt: playerAchievements.receivedAt,
    })
    .from(playerAchievements)
    .innerJoin(
      achievementDefinitions,
      eq(achievementDefinitions.id, playerAchievements.achievementId),
    )
    .where(where)
    .orderBy(
      asc(achievementDefinitions.type),
      asc(playerAchievements.achievementId),
    )
    .limit(pagination.pageSize)
    .offset(pagination.offset);

  return context.json({
    ...player,
    pagination: paginationMetadata(pagination.page, pagination.pageSize, total),
    achievements: playerAchievementRows,
  });
});
