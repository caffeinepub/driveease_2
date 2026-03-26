/**
 * DriveEase Cross-Device Sync Service
 * Uses kvdb.io free tier for persistent cross-device storage.
 * Bucket: 5gctJnzuLK9wxcf92E7RQf
 */

const BUCKET = "5gctJnzuLK9wxcf92E7RQf";
const BASE = `https://kvdb.io/${BUCKET}`;
const PREFIX = "de_";

const KEYS = [
  "bookings",
  "registrations",
  "enquiries",
  "sub_enquiries",
  "customers",
  "call_recordings",
  "callback_requests",
  "comment_history",
];

type AnyRecord = { id: string; [k: string]: unknown };

/**
 * Push a single item into a remote list.
 * Fetches the current list, merges by id, and pushes back.
 */
export async function pushItem(
  listKey: string,
  item: AnyRecord,
): Promise<void> {
  try {
    const current = await pullList(listKey);
    const idx = current.findIndex((r) => r.id === item.id);
    if (idx >= 0) current[idx] = item;
    else current.unshift(item);
    await fetch(`${BASE}/${PREFIX}${listKey}`, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(current),
    });
  } catch {
    // silently fail – localStorage is the fallback
  }
}

/**
 * Push a full list to remote storage.
 */
export async function pushList(
  listKey: string,
  items: AnyRecord[],
): Promise<void> {
  try {
    await fetch(`${BASE}/${PREFIX}${listKey}`, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(items),
    });
  } catch {
    // silently fail
  }
}

/**
 * Pull a list from remote storage.
 */
export async function pullList(listKey: string): Promise<AnyRecord[]> {
  try {
    const res = await fetch(`${BASE}/${PREFIX}${listKey}`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text) as AnyRecord[];
  } catch {
    return [];
  }
}

/**
 * Merge remote data into localStorage for all tracked keys.
 * Remote wins for items that exist in remote but not in local.
 * Returns true if any new items were found.
 */
export async function pullAllAndMerge(): Promise<boolean> {
  let hasNew = false;
  await Promise.all(
    KEYS.map(async (key) => {
      const remote = await pullList(key);
      if (remote.length === 0) return;
      const lsKey = `de_${key}`;
      let local: AnyRecord[] = [];
      try {
        local = JSON.parse(localStorage.getItem(lsKey) || "[]") as AnyRecord[];
      } catch {
        local = [];
      }
      const localIds = new Set(local.map((r) => r.id));
      const newItems = remote.filter((r) => !localIds.has(r.id));
      if (newItems.length > 0) {
        hasNew = true;
        const merged = [...newItems, ...local];
        localStorage.setItem(lsKey, JSON.stringify(merged));
        // Dispatch storage event so other components react
        window.dispatchEvent(new StorageEvent("storage", { key: lsKey }));
      }
      // Also update existing items from remote (status changes etc)
      const updatedLocal = local.map((item) => {
        const remoteItem = remote.find((r) => r.id === item.id);
        return remoteItem ? { ...item, ...remoteItem } : item;
      });
      localStorage.setItem(
        lsKey,
        JSON.stringify([...newItems, ...updatedLocal]),
      );
    }),
  );
  return hasNew;
}

/**
 * Push all localStorage data to remote.
 */
export async function pushAll(): Promise<void> {
  await Promise.all(
    KEYS.map(async (key) => {
      const lsKey = `de_${key}`;
      try {
        const items = JSON.parse(
          localStorage.getItem(lsKey) || "[]",
        ) as AnyRecord[];
        if (items.length > 0) {
          await pushList(key, items);
        }
      } catch {
        // ignore
      }
    }),
  );
}
