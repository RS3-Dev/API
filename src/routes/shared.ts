import { eq, or, sql } from "drizzle-orm";

import { getDatabase } from "../db/client";
import { players, playerUsernames } from "../db/schema";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 50;

export function parseInteger(value: string | undefined, fallback: number) {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parsePagination(
  pageValue: string | undefined,
  pageSizeValue: string | undefined,
) {
  const page = parseInteger(pageValue, 1);
  const pageSize = parseInteger(pageSizeValue, DEFAULT_PAGE_SIZE);

  if (
    page === undefined ||
    page < 1 ||
    pageSize === undefined ||
    pageSize < 1 ||
    pageSize > MAX_PAGE_SIZE
  ) {
    return undefined;
  }

  const offset = (page - 1) * pageSize;

  if (!Number.isSafeInteger(offset)) {
    return undefined;
  }

  return { page, pageSize, offset };
}

export function invalidUsername(username: string) {
  return username.length < 1 || username.length > 12;
}

export async function findPlayerByUsername(username: string) {
  const normalizedUsername = username.toLowerCase();
  const db = getDatabase();
  const [player] = await db
    .select({ playerId: players.id, username: players.username })
    .from(players)
    .leftJoin(playerUsernames, eq(playerUsernames.playerId, players.id))
    .where(
      or(
        eq(sql<string>`lower(${players.username})`, normalizedUsername),
        eq(sql<string>`lower(${playerUsernames.username})`, normalizedUsername),
      ),
    )
    .limit(1);

  return player;
}

export function paginationMetadata(
  page: number,
  pageSize: number,
  total: number,
) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
