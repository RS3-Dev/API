CREATE TABLE "achievements" (
	"achievement_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" varchar(32) NOT NULL,
	CONSTRAINT "achievements_achievement_id_nonnegative" CHECK ("achievements"."achievement_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "boss_log_regions" (
	"boss_region_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "boss_log_regions_id_nonnegative" CHECK ("boss_log_regions"."boss_region_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "bosses" (
	"boss_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "bosses_boss_id_nonnegative" CHECK ("bosses"."boss_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "items" (
	"item_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "items_item_id_nonnegative" CHECK ("items"."item_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "player_achievements" (
	"player_id" uuid NOT NULL,
	"achievement_id" integer NOT NULL,
	"completed" boolean NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_achievements_pk" PRIMARY KEY("player_id","achievement_id"),
	CONSTRAINT "player_achievements_achievement_id_nonnegative" CHECK ("player_achievements"."achievement_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "player_boss_kill_counts" (
	"player_id" uuid NOT NULL,
	"boss_id" integer NOT NULL,
	"kill_count" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_boss_kill_counts_pk" PRIMARY KEY("player_id","boss_id"),
	CONSTRAINT "player_boss_kill_counts_nonnegative" CHECK ("player_boss_kill_counts"."kill_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "player_drop_log" (
	"player_id" uuid NOT NULL,
	"boss_region_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"obtained_count" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_drop_log_pk" PRIMARY KEY("player_id","boss_region_id","item_id"),
	CONSTRAINT "player_drop_log_obtained_count_nonnegative" CHECK ("player_drop_log"."obtained_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "player_drop_log_history" (
	"player_id" uuid NOT NULL,
	"boss_region_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_drop_log_history_pk" PRIMARY KEY("player_id","boss_region_id","item_id","observed_at")
);
--> statement-breakpoint
CREATE TABLE "player_quests" (
	"player_id" uuid NOT NULL,
	"quest_id" integer NOT NULL,
	"status" varchar(11) NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_quests_pk" PRIMARY KEY("player_id","quest_id"),
	CONSTRAINT "player_quests_status_valid" CHECK ("player_quests"."status" in ('not_started', 'started', 'completed'))
);
--> statement-breakpoint
CREATE TABLE "player_slayer_log" (
	"player_id" uuid NOT NULL,
	"slayer_region_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"obtained_count" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_slayer_log_pk" PRIMARY KEY("player_id","slayer_region_id","item_id"),
	CONSTRAINT "player_slayer_log_obtained_count_nonnegative" CHECK ("player_slayer_log"."obtained_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "player_slayer_log_history" (
	"player_id" uuid NOT NULL,
	"slayer_region_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_slayer_log_history_pk" PRIMARY KEY("player_id","slayer_region_id","item_id","observed_at")
);
--> statement-breakpoint
CREATE TABLE "player_usernames" (
	"player_id" uuid NOT NULL,
	"username" varchar(12) NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_usernames_pk" PRIMARY KEY("player_id","username")
);
--> statement-breakpoint
CREATE TABLE "player_xp_15m" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_15m_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_15m_xp_positive" CHECK ("player_xp_15m"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_1d" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_1d_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_1d_xp_positive" CHECK ("player_xp_1d"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_1h" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_1h_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_1h_xp_positive" CHECK ("player_xp_1h"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_1mo" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_1mo_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_1mo_xp_positive" CHECK ("player_xp_1mo"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_1w" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_1w_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_1w_xp_positive" CHECK ("player_xp_1w"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_6h" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_6h_pk" PRIMARY KEY("player_id","skill_id","observed_at"),
	CONSTRAINT "player_xp_6h_xp_positive" CHECK ("player_xp_6h"."xp" > 0)
);
--> statement-breakpoint
CREATE TABLE "player_xp_current" (
	"player_id" uuid NOT NULL,
	"skill_id" integer NOT NULL,
	"xp" bigint NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_xp_current_pk" PRIMARY KEY("player_id","skill_id"),
	CONSTRAINT "player_xp_current_xp_nonnegative" CHECK ("player_xp_current"."xp" >= 0)
);
--> statement-breakpoint
CREATE TABLE "players" (
	"player_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(12) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"quest_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "quests_quest_id_nonnegative" CHECK ("quests"."quest_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"skill_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "skills_skill_id_nonnegative" CHECK ("skills"."skill_id" >= 0)
);
--> statement-breakpoint
CREATE TABLE "slayer_log_regions" (
	"slayer_region_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "slayer_log_regions_id_nonnegative" CHECK ("slayer_log_regions"."slayer_region_id" >= 0)
);
--> statement-breakpoint
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_achievement_id_achievements_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("achievement_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_boss_kill_counts" ADD CONSTRAINT "player_boss_kill_counts_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_boss_kill_counts" ADD CONSTRAINT "player_boss_kill_counts_boss_id_bosses_boss_id_fk" FOREIGN KEY ("boss_id") REFERENCES "public"."bosses"("boss_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log" ADD CONSTRAINT "player_drop_log_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log" ADD CONSTRAINT "player_drop_log_boss_region_id_boss_log_regions_boss_region_id_fk" FOREIGN KEY ("boss_region_id") REFERENCES "public"."boss_log_regions"("boss_region_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log" ADD CONSTRAINT "player_drop_log_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log_history" ADD CONSTRAINT "player_drop_log_history_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log_history" ADD CONSTRAINT "player_drop_log_history_boss_region_id_boss_log_regions_boss_region_id_fk" FOREIGN KEY ("boss_region_id") REFERENCES "public"."boss_log_regions"("boss_region_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_drop_log_history" ADD CONSTRAINT "player_drop_log_history_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_quests" ADD CONSTRAINT "player_quests_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_quests" ADD CONSTRAINT "player_quests_quest_id_quests_quest_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("quest_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log" ADD CONSTRAINT "player_slayer_log_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log" ADD CONSTRAINT "player_slayer_log_slayer_region_id_slayer_log_regions_slayer_region_id_fk" FOREIGN KEY ("slayer_region_id") REFERENCES "public"."slayer_log_regions"("slayer_region_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log" ADD CONSTRAINT "player_slayer_log_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log_history" ADD CONSTRAINT "player_slayer_log_history_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log_history" ADD CONSTRAINT "player_slayer_log_history_slayer_region_id_slayer_log_regions_slayer_region_id_fk" FOREIGN KEY ("slayer_region_id") REFERENCES "public"."slayer_log_regions"("slayer_region_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_slayer_log_history" ADD CONSTRAINT "player_slayer_log_history_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_usernames" ADD CONSTRAINT "player_usernames_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_15m" ADD CONSTRAINT "player_xp_15m_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_15m" ADD CONSTRAINT "player_xp_15m_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1d" ADD CONSTRAINT "player_xp_1d_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1d" ADD CONSTRAINT "player_xp_1d_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1h" ADD CONSTRAINT "player_xp_1h_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1h" ADD CONSTRAINT "player_xp_1h_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1mo" ADD CONSTRAINT "player_xp_1mo_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1mo" ADD CONSTRAINT "player_xp_1mo_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1w" ADD CONSTRAINT "player_xp_1w_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_1w" ADD CONSTRAINT "player_xp_1w_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_6h" ADD CONSTRAINT "player_xp_6h_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_6h" ADD CONSTRAINT "player_xp_6h_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_current" ADD CONSTRAINT "player_xp_current_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_xp_current" ADD CONSTRAINT "player_xp_current_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievements_type_idx" ON "achievements" USING btree ("type","achievement_id");--> statement-breakpoint
CREATE INDEX "player_boss_kill_counts_hiscores_idx" ON "player_boss_kill_counts" USING btree ("boss_id","kill_count" DESC NULLS LAST,"player_id");--> statement-breakpoint
CREATE INDEX "player_drop_log_history_chronological_idx" ON "player_drop_log_history" USING btree ("player_id","observed_at");--> statement-breakpoint
CREATE INDEX "player_slayer_log_history_chronological_idx" ON "player_slayer_log_history" USING btree ("player_id","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "player_usernames_username_ci_uidx" ON "player_usernames" USING btree (lower("username"));--> statement-breakpoint
CREATE INDEX "player_usernames_player_id_idx" ON "player_usernames" USING btree ("player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "players_username_ci_uidx" ON "players" USING btree (lower("username"));