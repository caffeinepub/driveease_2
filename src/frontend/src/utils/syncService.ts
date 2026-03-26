/**
 * DriveEase Firebase Firestore Sync Service
 * Real-time cross-device data sync powered by Firebase Firestore.
 */

import {
  type Unsubscribe,
  collection,
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
];

type AnyRecord = { id: string; [k: string]: unknown };

/**
 * Push a single item into a Firestore collection (upsert by id).
 */
export async function pushItem(
  listKey: string,
  item: AnyRecord,
): Promise<void> {
  try {
    const ref = doc(db, `de_${listKey}`, item.id);
    await setDoc(ref, item, { merge: true });
  } catch {
    // silently fail – localStorage is the fallback
  }
}

/**
 * Push a full list to Firestore (batch upsert).
 */
export async function pushList(
  listKey: string,
  items: AnyRecord[],
): Promise<void> {
  if (!items.length) return;
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
 * Pull all documents from a Firestore collection.
 */
export async function pullList(listKey: string): Promise<AnyRecord[]> {
  try {
    const snap = await getDocs(collection(db, `de_${listKey}`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AnyRecord);
  } catch {
    return [];
  }
}

/**
 * Merge remote Firestore data into localStorage for all tracked collections.
 * Remote wins for items that exist in remote but not in local.
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
      // Merge: remote wins for existing items too (status updates etc.)
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
 * Push all localStorage data to Firestore.
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
 * Subscribe to real-time Firestore updates across all tracked collections.
 * Calls callback whenever any collection changes.
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
