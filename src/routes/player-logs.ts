import { asc, count, eq } from "drizzle-orm";
import { Hono } from "hono";

import { getDatabase } from "../db/client";
import {
  bossLogRegions,
  items,
  playerDropLog,
  playerDropLogHistory,
  playerSlayerLog,
  playerSlayerLogHistory,
  slayerLogRegions,
} from "../db/schema";
import {
  findPlayerByUsername,
  invalidUsername,
  paginationMetadata,
  parsePagination,
} from "./shared";

type LogItem = {
  itemId: number;
  name: string;
  obtainedCount: number;
  observedAt: Date;
  receivedAt: Date;
};

type LogRow = LogItem & {
  regionId: number;
  regionName: string;
};

function groupLogRows(rows: LogRow[]) {
  const regions = new Map<
    number,
    { regionId: number; name: string; items: LogItem[] }
  >();

  for (const row of rows) {
    let region = regions.get(row.regionId);

    if (!region) {
      region = {
        regionId: row.regionId,
        name: row.regionName,
        items: [],
      };
      regions.set(row.regionId, region);
    }

    region.items.push({
      itemId: row.itemId,
      name: row.name,
      obtainedCount: row.obtainedCount,
      observedAt: row.observedAt,
      receivedAt: row.receivedAt,
    });
  }

  return [...regions.values()];
}

export const playerLogRoutes = new Hono();

playerLogRoutes.get("/v1/players/:username/drops", async (context) => {
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

  const rows = await db
    .select({
      regionId: bossLogRegions.id,
      regionName: bossLogRegions.name,
      itemId: items.id,
      name: items.name,
      obtainedCount: playerDropLog.obtainedCount,
      observedAt: playerDropLog.observedAt,
      receivedAt: playerDropLog.receivedAt,
    })
    .from(playerDropLog)
    .innerJoin(
      bossLogRegions,
      eq(bossLogRegions.id, playerDropLog.bossRegionId),
    )
    .innerJoin(items, eq(items.id, playerDropLog.itemId))
    .where(eq(playerDropLog.playerId, player.playerId))
    .orderBy(asc(bossLogRegions.id), asc(items.id));

  const bossRegions = groupLogRows(rows).map(
    ({ regionId: bossRegionId, ...region }) => ({ bossRegionId, ...region }),
  );

  return context.json({ ...player, bossRegions });
});

playerLogRoutes.get("/v1/players/:username/slayer", async (context) => {
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

  const rows = await db
    .select({
      regionId: slayerLogRegions.id,
      regionName: slayerLogRegions.name,
      itemId: items.id,
      name: items.name,
      obtainedCount: playerSlayerLog.obtainedCount,
      observedAt: playerSlayerLog.observedAt,
      receivedAt: playerSlayerLog.receivedAt,
    })
    .from(playerSlayerLog)
    .innerJoin(
      slayerLogRegions,
      eq(slayerLogRegions.id, playerSlayerLog.slayerRegionId),
    )
    .innerJoin(items, eq(items.id, playerSlayerLog.itemId))
    .where(eq(playerSlayerLog.playerId, player.playerId))
    .orderBy(asc(slayerLogRegions.id), asc(items.id));

  const slayerRegions = groupLogRows(rows).map(
    ({ regionId: slayerRegionId, ...region }) => ({
      slayerRegionId,
      ...region,
    }),
  );

  return context.json({ ...player, slayerRegions });
});

playerLogRoutes.get("/v1/players/:username/drops/history", async (context) => {
  const username = context.req.param("username");
  const pagination = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );

  if (invalidUsername(username) || pagination === undefined) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message:
          "Username must contain between 1 and 12 characters, page must be positive, and pageSize must be between 1 and 50.",
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

  const totals = await db
    .select({ total: count() })
    .from(playerDropLogHistory)
    .where(eq(playerDropLogHistory.playerId, player.playerId));
  const total = totals[0]?.total ?? 0;

  const events = await db
    .select({
      bossRegionId: bossLogRegions.id,
      bossRegionName: bossLogRegions.name,
      itemId: items.id,
      itemName: items.name,
      observedAt: playerDropLogHistory.observedAt,
      receivedAt: playerDropLogHistory.receivedAt,
    })
    .from(playerDropLogHistory)
    .innerJoin(
      bossLogRegions,
      eq(bossLogRegions.id, playerDropLogHistory.bossRegionId),
    )
    .innerJoin(items, eq(items.id, playerDropLogHistory.itemId))
    .where(eq(playerDropLogHistory.playerId, player.playerId))
    .orderBy(
      asc(playerDropLogHistory.observedAt),
      asc(bossLogRegions.id),
      asc(items.id),
    )
    .limit(pagination.pageSize)
    .offset(pagination.offset);

  return context.json({
    ...player,
    pagination: paginationMetadata(pagination.page, pagination.pageSize, total),
    events,
  });
});

playerLogRoutes.get("/v1/players/:username/slayer/history", async (context) => {
  const username = context.req.param("username");
  const pagination = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );

  if (invalidUsername(username) || pagination === undefined) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message:
          "Username must contain between 1 and 12 characters, page must be positive, and pageSize must be between 1 and 50.",
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

  const totals = await db
    .select({ total: count() })
    .from(playerSlayerLogHistory)
    .where(eq(playerSlayerLogHistory.playerId, player.playerId));
  const total = totals[0]?.total ?? 0;

  const events = await db
    .select({
      slayerRegionId: slayerLogRegions.id,
      slayerRegionName: slayerLogRegions.name,
      itemId: items.id,
      itemName: items.name,
      observedAt: playerSlayerLogHistory.observedAt,
      receivedAt: playerSlayerLogHistory.receivedAt,
    })
    .from(playerSlayerLogHistory)
    .innerJoin(
      slayerLogRegions,
      eq(slayerLogRegions.id, playerSlayerLogHistory.slayerRegionId),
    )
    .innerJoin(items, eq(items.id, playerSlayerLogHistory.itemId))
    .where(eq(playerSlayerLogHistory.playerId, player.playerId))
    .orderBy(
      asc(playerSlayerLogHistory.observedAt),
      asc(slayerLogRegions.id),
      asc(items.id),
    )
    .limit(pagination.pageSize)
    .offset(pagination.offset);

  return context.json({
    ...player,
    pagination: paginationMetadata(pagination.page, pagination.pageSize, total),
    events,
  });
});
