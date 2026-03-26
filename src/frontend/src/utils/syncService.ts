/**
 * DriveEase Firebase Firestore Sync Service
 * Firestore is the PRIMARY data source. localStorage is a fast cache/fallback.
 */

import {
  type Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

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
 * Write a single item directly to Firestore (primary) + localStorage (cache).
 */
export async function pushItem(
  listKey: string,
  item: AnyRecord,
): Promise<void> {
  // Update localStorage cache immediately for fast UI
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
  // Write to Firestore as primary store
  try {
    const ref = doc(db, `de_${listKey}`, item.id);
    await setDoc(ref, item, { merge: true });
  } catch {
    // silently fail – localStorage is the fallback
  }
}

/**
 * Push a full list to Firestore (batch upsert) + update localStorage.
 */
export async function pushList(
  listKey: string,
  items: AnyRecord[],
): Promise<void> {
  if (!items.length) return;
  // Update localStorage cache
  const lsKey = `de_${listKey}`;
  try {
    localStorage.setItem(lsKey, JSON.stringify(items));
  } catch {
    // ignore
  }
  // Write to Firestore
  try {
    const batch = writeBatch(db);
    for (const item of items) {
      const ref = doc(db, `de_${listKey}`, item.id);
      batch.set(ref, item, { merge: true });
    }
    await batch.commit();
  } catch {
    // silently fail
  }
}

/**
 * Pull all documents from Firestore (primary). Falls back to localStorage.
 */
export async function pullList(listKey: string): Promise<AnyRecord[]> {
  try {
    const snap = await getDocs(collection(db, `de_${listKey}`));
    const remote = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as AnyRecord,
    );
    // Update localStorage cache with fresh Firestore data
    if (remote.length > 0) {
      localStorage.setItem(`de_${listKey}`, JSON.stringify(remote));
    }
    return remote;
  } catch {
    // Fall back to localStorage if Firestore unavailable
    try {
      return JSON.parse(
        localStorage.getItem(`de_${listKey}`) || "[]",
      ) as AnyRecord[];
    } catch {
      return [];
    }
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
      }
      // Firestore wins for existing items (status updates etc.)
      const localMap = new Map(local.map((r) => [r.id, r]));
      for (const r of remote)
        localMap.set(r.id, { ...localMap.get(r.id), ...r });
      const merged = Array.from(localMap.values());
      localStorage.setItem(lsKey, JSON.stringify(merged));
      if (newItems.length > 0) {
        window.dispatchEvent(new StorageEvent("storage", { key: lsKey }));
      }
    }),
  );
  return hasNew;
}

/**
 * Push all localStorage data to Firestore (initial seed / recovery).
 */
export async function pushAll(): Promise<void> {
  await Promise.all(
    COLLECTIONS.map(async (key) => {
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

/**
 * Delete an item from Firestore and remove from localStorage cache.
 */
export async function deleteItem(
  listKey: string,
  itemId: string,
): Promise<void> {
  const lsKey = `de_${listKey}`;
  try {
    const local: AnyRecord[] = JSON.parse(localStorage.getItem(lsKey) || "[]");
    localStorage.setItem(
      lsKey,
      JSON.stringify(local.filter((r) => r.id !== itemId)),
    );
  } catch {
    // ignore
  }
  try {
    await deleteDoc(doc(db, `de_${listKey}`, itemId));
  } catch {
    // ignore
  }
}

/**
 * Subscribe to real-time Firestore updates across all tracked collections.
 * Firestore snapshots are the source of truth -- updates localStorage cache
 * and calls the callback when new data arrives.
 * Returns a cleanup function to unsubscribe all listeners.
 */
export function subscribeToChanges(callback: () => void): () => void {
  const unsubs: Unsubscribe[] = [];

  for (const key of COLLECTIONS) {
    const lsKey = `de_${key}`;
    const colRef = collection(db, `de_${key}`);
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const remote = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as AnyRecord,
        );
        if (remote.length === 0) return;
        // Firestore is truth – overwrite localStorage cache
        let local: AnyRecord[] = [];
        try {
          local = JSON.parse(
            localStorage.getItem(lsKey) || "[]",
          ) as AnyRecord[];
        } catch {
          local = [];
        }
        const localMap = new Map(local.map((r) => [r.id, r]));
        let changed = false;
        for (const r of remote) {
          const existing = localMap.get(r.id);
          if (!existing) changed = true;
          localMap.set(r.id, { ...existing, ...r });
        }
        const merged = Array.from(localMap.values());
        localStorage.setItem(lsKey, JSON.stringify(merged));
        if (changed) callback();
      },
      () => {
        // ignore snapshot errors silently
      },
    );
    unsubs.push(unsub);
  }

  return () => {
    for (const u of unsubs) u();
  };
}
