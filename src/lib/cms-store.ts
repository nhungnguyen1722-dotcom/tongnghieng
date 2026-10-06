import { dbPool } from "./db";
import { CMS_SEEDS, type CmsAccount, type CmsCollection, type CmsRecord } from "./cms-data";
import type { PoolClient } from "pg";

let schemaReady: Promise<void> | undefined;
let seedReady: Promise<void> | undefined;

export function isCmsCollection(value: string): value is CmsCollection {
  return Object.hasOwn(CMS_SEEDS, value);
}

function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    return Promise.reject(new Error("DATABASE_URL is not configured."));
  }

  schemaReady ??= (async () => {
    await dbPool.query("CREATE TABLE IF NOT EXISTS nghieng_content_items (collection TEXT NOT NULL, record_id TEXT NOT NULL, payload JSON NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (collection, record_id))");
    await dbPool.query("CREATE TABLE IF NOT EXISTS public.users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL, status TEXT NOT NULL, password_hash TEXT, password_change_required BOOLEAN NOT NULL DEFAULT FALSE, sort_order INTEGER NOT NULL DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  })().catch((error: unknown) => {
    schemaReady = undefined;
    throw error;
  });

  return schemaReady;
}

function seedItems(collection: CmsCollection) {
  return CMS_SEEDS[collection] as CmsRecord[];
}

async function seedCollection(collection: CmsCollection, client?: PoolClient) {
  const payload = JSON.stringify(seedItems(collection));
  const query = client ? client.query.bind(client) : dbPool.query.bind(dbPool);
  await query("INSERT INTO nghieng_content_items (collection, record_id, payload, sort_order) SELECT $1, item->>'id', item, (row_number() OVER ())::INTEGER - 1 FROM json_array_elements($2::JSON) AS records(item) WHERE NOT EXISTS (SELECT 1 FROM nghieng_content_items stored WHERE stored.collection = $1 AND stored.record_id = item->>'id')", [collection, payload]);
}

async function seedUsersTable(client: PoolClient) {
  const count = await client.query<{ count: number }>("SELECT COUNT(*)::INTEGER AS count FROM public.users");
  if (count.rows[0].count > 0) return;

  const legacy = await client.query<{ payload: CmsAccount & { passwordHash?: string }; sort_order: number }>("SELECT payload, sort_order FROM nghieng_content_items WHERE collection = 'users' AND deleted = FALSE ORDER BY sort_order ASC, record_id ASC");
  const accounts = legacy.rows.length > 0
    ? legacy.rows.map((row) => ({ account: row.payload, sortOrder: row.sort_order }))
    : (seedItems("users") as CmsAccount[]).map((account, sortOrder) => ({ account, sortOrder }));

  for (const { account, sortOrder } of accounts) {
    await client.query(
      "INSERT INTO public.users (id, name, email, role, status, password_hash, password_change_required, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [account.id, account.name, account.email, account.role, account.status, account.passwordHash ?? null, account.passwordChangeRequired ?? false, sortOrder],
    );
  }
}

async function initializeCmsStore() {
  await ensureSchema();
  seedReady ??= (async () => {
    const client = await dbPool.connect();
    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE nghieng_content_items IN SHARE ROW EXCLUSIVE MODE");
      for (const collection of Object.keys(CMS_SEEDS) as CmsCollection[]) {
        if (collection === "users") continue;
        await seedCollection(collection, client);
      }
      await client.query("LOCK TABLE public.users IN SHARE ROW EXCLUSIVE MODE");
      await seedUsersTable(client);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })().catch((error: unknown) => {
    seedReady = undefined;
    throw error;
  });
  await seedReady;
}

export async function readCollection(collection: CmsCollection): Promise<CmsRecord[]> {
  await initializeCmsStore();
  if (collection === "users") {
    const { rows } = await dbPool.query<{
      id: string;
      name: string;
      email: string;
      role: CmsAccount["role"];
      status: CmsAccount["status"];
      password_hash: string | null;
      password_change_required: boolean;
    }>("SELECT id, name, email, role, status, password_hash, password_change_required FROM public.users WHERE deleted = FALSE ORDER BY sort_order ASC, id ASC");
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      passwordChangeRequired: row.password_change_required,
      ...(row.password_hash ? { passwordHash: row.password_hash } : {}),
    } as CmsRecord));
  }
  const { rows } = await dbPool.query<{ payload: CmsRecord }>("SELECT payload FROM nghieng_content_items WHERE collection = $1 AND deleted = FALSE ORDER BY sort_order ASC, record_id ASC", [collection]);
  return rows.map((row) => row.payload);
}

export async function replaceCollection(collection: CmsCollection, items: CmsRecord[]) {
  await initializeCmsStore();
  const validItems = items.filter((item): item is CmsRecord & { id: string } => typeof item.id === "string" && item.id.length > 0);
  if (collection === "users") {
    const accounts = validItems as Array<CmsAccount & { passwordHash?: string }>;
    if (!accounts.some((account) => account.role === "Admin" && account.status === "Active")) {
      throw new Error("At least one active Admin account must remain.");
    }
    const payload = JSON.stringify(accounts);
    const ids = accounts.map((account) => account.id);
    const client = await dbPool.connect();

    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE public.users IN SHARE ROW EXCLUSIVE MODE");
      await client.query("UPDATE public.users SET deleted = TRUE, updated_at = NOW() WHERE deleted = FALSE AND NOT (id = ANY($1::TEXT[]))", [ids]);
      await client.query(
        "WITH incoming AS (SELECT item->>'id' AS id, item->>'name' AS name, item->>'email' AS email, item->>'role' AS role, item->>'status' AS status, item->>'passwordHash' AS password_hash, COALESCE((item->>'passwordChangeRequired')::BOOLEAN, FALSE) AS password_change_required, (row_number() OVER ())::INTEGER - 1 AS sort_order FROM json_array_elements($1::JSON) AS records(item)) UPDATE public.users AS stored SET name = incoming.name, email = incoming.email, role = incoming.role, status = incoming.status, password_hash = COALESCE(incoming.password_hash, stored.password_hash), password_change_required = incoming.password_change_required, sort_order = incoming.sort_order, deleted = FALSE, updated_at = NOW() FROM incoming WHERE stored.id = incoming.id",
        [payload],
      );
      await client.query(
        "INSERT INTO public.users (id, name, email, role, status, password_hash, password_change_required, sort_order) SELECT item->>'id', item->>'name', item->>'email', item->>'role', item->>'status', item->>'passwordHash', COALESCE((item->>'passwordChangeRequired')::BOOLEAN, FALSE), (row_number() OVER ())::INTEGER - 1 FROM json_array_elements($1::JSON) AS records(item) WHERE NOT EXISTS (SELECT 1 FROM public.users stored WHERE stored.id = item->>'id')",
        [payload],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return validItems.length;
  }

  const payload = JSON.stringify(validItems);
  const ids = validItems.map((item) => item.id);
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");
    await client.query("UPDATE nghieng_content_items SET deleted = TRUE, updated_at = NOW() WHERE collection = $1 AND deleted = FALSE AND NOT (record_id = ANY($2::TEXT[]))", [collection, ids]);
    await client.query("WITH incoming AS (SELECT item->>'id' AS record_id, item AS payload, (row_number() OVER ())::INTEGER - 1 AS sort_order FROM json_array_elements($2::JSON) AS records(item)) UPDATE nghieng_content_items AS stored SET payload = incoming.payload, sort_order = incoming.sort_order, deleted = FALSE, updated_at = NOW() FROM incoming WHERE stored.collection = $1 AND stored.record_id = incoming.record_id", [collection, payload]);
    await client.query("INSERT INTO nghieng_content_items (collection, record_id, payload, sort_order, deleted, updated_at) SELECT $1, item->>'id', item, (row_number() OVER ())::INTEGER - 1, FALSE, NOW() FROM json_array_elements($2::JSON) AS records(item) WHERE NOT EXISTS (SELECT 1 FROM nghieng_content_items stored WHERE stored.collection = $1 AND stored.record_id = item->>'id')", [collection, payload]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return validItems.length;
}

export async function removeRecord(collection: CmsCollection, id: string) {
  await initializeCmsStore();
  if (collection === "users") {
    const { rowCount } = await dbPool.query("UPDATE public.users SET deleted = TRUE, updated_at = NOW() WHERE id = $1 AND deleted = FALSE", [id]);
    return rowCount ?? 0;
  }
  const { rowCount } = await dbPool.query("UPDATE nghieng_content_items SET deleted = TRUE, updated_at = NOW() WHERE collection = $1 AND record_id = $2 AND deleted = FALSE", [collection, id]);
  return rowCount ?? 0;
}
