/**
 * DriveEase Sync Service
 * Uses Firestore REST API as primary store. localStorage is a fast cache/fallback.
 */

import { fsDeleteDoc, fsGetCollection, fsSetDoc } from "./firebase";

const COLLECTIONS = [
  "bookings",
  "registrations",
  "enquiries",
  "sub_enquiries",
  "customers",
  "call_recordings",
  "callback_requests",
  "comment_history",
  "staff_call_logs",
  "drivers",
];

type AnyRecord = { id: string; [k: string]: unknown };

/**
 * Write a single item to Firestore (primary) + localStorage (cache).
 */
export async function pushItem(
  listKey: string,
  item: AnyRecord,
): Promise<void> {
  const lsKey = `de_${listKey}`;
  try {
    const local: AnyRecord[] = JSON.parse(localStorage.getItem(lsKey) || "[]");
    const idx = local.findIndex((r) => r.id === item.id);
    if (idx >= 0) local[idx] = { ...local[idx], ...item };
    else local.unshift(item);
    localStorage.setItem(lsKey, JSON.stringify(local));
  } catch {
    // ignore
  }
  await fsSetDoc(`de_${listKey}`, item.id, item as Record<string, unknown>);
}

/**
 * Push a full list to Firestore + update localStorage.
 */
export async function pushList(
  listKey: string,
  items: AnyRecord[],
): Promise<void> {
  if (!items.length) return;
  const lsKey = `de_${listKey}`;
  try {
    localStorage.setItem(lsKey, JSON.stringify(items));
  } catch {
    // ignore
  }
  await Promise.all(
    items.map((item) =>
      fsSetDoc(`de_${listKey}`, item.id, item as Record<string, unknown>),
    ),
  );
}

/**
 * Pull all documents from Firestore (primary). Falls back to localStorage.
 */
export async function pullList(listKey: string): Promise<AnyRecord[]> {
  const remote = await fsGetCollection(`de_${listKey}`);
  if (remote.length > 0) {
    try {
      localStorage.setItem(`de_${listKey}`, JSON.stringify(remote));
    } catch {
      // ignore
    }
    return remote as AnyRecord[];
  }
  try {
    return JSON.parse(
      localStorage.getItem(`de_${listKey}`) || "[]",
    ) as AnyRecord[];
  } catch {
    return [];
  }
}

/**
 * Pull all Firestore collections and merge into localStorage.
 * Returns true if any new items were found.
 */
export async function pullAllAndMerge(): Promise<boolean> {
  let hasNew = false;
  await Promise.all(
    COLLECTIONS.map(async (key) => {
      const lsKey = `de_${key}`;
      try {
        const remote = await fsGetCollection(`de_${key}`);
        const existing = JSON.parse(localStorage.getItem(lsKey) || "[]");
        if (remote.length !== existing.length) hasNew = true;
        if (remote.length > 0) {
          localStorage.setItem(lsKey, JSON.stringify(remote));
        }
      } catch {
        // ignore
      }
    }),
  );
  return hasNew;
}

/**
 * Subscribe to changes (polls every 15s as real-time sub replacement).
 * Returns cleanup function.
 */
export function subscribeToChanges(callback: () => void): () => void {
  let cancelled = false;
  const poll = async () => {
    if (cancelled) return;
    const hasNew = await pullAllAndMerge();
    if (hasNew) callback();
    if (!cancelled) setTimeout(poll, 15000);
  };
  setTimeout(poll, 15000);
  return () => {
    cancelled = true;
  };
}

/**
 * Subscribe to a collection (polls on mount + interval).
 * Returns cleanup function.
 */
export function subscribeToCollection(
  listKey: string,
  callback: (items: AnyRecord[]) => void,
): () => void {
  let cancelled = false;
  const load = async () => {
    if (cancelled) return;
    const items = await pullList(listKey);
    callback(items);
    if (!cancelled) setTimeout(load, 20000);
  };
  load();
  return () => {
    cancelled = true;
  };
}

/**
 * Delete a document from Firestore and localStorage cache.
 */
export async function deleteItem(listKey: string, id: string): Promise<void> {
  const lsKey = `de_${listKey}`;
  try {
    const local: AnyRecord[] = JSON.parse(localStorage.getItem(lsKey) || "[]");
    localStorage.setItem(
      lsKey,
      JSON.stringify(local.filter((r) => r.id !== id)),
    );
  } catch {
    // ignore
  }
  await fsDeleteDoc(`de_${listKey}`, id);
}

/**
 * Push all localStorage collections to Firestore.
 */
export async function pushAll(): Promise<void> {
  await Promise.all(
    COLLECTIONS.map(async (key) => {
      const lsKey = `de_${key}`;
      try {
        const items = JSON.parse(
          localStorage.getItem(lsKey) || "[]",
        ) as AnyRecord[];
        if (items.length > 0) await pushList(key, items);
      } catch {
        // ignore
      }
    }),
  );
}

/**
 * Send an SMS notification via Textbelt free tier.
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  try {
    await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key: "textbelt" }),
    });
  } catch {
    // silent fail
  }
}
