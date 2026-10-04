import type { CmsCollection, CmsRecordMap } from "./cms-data";
import { readCollection } from "./cms-store";

export async function getCmsCollection<K extends CmsCollection>(collection: K): Promise<CmsRecordMap[K][]> {
  return await readCollection(collection) as CmsRecordMap[K][];
}
