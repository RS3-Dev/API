import { app } from "../app";
import { closeDatabase } from "./client";

if (process.env.SEED_DATABASE_HOST && process.env.SEED_DATABASE_PORT) {
  const { PGDATABASE, PGPASSWORD, PGUSER } = process.env;

  if (!PGDATABASE || !PGPASSWORD || !PGUSER) {
    throw new Error("PGDATABASE, PGPASSWORD, and PGUSER are required for proxy checks");
  }

  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${process.env.SEED_DATABASE_HOST}:${process.env.SEED_DATABASE_PORT}/${encodeURIComponent(PGDATABASE)}?sslmode=require`;
}

const paths = [
  "/v1/players/thejoshj/xp",
  "/v1/players/OldJosh/xp/history?days=60&interval=auto",
  "/v1/players/thejoshj/bosses",
  "/v1/bosses/1001/hiscores",
  "/v1/players/thejoshj/drops",
  "/v1/players/thejoshj/drops/history",
  "/v1/players/thejoshj/slayer",
  "/v1/players/thejoshj/slayer/history",
  "/v1/players/thejoshj/quests",
  "/v1/players/thejoshj/achievements?type=combat",
  "/v1/reference/skills",
  "/v1/reference/achievements?type=combat",
] as const;

try {
  const bodies = new Map<string, unknown>();

  for (const path of paths) {
    const response = await app.request(path);

    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}: ${await response.text()}`);
    }

    bodies.set(path, await response.json());
  }

  const currentXp = bodies.get(paths[0]) as {
    playerId?: string;
    skills?: unknown[];
  };
  const renamedPlayerHistory = bodies.get(paths[1]) as {
    playerId?: string;
    skills?: unknown[];
  };
  const hiscores = bodies.get(paths[3]) as { entries?: unknown[] };

  if (
    currentXp.playerId !== "6f758677-966a-4435-9859-e1b706478f48" ||
    currentXp.skills?.length !== 3 ||
    renamedPlayerHistory.playerId !== currentXp.playerId ||
    !renamedPlayerHistory.skills?.length ||
    !hiscores.entries?.length
  ) {
    throw new Error("Mock data did not satisfy the expected API relationships");
  }

  console.log(`Database smoke check passed for ${paths.length} routes.`);
} finally {
  await closeDatabase();
}
