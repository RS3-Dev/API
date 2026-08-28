import { asc, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";

import { getDatabase } from "../db/client";
import { playerBossKillCounts, players } from "../db/schema";
import {
  findPlayerByUsername,
  invalidUsername,
  paginationMetadata,
  parseInteger,
  parsePagination,
} from "./shared";

export const bossRoutes = new Hono();

bossRoutes.get("/v1/players/:username/bosses", async (context) => {
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

  const bosses = await db
    .select({
      bossId: playerBossKillCounts.bossId,
      killCount: playerBossKillCounts.killCount,
      observedAt: playerBossKillCounts.observedAt,
      receivedAt: playerBossKillCounts.receivedAt,
    })
    .from(playerBossKillCounts)
    .where(eq(playerBossKillCounts.playerId, player.playerId))
    .orderBy(asc(playerBossKillCounts.bossId));

  return context.json({ ...player, bosses });
});

bossRoutes.get("/v1/bosses/:bossId/hiscores", async (context) => {
  const bossId = parseInteger(context.req.param("bossId"), -1);
  const pagination = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );

  if (bossId === undefined || bossId < 0 || pagination === undefined) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message:
          "bossId must be nonnegative, page must be positive, and pageSize must be between 1 and 50.",
        requestId: crypto.randomUUID(),
      },
      400,
    );
  }

  const { page, pageSize, offset } = pagination;

  const db = getDatabase();
  const totals = await db
    .select({ total: count() })
    .from(playerBossKillCounts)
    .where(eq(playerBossKillCounts.bossId, bossId));
  const total = totals[0]?.total ?? 0;

  const rows = await db
    .select({
      playerId: players.id,
      username: players.username,
      killCount: playerBossKillCounts.killCount,
      observedAt: playerBossKillCounts.observedAt,
      receivedAt: playerBossKillCounts.receivedAt,
    })
    .from(playerBossKillCounts)
    .innerJoin(players, eq(players.id, playerBossKillCounts.playerId))
    .where(eq(playerBossKillCounts.bossId, bossId))
    .orderBy(
      desc(playerBossKillCounts.killCount),
      asc(playerBossKillCounts.playerId),
    )
    .limit(pageSize)
    .offset(offset);

  return context.json({
    bossId,
    pagination: paginationMetadata(page, pageSize, total),
    entries: rows.map((row, index) => ({
      rank: offset + index + 1,
      ...row,
    })),
  });
});
