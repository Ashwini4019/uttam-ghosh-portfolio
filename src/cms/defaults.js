import illustration1 from "../assets/images/illustration.jpeg";
import illustration2 from "../assets/images/illustration-02.jpeg";
import illustration3 from "../assets/images/illustration-03.jpeg";

export const STORAGE_KEY = "uttam-ghosh-browse-categories";
export const MAX_IMAGES_PER_CATEGORY = 30;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function createGalleryImage(src, description = "") {
  return {
    id: crypto.randomUUID(),
    src,
    description: description || "",
  };
}

export function createEmptySubcategory(title = "New Subcategory") {
  return {
    id: crypto.randomUUID(),
    title,
    description: "",
    images: [],
  };
}

const PHOTOGRAPH_SUBCATEGORIES = [
  { id: "fashion", title: "Fashion", description: "Editorial fashion and style photography." },
  { id: "news", title: "News", description: "News and documentary photography from the field." },
  { id: "portraits", title: "Portraits", description: "Portrait studies and character-led frames." },
  {
    id: "street-photography",
    title: "Street Photography",
    description: "Urban scenes, candid moments, and city life.",
  },
  {
    id: "rural-landscapes",
    title: "Rural Landscapes",
    description: "Countryside, villages, and open landscapes across India.",
  },
];

export const DEFAULT_CATEGORIES = [
  {
    id: "illustrations",
    title: "Illustrations",
    description:
      "Editorial illustrations and hand-drawn artwork crafted for print and digital media.",
    images: [
      createGalleryImage(
        illustration1,
        "Signature editorial illustration from the archive."
      ),
    ],
    subcategories: [],
  },
  {
    id: "political-cartoons",
    title: "Political Cartoons",
    description:
      "Political commentary and satire through editorial cartooning.",
    images: [],
    subcategories: [],
  },
  {
    id: "photographs",
    title: "Photographs",
    description:
      "Story-driven photography capturing people, places, and moments with an editorial eye.",
    images: [],
    subcategories: PHOTOGRAPH_SUBCATEGORIES.map((sub) => ({
      ...sub,
      images:
        sub.id === "news"
          ? [
              createGalleryImage(
                illustration2,
                "Documentary photograph capturing a defining moment."
              ),
            ]
          : [],
    })),
  },
  {
    id: "design-artworks",
    title: "Design & Other Artworks",
    description:
      "Graphic design, visual concepts, and other creative works beyond camera and ink.",
    images: [
      createGalleryImage(
        illustration3,
        "Design concept and graphic artwork sample."
      ),
    ],
    subcategories: [],
  },
  {
    id: "paintings",
    title: "Paintings",
    description:
      "Original paintings and canvas work — a distinct body of work alongside editorial practice.",
    images: [],
    subcategories: [],
  },
];

export function createEmptyCategory() {
  return {
    id: crypto.randomUUID(),
    title: "New Category",
    description: "",
    images: [],
    subcategories: [],
  };
}

export function getDefaultById(id) {
  if (id === "designs") {
    return DEFAULT_CATEGORIES.find((category) => category.id === "design-artworks");
  }
  return DEFAULT_CATEGORIES.find((category) => category.id === id);
}

export function normalizeGalleryImage(entry) {
  if (!entry) return null;

  if (typeof entry === "string") {
    return createGalleryImage(entry);
  }

  if (typeof entry === "object" && entry.src) {
    return {
      id: entry.id || crypto.randomUUID(),
      src: entry.src,
      description:
        typeof entry.description === "string" ? entry.description : "",
    };
  }

  return null;
}

export function normalizeSubcategory(entry, fallback) {
  return {
    id: entry?.id || fallback?.id || crypto.randomUUID(),
    title: entry?.title?.trim() || fallback?.title || "Untitled",
    description:
      typeof entry?.description === "string"
        ? entry.description
        : fallback?.description || "",
    images: normalizeImageList(entry?.images, fallback?.images),
  };
}

export function normalizeImageList(storedImages, fallbackImages) {
  if (Array.isArray(storedImages) && storedImages.length > 0) {
    return storedImages
      .map(normalizeGalleryImage)
      .filter(Boolean)
      .slice(0, MAX_IMAGES_PER_CATEGORY);
  }

  if (fallbackImages?.length) {
    return fallbackImages.map((image) => ({ ...image }));
  }

  return [];
}

export {
  getCategoryImageCount,
  getCoverDescription,
  getCoverImage,
  categorySupportsSubcategories,
  hasSubcategories,
} from "./categoryUtils";
