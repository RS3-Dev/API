import { inArray, sql } from "drizzle-orm";

import { closeDatabase, getDatabase } from "./client";
import {
  achievements,
  bosses,
  bossLogRegions,
  items,
  playerAchievements,
  playerBossKillCounts,
  playerDropLog,
  playerDropLogHistory,
  playerQuests,
  players,
  playerSlayerLog,
  playerSlayerLogHistory,
  playerUsernames,
  playerXp15m,
  playerXp1d,
  playerXp1h,
  playerXp1mo,
  playerXp1w,
  playerXp6h,
  playerXpCurrent,
  quests,
  skills,
  slayerLogRegions,
} from "./schema";

const mockPlayerIds = {
  theJoshJ: "6f758677-966a-4435-9859-e1b706478f48",
  runeMock: "11111111-1111-4111-8111-111111111111",
  bossHunter: "22222222-2222-4222-8222-222222222222",
} as const;

// Railway exposes the database credentials while a temporary TCP proxy supplies
// the reachable host and port for local seeding.
if (process.env.SEED_DATABASE_HOST && process.env.SEED_DATABASE_PORT) {
  const { PGDATABASE, PGPASSWORD, PGUSER } = process.env;

  if (!PGDATABASE || !PGPASSWORD || !PGUSER) {
    throw new Error("PGDATABASE, PGPASSWORD, and PGUSER are required for proxy seeding");
  }

  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${process.env.SEED_DATABASE_HOST}:${process.env.SEED_DATABASE_PORT}/${encodeURIComponent(PGDATABASE)}?sslmode=require`;
}

const skillReferences = [
  "Attack",
  "Defence",
  "Strength",
  "Constitution",
  "Ranged",
  "Prayer",
  "Magic",
  "Cooking",
  "Woodcutting",
  "Fletching",
  "Fishing",
  "Firemaking",
  "Crafting",
  "Smithing",
  "Mining",
  "Herblore",
  "Agility",
  "Thieving",
  "Slayer",
  "Farming",
  "Runecrafting",
  "Hunter",
  "Construction",
  "Summoning",
  "Dungeoneering",
  "Divination",
  "Invention",
  "Archaeology",
  "Necromancy",
].map((name, id) => ({ id, name }));

const now = new Date();
now.setMilliseconds(0);

function ago(days: number, hours = 0, minutes = 0) {
  return new Date(
    now.getTime() -
      days * 24 * 60 * 60 * 1000 -
      hours * 60 * 60 * 1000 -
      minutes * 60 * 1000,
  );
}

function receivedAfter(observedAt: Date) {
  return new Date(observedAt.getTime() + 2_000);
}

function xpRow(skillId: number, xp: number, observedAt: Date) {
  return {
    playerId: mockPlayerIds.theJoshJ,
    skillId,
    xp,
    observedAt,
    receivedAt: receivedAfter(observedAt),
  };
}

async function seed() {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    await tx
      .insert(skills)
      .values(skillReferences)
      .onConflictDoUpdate({
        target: skills.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(bosses)
      .values([
        { id: 1000, name: "Telos, the Warden" },
        { id: 1001, name: "Raksha, the Shadow Colossus" },
        { id: 1002, name: "Kerapac, the bound" },
      ])
      .onConflictDoUpdate({
        target: bosses.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(items)
      .values([
        { id: 3000, name: "Spider leg top" },
        { id: 3001, name: "Bow of the Last Guardian piece" },
        { id: 3002, name: "Abyssal scourge" },
        { id: 3003, name: "Cinderbane gloves" },
      ])
      .onConflictDoUpdate({
        target: items.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(bossLogRegions)
      .values([
        { id: 2000, name: "Araxxi" },
        { id: 2001, name: "Zamorak, Lord of Chaos" },
      ])
      .onConflictDoUpdate({
        target: bossLogRegions.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(slayerLogRegions)
      .values([
        { id: 4000, name: "Daemonheim" },
        { id: 4001, name: "Morytania" },
      ])
      .onConflictDoUpdate({
        target: slayerLogRegions.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(quests)
      .values([
        { id: 5000, name: "Cook's Assistant" },
        { id: 5001, name: "While Guthix Sleeps" },
        { id: 5002, name: "The World Wakes" },
      ])
      .onConflictDoUpdate({
        target: quests.id,
        set: { name: sql`excluded.name` },
      });
    await tx
      .insert(achievements)
      .values([
        { id: 6000, name: "Mock Combat I", type: "combat" },
        { id: 6001, name: "Mock Combat II", type: "combat" },
        { id: 6002, name: "Mock Explorer", type: "exploration" },
        { id: 6003, name: "Mock Skiller", type: "skills" },
      ])
      .onConflictDoUpdate({
        target: achievements.id,
        set: { name: sql`excluded.name`, type: sql`excluded.type` },
      });

    // Re-running the seed only replaces the three stable mock identities.
    await tx
      .delete(players)
      .where(inArray(players.id, Object.values(mockPlayerIds)));

    await tx.insert(players).values([
      { id: mockPlayerIds.theJoshJ, username: "TheJoshJ" },
      { id: mockPlayerIds.runeMock, username: "RuneMock" },
      { id: mockPlayerIds.bossHunter, username: "BossHunter" },
    ]);
    await tx.insert(playerUsernames).values([
      {
        playerId: mockPlayerIds.theJoshJ,
        username: "TheJoshJ",
        observedAt: ago(0),
        receivedAt: receivedAfter(ago(0)),
      },
      {
        playerId: mockPlayerIds.theJoshJ,
        username: "OldJosh",
        observedAt: ago(365),
        receivedAt: receivedAfter(ago(365)),
      },
      {
        playerId: mockPlayerIds.runeMock,
        username: "RuneMock",
        observedAt: ago(0),
        receivedAt: receivedAfter(ago(0)),
      },
      {
        playerId: mockPlayerIds.bossHunter,
        username: "BossHunter",
        observedAt: ago(0),
        receivedAt: receivedAfter(ago(0)),
      },
    ]);

    await tx.insert(playerXpCurrent).values([
      xpRow(0, 50_000_000, now),
      xpRow(3, 72_500_000, now),
      xpRow(28, 21_000_000, now),
    ]);
    await tx.insert(playerXp15m).values([
      xpRow(0, 1_250, ago(0, 0, 15)),
      xpRow(0, 2_400, ago(0, 0, 30)),
      xpRow(3, 800, ago(0, 1)),
      xpRow(28, 5_000, ago(1)),
      xpRow(28, 7_500, ago(3)),
      xpRow(0, 10_000, ago(6)),
    ]);
    await tx.insert(playerXp1h).values([
      xpRow(0, 22_000, ago(8)),
      xpRow(3, 18_000, ago(14)),
      xpRow(28, 45_000, ago(21)),
      xpRow(0, 30_000, ago(29)),
    ]);
    await tx.insert(playerXp6h).values([
      xpRow(0, 75_000, ago(35)),
      xpRow(3, 65_000, ago(60)),
      xpRow(28, 90_000, ago(85)),
    ]);
    await tx.insert(playerXp1d).values([
      xpRow(0, 150_000, ago(100)),
      xpRow(3, 125_000, ago(150)),
    ]);
    await tx.insert(playerXp1w).values([
      xpRow(28, 250_000, ago(200)),
      xpRow(0, 300_000, ago(300)),
    ]);
    await tx.insert(playerXp1mo).values([
      xpRow(3, 500_000, ago(400)),
      xpRow(0, 750_000, ago(730)),
    ]);

    const bossObservedAt = ago(0);
    await tx.insert(playerBossKillCounts).values([
      { playerId: mockPlayerIds.theJoshJ, bossId: 1001, killCount: 420, observedAt: bossObservedAt, receivedAt: receivedAfter(bossObservedAt) },
      { playerId: mockPlayerIds.runeMock, bossId: 1001, killCount: 1_337, observedAt: bossObservedAt, receivedAt: receivedAfter(bossObservedAt) },
      { playerId: mockPlayerIds.bossHunter, bossId: 1001, killCount: 2_500, observedAt: bossObservedAt, receivedAt: receivedAfter(bossObservedAt) },
      { playerId: mockPlayerIds.theJoshJ, bossId: 1000, killCount: 150, observedAt: ago(1), receivedAt: receivedAfter(ago(1)) },
    ]);

    await tx.insert(playerDropLog).values([
      { playerId: mockPlayerIds.theJoshJ, bossRegionId: 2000, itemId: 3000, obtainedCount: 3, observedAt: ago(2), receivedAt: receivedAfter(ago(2)) },
      { playerId: mockPlayerIds.theJoshJ, bossRegionId: 2001, itemId: 3001, obtainedCount: 1, observedAt: ago(5), receivedAt: receivedAfter(ago(5)) },
    ]);
    await tx.insert(playerDropLogHistory).values([
      { playerId: mockPlayerIds.theJoshJ, bossRegionId: 2000, itemId: 3000, observedAt: ago(30), receivedAt: receivedAfter(ago(30)) },
      { playerId: mockPlayerIds.theJoshJ, bossRegionId: 2000, itemId: 3000, observedAt: ago(15), receivedAt: receivedAfter(ago(15)) },
      { playerId: mockPlayerIds.theJoshJ, bossRegionId: 2001, itemId: 3001, observedAt: ago(5), receivedAt: receivedAfter(ago(5)) },
    ]);
    await tx.insert(playerSlayerLog).values([
      { playerId: mockPlayerIds.theJoshJ, slayerRegionId: 4000, itemId: 3002, obtainedCount: 2, observedAt: ago(3), receivedAt: receivedAfter(ago(3)) },
      { playerId: mockPlayerIds.theJoshJ, slayerRegionId: 4001, itemId: 3003, obtainedCount: 4, observedAt: ago(7), receivedAt: receivedAfter(ago(7)) },
    ]);
    await tx.insert(playerSlayerLogHistory).values([
      { playerId: mockPlayerIds.theJoshJ, slayerRegionId: 4000, itemId: 3002, observedAt: ago(40), receivedAt: receivedAfter(ago(40)) },
      { playerId: mockPlayerIds.theJoshJ, slayerRegionId: 4000, itemId: 3002, observedAt: ago(3), receivedAt: receivedAfter(ago(3)) },
      { playerId: mockPlayerIds.theJoshJ, slayerRegionId: 4001, itemId: 3003, observedAt: ago(7), receivedAt: receivedAfter(ago(7)) },
    ]);

    await tx.insert(playerQuests).values([
      { playerId: mockPlayerIds.theJoshJ, questId: 5000, status: "completed", observedAt: ago(10), receivedAt: receivedAfter(ago(10)) },
      { playerId: mockPlayerIds.theJoshJ, questId: 5001, status: "started", observedAt: ago(1), receivedAt: receivedAfter(ago(1)) },
      { playerId: mockPlayerIds.theJoshJ, questId: 5002, status: "not_started", observedAt: ago(1), receivedAt: receivedAfter(ago(1)) },
    ]);
    await tx.insert(playerAchievements).values([
      { playerId: mockPlayerIds.theJoshJ, achievementId: 6000, completed: true, observedAt: ago(20), receivedAt: receivedAfter(ago(20)) },
      { playerId: mockPlayerIds.theJoshJ, achievementId: 6001, completed: false, observedAt: ago(1), receivedAt: receivedAfter(ago(1)) },
      { playerId: mockPlayerIds.theJoshJ, achievementId: 6002, completed: true, observedAt: ago(50), receivedAt: receivedAfter(ago(50)) },
      { playerId: mockPlayerIds.theJoshJ, achievementId: 6003, completed: true, observedAt: ago(75), receivedAt: receivedAfter(ago(75)) },
    ]);
  });

  console.log(
    "Seeded 3 mock players. Try GET /v1/players/TheJoshJ/xp and GET /v1/bosses/1001/hiscores.",
  );
}

try {
  await seed();
} finally {
  await closeDatabase();
}
