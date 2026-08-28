import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const players = pgTable(
  "players",
  {
    id: uuid("player_id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 12 }).notNull(),
  },
  (table) => [
    uniqueIndex("players_username_ci_uidx").on(sql`lower(${table.username})`),
  ],
);

export const playerUsernames = pgTable(
  "player_usernames",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 12 }).notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_usernames_pk",
      columns: [table.playerId, table.username],
    }),
    uniqueIndex("player_usernames_username_ci_uidx").on(
      sql`lower(${table.username})`,
    ),
    index("player_usernames_player_id_idx").on(table.playerId),
  ],
);

export const skills = pgTable(
  "skills",
  {
    id: integer("skill_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [check("skills_skill_id_nonnegative", sql`${table.id} >= 0`)],
);

export const bosses = pgTable(
  "bosses",
  {
    id: integer("boss_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [check("bosses_boss_id_nonnegative", sql`${table.id} >= 0`)],
);

export const items = pgTable(
  "items",
  {
    id: integer("item_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [check("items_item_id_nonnegative", sql`${table.id} >= 0`)],
);

export const bossLogRegions = pgTable(
  "boss_log_regions",
  {
    id: integer("boss_region_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [check("boss_log_regions_id_nonnegative", sql`${table.id} >= 0`)],
);

export const slayerLogRegions = pgTable(
  "slayer_log_regions",
  {
    id: integer("slayer_region_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [
    check("slayer_log_regions_id_nonnegative", sql`${table.id} >= 0`),
  ],
);

export const quests = pgTable(
  "quests",
  {
    id: integer("quest_id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [check("quests_quest_id_nonnegative", sql`${table.id} >= 0`)],
);

export const achievements = pgTable(
  "achievements",
  {
    id: integer("achievement_id").primaryKey(),
    name: text("name").notNull(),
    type: varchar("type", { length: 32 }).notNull(),
  },
  (table) => [
    check("achievements_achievement_id_nonnegative", sql`${table.id} >= 0`),
    index("achievements_type_idx").on(table.type.asc(), table.id.asc()),
  ],
);

const createXpColumns = () => ({
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id),
  xp: bigint("xp", { mode: "number" }).notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const playerXpCurrent = pgTable(
  "player_xp_current",
  createXpColumns(),
  (table) => [
    primaryKey({
      name: "player_xp_current_pk",
      columns: [table.playerId, table.skillId],
    }),
    check("player_xp_current_xp_nonnegative", sql`${table.xp} >= 0`),
  ],
);

function createXpHistoryTable<const TName extends string>(name: TName) {
  return pgTable(name, createXpColumns(), (table) => [
    primaryKey({
      name: `${name}_pk`,
      columns: [table.playerId, table.skillId, table.observedAt],
    }),
    check(`${name}_xp_positive`, sql`${table.xp} > 0`),
  ]);
}

// The xp column is an absolute value in player_xp_current and a delta in every
// history table below.
export const playerXp15m = createXpHistoryTable("player_xp_15m");
export const playerXp1h = createXpHistoryTable("player_xp_1h");
export const playerXp6h = createXpHistoryTable("player_xp_6h");
export const playerXp1d = createXpHistoryTable("player_xp_1d");
export const playerXp1w = createXpHistoryTable("player_xp_1w");
export const playerXp1mo = createXpHistoryTable("player_xp_1mo");

export const playerBossKillCounts = pgTable(
  "player_boss_kill_counts",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    bossId: integer("boss_id")
      .notNull()
      .references(() => bosses.id),
    killCount: integer("kill_count").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_boss_kill_counts_pk",
      columns: [table.playerId, table.bossId],
    }),
    check("player_boss_kill_counts_nonnegative", sql`${table.killCount} >= 0`),
    index("player_boss_kill_counts_hiscores_idx").on(
      table.bossId.asc(),
      table.killCount.desc(),
      table.playerId.asc(),
    ),
  ],
);

export const playerQuests = pgTable(
  "player_quests",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    questId: integer("quest_id")
      .notNull()
      .references(() => quests.id),
    status: varchar("status", {
      length: 11,
      enum: ["not_started", "started", "completed"],
    }).notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_quests_pk",
      columns: [table.playerId, table.questId],
    }),
    check(
      "player_quests_status_valid",
      sql`${table.status} in ('not_started', 'started', 'completed')`,
    ),
  ],
);

export const playerAchievements = pgTable(
  "player_achievements",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    achievementId: integer("achievement_id")
      .notNull()
      .references(() => achievements.id),
    completed: boolean("completed").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_achievements_pk",
      columns: [table.playerId, table.achievementId],
    }),
    check(
      "player_achievements_achievement_id_nonnegative",
      sql`${table.achievementId} >= 0`,
    ),
  ],
);

export const playerDropLog = pgTable(
  "player_drop_log",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    bossRegionId: integer("boss_region_id")
      .notNull()
      .references(() => bossLogRegions.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    obtainedCount: integer("obtained_count").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_drop_log_pk",
      columns: [table.playerId, table.bossRegionId, table.itemId],
    }),
    check(
      "player_drop_log_obtained_count_nonnegative",
      sql`${table.obtainedCount} >= 0`,
    ),
  ],
);

export const playerDropLogHistory = pgTable(
  "player_drop_log_history",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    bossRegionId: integer("boss_region_id")
      .notNull()
      .references(() => bossLogRegions.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_drop_log_history_pk",
      columns: [
        table.playerId,
        table.bossRegionId,
        table.itemId,
        table.observedAt,
      ],
    }),
    index("player_drop_log_history_chronological_idx").on(
      table.playerId.asc(),
      table.observedAt.asc(),
    ),
  ],
);

export const playerSlayerLog = pgTable(
  "player_slayer_log",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    slayerRegionId: integer("slayer_region_id")
      .notNull()
      .references(() => slayerLogRegions.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    obtainedCount: integer("obtained_count").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_slayer_log_pk",
      columns: [table.playerId, table.slayerRegionId, table.itemId],
    }),
    check(
      "player_slayer_log_obtained_count_nonnegative",
      sql`${table.obtainedCount} >= 0`,
    ),
  ],
);

export const playerSlayerLogHistory = pgTable(
  "player_slayer_log_history",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    slayerRegionId: integer("slayer_region_id")
      .notNull()
      .references(() => slayerLogRegions.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "player_slayer_log_history_pk",
      columns: [
        table.playerId,
        table.slayerRegionId,
        table.itemId,
        table.observedAt,
      ],
    }),
    index("player_slayer_log_history_chronological_idx").on(
      table.playerId.asc(),
      table.observedAt.asc(),
    ),
  ],
);
