import { CMS_SEEDS, type CmsCollection, type CmsRecord, type CmsRecordMap } from "./cms-data";

export async function loadCmsRecords<K extends CmsCollection>(collection: K): Promise<CmsRecordMap[K][]> {
  try {
    const response = await fetch("/api/cms/" + collection, { cache: "no-store" });
    if (!response.ok) throw new Error("CMS request failed with status " + response.status);
    const result = await response.json() as { items?: CmsRecordMap[K][] };
    if (Array.isArray(result.items)) return result.items;
  } catch {
    // Keep CMS-backed content empty when the shared source is unavailable.
  }
  return [];
}

export async function saveCmsRecords<K extends CmsCollection>(collection: K, items: CmsRecordMap[K][]) {
  try {
    const response = await fetch("/api/cms/" + collection, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (response.ok) {
      return { persisted: true };
    }
    if (response.status === 401 || response.status === 403) return { persisted: false, denied: true };
  } catch {
    // The database is the shared source of truth; do not pretend a browser-only save succeeded.
  }

  return { persisted: false };
}

export function fallbackCmsRecords<K extends CmsCollection>(collection: K) {
  return CMS_SEEDS[collection] as CmsRecordMap[K][];
}

export function hasCmsId(record: CmsRecord): record is CmsRecord & { id: string } {
  return typeof record.id === "string";
}
