import { asc, count, sql } from "drizzle-orm";
import { Context, Hono } from "hono";

import { getDatabase } from "../db/client";
import {
  achievements,
  bosses,
  bossLogRegions,
  items,
  quests,
  skills,
  slayerLogRegions,
} from "../db/schema";
import { paginationMetadata, parsePagination } from "./shared";

export const referenceRoutes = new Hono();

function invalidPaginationResponse(context: Context) {
  return context.json(
    {
      code: "INVALID_REQUEST",
      message: "page must be positive and pageSize must be between 1 and 50.",
      requestId: crypto.randomUUID(),
    },
    400,
  );
}

referenceRoutes.get("/v1/reference/skills", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(skills),
    db
      .select({ id: skills.id, name: skills.name })
      .from(skills)
      .orderBy(asc(skills.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;

  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/bosses", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(bosses),
    db
      .select({ id: bosses.id, name: bosses.name })
      .from(bosses)
      .orderBy(asc(bosses.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/items", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(items),
    db
      .select({ id: items.id, name: items.name })
      .from(items)
      .orderBy(asc(items.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/boss-log-regions", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(bossLogRegions),
    db
      .select({ id: bossLogRegions.id, name: bossLogRegions.name })
      .from(bossLogRegions)
      .orderBy(asc(bossLogRegions.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/slayer-log-regions", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(slayerLogRegions),
    db
      .select({ id: slayerLogRegions.id, name: slayerLogRegions.name })
      .from(slayerLogRegions)
      .orderBy(asc(slayerLogRegions.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/quests", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const db = getDatabase();
  const [totals, entries] = await Promise.all([
    db.select({ total: count() }).from(quests),
    db
      .select({ id: quests.id, name: quests.name })
      .from(quests)
      .orderBy(asc(quests.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/achievements", async (context) => {
  const page = parsePagination(
    context.req.query("page"),
    context.req.query("pageSize"),
  );
  if (!page) return invalidPaginationResponse(context);

  const type = context.req.query("type");
  if (type !== undefined && (type.length < 1 || type.length > 32)) {
    return context.json(
      {
        code: "INVALID_REQUEST",
        message: "type must contain between 1 and 32 characters.",
        requestId: crypto.randomUUID(),
      },
      400,
    );
  }

  const db = getDatabase();
  const where =
    type === undefined ? undefined : sql`${achievements.type} = ${type}`;
  const totalsQuery = db.select({ total: count() }).from(achievements);
  const entriesQuery = db
    .select({
      id: achievements.id,
      name: achievements.name,
      type: achievements.type,
    })
    .from(achievements);
  const [totals, entries] = await Promise.all([
    where ? totalsQuery.where(where) : totalsQuery,
    (where ? entriesQuery.where(where) : entriesQuery)
      .orderBy(asc(achievements.type), asc(achievements.id))
      .limit(page.pageSize)
      .offset(page.offset),
  ]);
  const total = totals[0]?.total ?? 0;
  return context.json({
    pagination: paginationMetadata(page.page, page.pageSize, total),
    entries,
  });
});

referenceRoutes.get("/v1/reference/achievement-types", async (context) => {
  const db = getDatabase();
  const entries = await db
    .selectDistinct({ type: achievements.type })
    .from(achievements)
    .orderBy(asc(achievements.type));

  return context.json({ entries });
});
