import {
  createGalleryImage,
  normalizeGalleryImage,
} from "./defaults";
import {
  DEFAULT_PLACES,
  MAX_IMAGES_PER_PLACE,
  PLACES_STORAGE_KEY,
  getDefaultPlaceById,
} from "./placeDefaults";

const PLACES_CHANGED = "uttam-places-changed";
const DB_NAME = "uttam-ghosh-cms";
const DB_VERSION = 1;
const STORE_NAME = "categories";

function cloneDefaults() {
  return DEFAULT_PLACES.map((place) => ({
    ...place,
    images: place.images.map((image) => ({ ...image })),
  }));
}

function normalizeImages(stored, fallback) {
  if (Array.isArray(stored.images) && stored.images.length > 0) {
    return stored.images
      .map(normalizeGalleryImage)
      .filter(Boolean)
      .slice(0, MAX_IMAGES_PER_PLACE);
  }

  if (fallback?.images?.length) {
    return fallback.images.map((image) => ({ ...image }));
  }

  return [];
}

function normalizePlace(stored) {
  const fallback = getDefaultPlaceById(stored.id);

  return {
    id: stored.id || crypto.randomUUID(),
    title: stored.title?.trim() || fallback?.title || "Untitled",
    description:
      typeof stored.description === "string"
        ? stored.description
        : fallback?.description || "",
    images: normalizeImages(stored, fallback),
  };
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
    const request = store.get(PLACES_STORAGE_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () =>
      reject(request.error || new Error("Failed to read places"));
  });
}

async function writeToDb(places) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(places, PLACES_STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to save places"));
  });
}

async function clearDb() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(PLACES_STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to reset places"));
  });
}

export async function getPlaces() {
  try {
    const fromDb = await readFromDb();
    if (Array.isArray(fromDb) && fromDb.length > 0) {
      return fromDb.map(normalizePlace);
    }
    return cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export async function savePlaces(places) {
  const payload = places.map((place) => ({
    id: place.id,
    title: place.title.trim(),
    description: place.description?.trim() || "",
    images: (place.images || [])
      .map(normalizeGalleryImage)
      .filter(Boolean)
      .slice(0, MAX_IMAGES_PER_PLACE)
      .map((image) => ({
        id: image.id,
        src: image.src,
        description: image.description?.trim() || "",
      })),
  }));

  await writeToDb(payload);
  window.dispatchEvent(new Event(PLACES_CHANGED));
}

export async function resetPlaces() {
  await clearDb();
  window.dispatchEvent(new Event(PLACES_CHANGED));
  return cloneDefaults();
}

export function subscribePlaces(callback) {
  window.addEventListener(PLACES_CHANGED, callback);
  return () => window.removeEventListener(PLACES_CHANGED, callback);
}

export { createGalleryImage };
