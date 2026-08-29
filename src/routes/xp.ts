import { and, asc, eq, inArray } from "drizzle-orm";
import { Context, Hono } from "hono";

import { getDatabase } from "../db/client";
import {
  playerXp15m,
  playerXp1d,
  playerXp1h,
  playerXp1mo,
  playerXp1w,
  playerXp6h,
  playerXpCurrent,
} from "../db/schema";
import {
  findPlayerByUsername,
  invalidUsername,
  parseInteger,
} from "./shared";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const storedIntervals = ["15m", "1h", "6h", "1d", "1w", "1mo"] as const;
type StoredInterval = (typeof storedIntervals)[number];
type RequestedInterval = StoredInterval | "auto";

type HistoryRow = {
  skillId: number;
  xp: number;
  observedAt: Date;
  receivedAt: Date;
  interval: StoredInterval;
};

type HistoryTable =
  | typeof playerXp15m
  | typeof playerXp1h
  | typeof playerXp6h
  | typeof playerXp1d
  | typeof playerXp1w
  | typeof playerXp1mo;

function invalidRequest(context: Context, message: string) {
  return context.json(
    {
      code: "INVALID_REQUEST",
      message,
      requestId: crypto.randomUUID(),
    },
    400,
  );
}

function parseSkillIds(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const parts = value.split(",");
  const skillIds = parts.map((part) => parseInteger(part, -1));

  if (
    skillIds.length === 0 ||
    skillIds.some((skillId) => skillId === undefined || skillId < 0) ||
    new Set(skillIds).size !== skillIds.length
  ) {
    return null;
  }

  return skillIds as number[];
}

function parseInterval(value: string | undefined): RequestedInterval | undefined {
  if (value === undefined) {
    return "auto";
  }

  return value === "auto" || storedIntervals.includes(value as StoredInterval)
    ? (value as RequestedInterval)
    : undefined;
}

function parseDate(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function intervalForAge(ageInMs: number): StoredInterval {
  if (ageInMs <= 7 * DAY_IN_MS) return "15m";
  if (ageInMs <= 30 * DAY_IN_MS) return "1h";
  if (ageInMs <= 90 * DAY_IN_MS) return "6h";
  if (ageInMs <= 180 * DAY_IN_MS) return "1d";
  if (ageInMs <= 365 * DAY_IN_MS) return "1w";
  return "1mo";
}

async function loadHistoryTable(
  table: HistoryTable,
  interval: StoredInterval,
  playerId: string,
  skillIds: number[] | undefined,
) {
  const db = getDatabase();
  const where = skillIds
    ? and(eq(table.playerId, playerId), inArray(table.skillId, skillIds))
    : eq(table.playerId, playerId);
  const rows = await db
    .select({
      skillId: table.skillId,
      xp: table.xp,
      observedAt: table.observedAt,
      receivedAt: table.receivedAt,
    })
    .from(table)
    .where(where);

  return rows.map((row) => ({ ...row, interval })) satisfies HistoryRow[];
}

export const xpRoutes = new Hono();

xpRoutes.get("/v1/players/:username/xp", async (context) => {
  const username = context.req.param("username");

  if (invalidUsername(username)) {
    return invalidRequest(
      context,
      "Username must contain between 1 and 12 characters.",
    );
  }

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

  const skills = await getDatabase()
    .select({
      skillId: playerXpCurrent.skillId,
      xp: playerXpCurrent.xp,
      observedAt: playerXpCurrent.observedAt,
      receivedAt: playerXpCurrent.receivedAt,
    })
    .from(playerXpCurrent)
    .where(eq(playerXpCurrent.playerId, player.playerId))
    .orderBy(asc(playerXpCurrent.skillId));

  return context.json({ ...player, skills });
});

xpRoutes.get("/v1/players/:username/xp/history", async (context) => {
  const username = context.req.param("username");
  const interval = parseInterval(context.req.query("interval"));
  const skillIds = parseSkillIds(context.req.query("skillIds"));
  const daysValue = context.req.query("days");
  const fromValue = context.req.query("from");
  const toValue = context.req.query("to");

  if (invalidUsername(username) || interval === undefined || skillIds === null) {
    return invalidRequest(
      context,
      "Username, interval, or skillIds contains an invalid value.",
    );
  }

  const now = new Date();
  let from: Date;
  let to: Date;

  if (daysValue !== undefined) {
    const days = parseInteger(daysValue, -1);

    if (
      days === undefined ||
      days < 1 ||
      fromValue !== undefined ||
      toValue !== undefined
    ) {
      return invalidRequest(
        context,
        "days must be a positive integer and cannot be combined with from or to.",
      );
    }

    const fromTimestamp = now.getTime() - days * DAY_IN_MS;
    if (!Number.isFinite(fromTimestamp) || Number.isNaN(new Date(fromTimestamp).getTime())) {
      return invalidRequest(context, "days produces an invalid time range.");
    }

    from = new Date(fromTimestamp);
    to = now;
  } else {
    const parsedFrom = parseDate(fromValue);
    const parsedTo = parseDate(toValue);

    if (parsedFrom === undefined || parsedTo === undefined) {
      return invalidRequest(
        context,
        "Supply days or supply both from and to.",
      );
    }

    if (parsedFrom === null || parsedTo === null) {
      return invalidRequest(context, "from and to must be valid timestamps.");
    }

    if (parsedTo <= parsedFrom) {
      return context.json(
        {
          code: "INVALID_TIME_RANGE",
          message: "to must be later than from.",
          requestId: crypto.randomUUID(),
        },
        422,
      );
    }

    from = parsedFrom;
    to = parsedTo;
  }

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

  const db = getDatabase();
  const currentWhere = skillIds
    ? and(
        eq(playerXpCurrent.playerId, player.playerId),
        inArray(playerXpCurrent.skillId, skillIds),
      )
    : eq(playerXpCurrent.playerId, player.playerId);

  const [currentRows, ...historyGroups] = await Promise.all([
    db
      .select({
        skillId: playerXpCurrent.skillId,
        xp: playerXpCurrent.xp,
        observedAt: playerXpCurrent.observedAt,
      })
      .from(playerXpCurrent)
      .where(currentWhere),
    loadHistoryTable(playerXp15m, "15m", player.playerId, skillIds),
    loadHistoryTable(playerXp1h, "1h", player.playerId, skillIds),
    loadHistoryTable(playerXp6h, "6h", player.playerId, skillIds),
    loadHistoryTable(playerXp1d, "1d", player.playerId, skillIds),
    loadHistoryTable(playerXp1w, "1w", player.playerId, skillIds),
    loadHistoryTable(playerXp1mo, "1mo", player.playerId, skillIds),
  ]);

  const allHistory = historyGroups.flat();
  const selectedRows = allHistory
    .filter((row) => row.observedAt >= from && row.observedAt <= to)
    .filter((row) =>
      interval === "auto"
        ? row.interval === intervalForAge(now.getTime() - row.observedAt.getTime())
        : row.interval === interval,
    );
  const currentBySkill = new Map(
    currentRows.map((row) => [row.skillId, row] as const),
  );
  const pointsBySkill = new Map<
    number,
    Array<{
      observedAt: Date;
      receivedAt: Date;
      xp: number;
      interval: StoredInterval;
    }>
  >();

  for (const row of selectedRows) {
    const current = currentBySkill.get(row.skillId);
    if (!current) continue;

    const laterXp = allHistory
      .filter(
        (candidate) =>
          candidate.skillId === row.skillId &&
          candidate.observedAt > row.observedAt &&
          candidate.observedAt <= current.observedAt,
      )
      .reduce((sum, candidate) => sum + candidate.xp, 0);
    const point = {
      observedAt: row.observedAt,
      receivedAt: row.receivedAt,
      xp: Math.max(0, current.xp - laterXp),
      interval: row.interval,
    };
    const points = pointsBySkill.get(row.skillId) ?? [];
    points.push(point);
    pointsBySkill.set(row.skillId, points);
  }

  const skills = [...pointsBySkill.entries()]
    .sort(([left], [right]) => left - right)
    .map(([skillId, points]) => ({
      skillId,
      points: points.sort(
        (left, right) => left.observedAt.getTime() - right.observedAt.getTime(),
      ),
    }));

  return context.json({
    ...player,
    from: from.toISOString(),
    to: to.toISOString(),
    skills,
  });
});
