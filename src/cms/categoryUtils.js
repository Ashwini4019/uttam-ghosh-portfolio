import { MAX_IMAGES_PER_CATEGORY } from "./defaults";

export const SUBCATEGORY_CATEGORY_ID = "photographs";

export function categorySupportsSubcategories(category) {
  return category?.id === SUBCATEGORY_CATEGORY_ID;
}

export function hasSubcategories(category) {
  return (
    categorySupportsSubcategories(category) &&
    (category?.subcategories || []).length > 0
  );
}

export function getSubcategoryImageCount(subcategory) {
  return subcategory?.images?.length || 0;
}

export function getCategoryImageCount(category) {
  if (!category) return 0;
  const direct = category.images?.length || 0;
  if (!categorySupportsSubcategories(category)) return direct;

  const nested = (category.subcategories || []).reduce(
    (sum, sub) => sum + getSubcategoryImageCount(sub),
    0
  );
  return direct + nested;
}

export function getCoverImage(category) {
  const firstDirect = category?.images?.[0];
  if (firstDirect) {
    return typeof firstDirect === "string" ? firstDirect : firstDirect.src || "";
  }

  if (!categorySupportsSubcategories(category)) {
    return category?.image || "";
  }

  for (const sub of category?.subcategories || []) {
    const first = sub.images?.[0];
    if (first) {
      return typeof first === "string" ? first : first.src || "";
    }
  }

  return category?.image || "";
}

export function getCoverDescription(category) {
  const firstDirect = category?.images?.[0];
  if (firstDirect && typeof firstDirect !== "string") {
    return firstDirect.description || "";
  }

  if (!categorySupportsSubcategories(category)) {
    return "";
  }

  for (const sub of category?.subcategories || []) {
    const first = sub.images?.[0];
    if (first && typeof first !== "string") {
      return first.description || "";
    }
  }

  return "";
}

export function getImagesForView(category, subcategoryId) {
  if (!category) return [];

  if (subcategoryId) {
    const sub = (category.subcategories || []).find(
      (item) => item.id === subcategoryId
    );
    return sub?.images || [];
  }

  if (hasSubcategories(category)) {
    return [];
  }

  return category.images || [];
}

export function findImageLocation(categories, imageId) {
  for (const category of categories) {
    const directIndex = (category.images || []).findIndex(
      (image) => image.id === imageId
    );
    if (directIndex >= 0) {
      return {
        categoryId: category.id,
        subcategoryId: null,
        imageIndex: directIndex,
      };
    }

    for (const sub of category.subcategories || []) {
      const subIndex = (sub.images || []).findIndex(
        (image) => image.id === imageId
      );
      if (subIndex >= 0) {
        return {
          categoryId: category.id,
          subcategoryId: sub.id,
          imageIndex: subIndex,
        };
      }
    }
  }

  return null;
}

export function getCategoryOptions(categories) {
  const options = [];

  for (const category of categories) {
    if (hasSubcategories(category)) {
      for (const sub of category.subcategories || []) {
        options.push({
          categoryId: category.id,
          subcategoryId: sub.id,
          label: `${category.title} → ${sub.title}`,
        });
      }
    } else {
      options.push({
        categoryId: category.id,
        subcategoryId: null,
        label: category.title,
      });
    }
  }

  return options;
}

export function moveImageInDrafts(
  drafts,
  imageId,
  targetCategoryId,
  targetSubcategoryId
) {
  const source = findImageLocation(drafts, imageId);
  if (!source) return drafts;

  const targetCategory = drafts.find((item) => item.id === targetCategoryId);
  if (!targetCategory) return drafts;

  let imageToMove = null;

  const withoutSource = drafts.map((category) => {
    if (category.id !== source.categoryId) return category;

    if (source.subcategoryId) {
      return {
        ...category,
        subcategories: (category.subcategories || []).map((sub) => {
          if (sub.id !== source.subcategoryId) return sub;
          const images = [...(sub.images || [])];
          imageToMove = images[source.imageIndex];
          images.splice(source.imageIndex, 1);
          return { ...sub, images };
        }),
      };
    }

    const images = [...(category.images || [])];
    imageToMove = images[source.imageIndex];
    images.splice(source.imageIndex, 1);
    return { ...category, images };
  });

  if (!imageToMove) return drafts;

  return withoutSource.map((category) => {
    if (category.id !== targetCategoryId) return category;

    if (targetSubcategoryId) {
      return {
        ...category,
        subcategories: (category.subcategories || []).map((sub) => {
          if (sub.id !== targetSubcategoryId) return sub;
          const images = [...(sub.images || []), imageToMove].slice(
            0,
            MAX_IMAGES_PER_CATEGORY
          );
          return { ...sub, images };
        }),
      };
    }

    return {
      ...category,
      images: [...(category.images || []), imageToMove].slice(
        0,
        MAX_IMAGES_PER_CATEGORY
      ),
    };
  });
}
