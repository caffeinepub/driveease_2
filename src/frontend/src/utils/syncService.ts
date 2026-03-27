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
      const lsKey = `de_${key}`;
      try {
        const snap = await getDocs(collection(db, `de_${key}`));
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const existing = JSON.parse(localStorage.getItem(lsKey) || "[]");
        if (remote.length !== existing.length) hasNew = true;
        if (remote.length > 0) {
          localStorage.setItem(lsKey, JSON.stringify(remote));
        }
      } catch {
        // ignore – Firestore may be unavailable
      }
    }),
  );
  return hasNew;
}

/**
 * Subscribe to a Firestore collection in real-time.
 */
export function subscribeToCollection(
  listKey: string,
  callback: (items: AnyRecord[]) => void,
): Unsubscribe {
  const colRef = collection(db, `de_${listKey}`);
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as AnyRecord,
      );
      callback(items);
    },
    () => {
      // On error, fall back to localStorage
      try {
        const local = JSON.parse(localStorage.getItem(`de_${listKey}`) || "[]");
        callback(local);
      } catch {
        callback([]);
      }
    },
  );
}

/**
 * Delete a document from Firestore and remove from localStorage cache.
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
  try {
    await deleteDoc(doc(db, `de_${listKey}`, id));
  } catch {
    // ignore
  }
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
          if (!localMap.has(r.id)) changed = true;
          localMap.set(r.id, { ...localMap.get(r.id), ...r });
        }
        localStorage.setItem(
          lsKey,
          JSON.stringify(Array.from(localMap.values())),
        );
        if (changed) callback();
      },
      () => {
        /* ignore */
      },
    );
    unsubs.push(unsub);
  }
  return () => {
    for (const u of unsubs) u();
  };
}

/**
 * Send an SMS notification via Textbelt free tier.
 * Silently fails on error.
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  try {
    await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key: "textbelt" }),
    });
  } catch {
    // silent fail – SMS is best-effort
  }
}
