/**
 * Firebase/Firestore REST API client.
 * Uses fetch-based Firestore REST API to avoid needing the firebase npm package.
 */

const PROJECT_ID = "driveease-66a6b";
const API_KEY = "AIzaSyDosJWyRjTFNGknJzQ6KLbddr666RPRBS0";

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

function toFirestoreValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: FirestoreValue): unknown {
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("stringValue" in val) return val.stringValue;
  if ("arrayValue" in val)
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in val) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

export function objectToFields(
  obj: Record<string, unknown>,
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

export function fieldsToObject(
  fields: Record<string, FirestoreValue>,
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    obj[k] = fromFirestoreValue(v);
  }
  return obj;
}

/** Write/merge a document into a collection */
export async function fsSetDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}&updateMask.fieldPaths=${Object.keys(data).join("&updateMask.fieldPaths=")}`;
  try {
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: objectToFields(data) }),
    });
  } catch {
    // silent fail
  }
}

/** Get all documents in a collection */
export async function fsGetCollection(
  collection: string,
): Promise<Array<Record<string, unknown>>> {
  const url = `${BASE_URL}/${collection}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map((doc: any) => ({
      id: doc.name.split("/").pop(),
      ...fieldsToObject(doc.fields || {}),
    }));
  } catch {
    return [];
  }
}

/** Delete a document */
export async function fsDeleteDoc(
  collection: string,
  docId: string,
): Promise<void> {
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  try {
    await fetch(url, { method: "DELETE" });
  } catch {
    // silent fail
  }
}

export const PROJECT = PROJECT_ID;
