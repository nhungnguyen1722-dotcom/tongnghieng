import { Pool } from "pg";

declare global {
  var postgresPool: Pool | undefined;
}

export const dbPool =
  globalThis.postgresPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 4000,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresPool = dbPool;
}