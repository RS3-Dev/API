import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

function createDatabase(databaseUrl: string) {
  const sql = postgres(databaseUrl, { prepare: false });

  return {
    db: drizzle(sql, { schema }),
    sql,
  };
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDatabase() {
  if (database) {
    return database.db;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database-backed endpoints");
  }

  database = createDatabase(databaseUrl);
  return database.db;
}

export async function closeDatabase() {
  if (!database) {
    return;
  }

  await database.sql.end();
  database = undefined;
}
