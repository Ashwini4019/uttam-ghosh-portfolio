import { categorySupportsSubcategories } from "./categoryUtils";
import {
  DEFAULT_CATEGORIES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_CATEGORY,
  STORAGE_KEY,
  createGalleryImage,
  getDefaultById,
  normalizeGalleryImage,
  normalizeImageList,
  normalizeSubcategory,
} from "./defaults";

const CATEGORIES_CHANGED = "uttam-categories-changed";
const DB_NAME = "uttam-ghosh-cms";
const DB_VERSION = 1;
const STORE_NAME = "categories";

function cloneDefaults() {
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    images: category.images.map((image) => ({ ...image })),
    subcategories: (category.subcategories || []).map((sub) => ({
      ...sub,
      images: sub.images.map((image) => ({ ...image })),
    })),
  }));
}

function normalizeImages(stored, fallback) {
  if (Array.isArray(stored.images) && stored.images.length > 0) {
    return stored.images
      .map(normalizeGalleryImage)
      .filter(Boolean)
      .slice(0, MAX_IMAGES_PER_CATEGORY);
  }

  if (stored.customImage || stored.image) {
    return [createGalleryImage(stored.customImage || stored.image)];
  }

  return normalizeImageList(null, fallback?.images);
}

function normalizeSubcategories(stored, fallback) {
  const fallbackSubs = fallback?.subcategories || [];

  if (Array.isArray(stored.subcategories)) {
    return stored.subcategories.map((sub) => {
      const match = fallbackSubs.find((item) => item.id === sub.id);
      return normalizeSubcategory(sub, match);
    });
  }

  if (fallbackSubs.length) {
    return fallbackSubs.map((sub) => ({
      ...sub,
      images: sub.images.map((image) => ({ ...image })),
    }));
  }

  return [];
}

function stripSubcategoriesForNonPhotography(category) {
  if (categorySupportsSubcategories(category)) return category;

  if (!category.subcategories?.length) {
    return { ...category, subcategories: [] };
  }

  const mergedImages = [...(category.images || [])];
  for (const sub of category.subcategories) {
    for (const image of sub.images || []) {
      if (mergedImages.length >= MAX_IMAGES_PER_CATEGORY) break;
      mergedImages.push(image);
    }
  }

  return {
    ...category,
    images: mergedImages.slice(0, MAX_IMAGES_PER_CATEGORY),
    subcategories: [],
  };
}

function migrateLegacyPhotographs(category) {
  if (category.id !== "photographs") return category;
  if (!category.subcategories?.length) return category;
  if (!category.images?.length) return category;

  const newsSub =
    category.subcategories.find((sub) => sub.id === "news") ||
    category.subcategories[0];

  return {
    ...category,
    subcategories: category.subcategories.map((sub) =>
      sub.id === newsSub.id
        ? {
            ...sub,
            images: [...category.images, ...(sub.images || [])].slice(
              0,
              MAX_IMAGES_PER_CATEGORY
            ),
          }
        : sub
    ),
    images: [],
  };
}

function normalizeCategory(stored) {
  const fallback = getDefaultById(stored.id);
  const id =
    stored.id === "designs" ? "design-artworks" : stored.id || crypto.randomUUID();

  let category = {
    id,
    title: stored.title?.trim() || fallback?.title || "Untitled",
    description:
      typeof stored.description === "string"
        ? stored.description
        : fallback?.description || "",
    images: normalizeImages(stored, fallback),
    subcategories: normalizeSubcategories(stored, fallback),
  };

  category = migrateLegacyPhotographs(category);
  category = stripSubcategoriesForNonPhotography(category);
  return category;
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
    const request = store.get(STORAGE_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () =>
      reject(request.error || new Error("Failed to read categories"));
  });
}

async function writeToDb(categories) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(categories, STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to save categories"));
  });
}

async function clearDb() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(STORAGE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("Failed to reset categories"));
  });
}

function readLegacyLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map(normalizeCategory);
  } catch {
    return null;
  }
}

function serializeCategory(category) {
  return {
    id: category.id,
    title: category.title.trim(),
    description: category.description?.trim() || "",
    images: (category.images || [])
      .map(normalizeGalleryImage)
      .filter(Boolean)
      .slice(0, MAX_IMAGES_PER_CATEGORY)
      .map((image) => ({
        id: image.id,
        src: image.src,
        description: image.description?.trim() || "",
      })),
    subcategories: (category.subcategories || []).map((sub) => ({
      id: sub.id,
      title: sub.title.trim(),
      description: sub.description?.trim() || "",
      images: (sub.images || [])
        .map(normalizeGalleryImage)
        .filter(Boolean)
        .slice(0, MAX_IMAGES_PER_CATEGORY)
        .map((image) => ({
          id: image.id,
          src: image.src,
          description: image.description?.trim() || "",
        })),
    })),
  };
}

export async function getCategories() {
  try {
    const fromDb = await readFromDb();
    if (Array.isArray(fromDb) && fromDb.length > 0) {
      return fromDb.map(normalizeCategory);
    }

    const legacy = readLegacyLocalStorage();
    if (legacy) {
      await writeToDb(legacy.map(serializeCategory));
      localStorage.removeItem(STORAGE_KEY);
      return legacy;
    }

    return cloneDefaults();
  } catch {
    const legacy = readLegacyLocalStorage();
    return legacy || cloneDefaults();
  }
}

export async function saveCategories(categories) {
  const payload = categories.map(serializeCategory);
  await writeToDb(payload);
  window.dispatchEvent(new Event(CATEGORIES_CHANGED));
}

export async function resetCategories() {
  await clearDb();
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CATEGORIES_CHANGED));
  return cloneDefaults();
}

export function subscribeCategories(callback) {
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CATEGORIES_CHANGED, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CATEGORIES_CHANGED, callback);
  };
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error(`"${file.name}" is not an image file`));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error(`"${file.name}" exceeds the 10MB limit`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}"`));
    reader.readAsDataURL(file);
  });
}

export async function readImagesAsDataUrls(fileList, remainingSlots) {
  const files = Array.from(fileList || []);

  if (files.length === 0) {
    throw new Error("No files selected");
  }

  if (remainingSlots <= 0) {
    throw new Error(
      `This section already has ${MAX_IMAGES_PER_CATEGORY} images`
    );
  }

  const accepted = files.slice(0, remainingSlots);
  const skipped = files.length - accepted.length;
  const images = [];
  const uploadErrors = [];

  for (const file of accepted) {
    try {
      const src = await readImageAsDataUrl(file);
      images.push(createGalleryImage(src));
    } catch (error) {
      uploadErrors.push(error.message);
    }
  }

  return {
    images,
    uploadErrors,
    skipped,
    remainingSlots,
  };
}
