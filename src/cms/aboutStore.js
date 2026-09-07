import {
  ABOUT_STORAGE_KEY,
  DEFAULT_ABOUT,
  normalizeAboutContent,
} from "./aboutDefaults";

const ABOUT_CHANGED = "uttam-about-changed";
const DB_NAME = "uttam-ghosh-cms";
const DB_VERSION = 1;
const STORE_NAME = "categories";

function cloneDefaults() {
  return normalizeAboutContent(DEFAULT_ABOUT);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Failed to open CMS database"));
  });
}

async function readFromDb() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(ABOUT_STORAGE_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () =>
      reject(request.error || new Error("Failed to read about content"));
  });
}

async function writeToDb(content) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(content, ABOUT_STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to save about content"));
  });
}

async function clearDb() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(ABOUT_STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to reset about content"));
  });
}

export async function getAboutContent() {
  try {
    const fromDb = await readFromDb();
    if (fromDb) return normalizeAboutContent(fromDb);
    return cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export async function saveAboutContent(content) {
  const payload = normalizeAboutContent({
    quote: content.quote?.trim() || "",
    bioParagraphs: (content.bioParagraphs || [])
      .map((p) => p.trim())
      .filter(Boolean),
    timeline: content.timeline || [],
  });

  await writeToDb(payload);
  window.dispatchEvent(new Event(ABOUT_CHANGED));
}

export async function resetAboutContent() {
  await clearDb();
  window.dispatchEvent(new Event(ABOUT_CHANGED));
  return cloneDefaults();
}

export function subscribeAboutContent(callback) {
  window.addEventListener(ABOUT_CHANGED, callback);
  return () => window.removeEventListener(ABOUT_CHANGED, callback);
}
