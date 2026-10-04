import { dbPool } from "./db";
import { CMS_SEEDS, type CmsCollection, type CmsRecord } from "./cms-data";
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

  schemaReady ??= dbPool.query("CREATE TABLE IF NOT EXISTS nghieng_content_items (collection TEXT NOT NULL, record_id TEXT NOT NULL, payload JSON NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (collection, record_id))").then(() => undefined).catch((error: unknown) => {
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

async function initializeCmsStore() {
  await ensureSchema();
  seedReady ??= (async () => {
    const client = await dbPool.connect();
    try {
      await client.query("BEGIN");
      await client.query("LOCK TABLE nghieng_content_items IN SHARE ROW EXCLUSIVE MODE");
      for (const collection of Object.keys(CMS_SEEDS) as CmsCollection[]) {
        await seedCollection(collection, client);
      }
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
  const { rows } = await dbPool.query<{ payload: CmsRecord }>("SELECT payload FROM nghieng_content_items WHERE collection = $1 AND deleted = FALSE ORDER BY sort_order ASC, record_id ASC", [collection]);
  return rows.map((row) => row.payload);
}

export async function replaceCollection(collection: CmsCollection, items: CmsRecord[]) {
  await initializeCmsStore();
  const validItems = items.filter((item): item is CmsRecord & { id: string } => typeof item.id === "string" && item.id.length > 0);
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
  const { rowCount } = await dbPool.query("UPDATE nghieng_content_items SET deleted = TRUE, updated_at = NOW() WHERE collection = $1 AND record_id = $2 AND deleted = FALSE", [collection, id]);
  return rowCount ?? 0;
}
