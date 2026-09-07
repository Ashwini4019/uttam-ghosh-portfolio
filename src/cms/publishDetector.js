const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const CONTENT_TYPE_RULES = [
  { pattern: /illustration/i, type: "illustration" },
  { pattern: /political|cartoon/i, type: "political_cartoon" },
  { pattern: /photograph/i, type: "photograph" },
  { pattern: /painting/i, type: "painting" },
  { pattern: /design/i, type: "design" },
  { pattern: /exhibition/i, type: "exhibition" },
  { pattern: /blog/i, type: "blog_post" },
];

export function mapTitleToContentType(title = "") {
  const match = CONTENT_TYPE_RULES.find((rule) => rule.pattern.test(title));
  return match?.type || "artwork";
}

function getImageKey(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.id || image.src || "";
}

function getImageSrc(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.src || "";
}

function collectCategoryImages(category) {
  const images = [...(category.images || [])];
  for (const subcategory of category.subcategories || []) {
    images.push(...(subcategory.images || []));
  }
  return images;
}

function buildWorkLink() {
  return `${SITE_URL}/#work`;
}

function buildAboutLink() {
  return `${SITE_URL}/#about`;
}

export function detectCategoryPublishes(previous = [], next = []) {
  const updates = [];
  const previousMap = new Map(previous.map((category) => [category.id, category]));

  for (const category of next) {
    const previousCategory = previousMap.get(category.id);
    const contentType = mapTitleToContentType(category.title);

    if (!previousCategory) {
      const cover = category.images?.[0] || category.subcategories?.[0]?.images?.[0];
      updates.push({
        contentType: "category",
        title: `New Category: ${category.title}`,
        description:
          category.description ||
          `A new ${category.title} section is now available on the portfolio.`,
        imageUrl: getImageSrc(cover),
        linkUrl: buildWorkLink(),
        fingerprint: `category-new-${category.id}`,
      });
      continue;
    }

    const previousSubcategoryIds = new Set(
      (previousCategory.subcategories || []).map((sub) => sub.id)
    );

    for (const subcategory of category.subcategories || []) {
      if (!previousSubcategoryIds.has(subcategory.id)) {
        const cover = subcategory.images?.[0] || category.images?.[0];
        updates.push({
          contentType,
          title: `New in ${category.title}: ${subcategory.title}`,
          description:
            subcategory.description ||
            category.description ||
            `Explore new work in ${subcategory.title}.`,
          imageUrl: getImageSrc(cover),
          linkUrl: buildWorkLink(),
          fingerprint: `subcategory-new-${subcategory.id}`,
        });
      }
    }

    const previousImageKeys = new Set(
      collectCategoryImages(previousCategory).map(getImageKey)
    );
    const newImages = collectCategoryImages(category).filter(
      (image) => !previousImageKeys.has(getImageKey(image))
    );

    for (const image of newImages.slice(0, 8)) {
      updates.push({
        contentType,
        title: `New ${category.title}${image.description ? `: ${image.description}` : ""}`,
        description:
          image.description ||
          category.description ||
          `New work has been added to ${category.title}.`,
        imageUrl: getImageSrc(image),
        linkUrl: buildWorkLink(),
        fingerprint: `image-${getImageKey(image)}`,
      });
    }
  }

  return updates;
}

export function detectPlacePublishes(previous = [], next = []) {
  const updates = [];
  const previousMap = new Map(previous.map((place) => [place.id, place]));

  for (const place of next) {
    const previousPlace = previousMap.get(place.id);

    if (!previousPlace) {
      const cover = place.images?.[0];
      updates.push({
        contentType: "place",
        title: `Places Visited: ${place.title}`,
        description:
          place.description ||
          `New documentary work from ${place.title} is now on the portfolio.`,
        imageUrl: getImageSrc(cover),
        linkUrl: buildAboutLink(),
        fingerprint: `place-new-${place.id}`,
      });
      continue;
    }

    const previousImageKeys = new Set(
      (previousPlace.images || []).map(getImageKey)
    );
    const newImages = (place.images || []).filter(
      (image) => !previousImageKeys.has(getImageKey(image))
    );

    for (const image of newImages.slice(0, 5)) {
      updates.push({
        contentType: "place",
        title: `New photos from ${place.title}`,
        description:
          image.description ||
          place.description ||
          `New photographs from ${place.title} have been published.`,
        imageUrl: getImageSrc(image),
        linkUrl: buildAboutLink(),
        fingerprint: `place-image-${getImageKey(image)}`,
      });
    }
  }

  return updates;
}

export function detectAboutPublishes(previous, next) {
  if (!previous || !next) return [];

  const updates = [];
  const previousTimelineIds = new Set((previous.timeline || []).map((item) => item.id));

  for (const item of next.timeline || []) {
    if (!previousTimelineIds.has(item.id)) {
      updates.push({
        contentType: "about",
        title: `My Journey: ${item.title}`,
        description:
          item.description ||
          `A new chapter has been added to the career timeline — ${item.period}.`,
        imageUrl: "",
        linkUrl: buildAboutLink(),
        fingerprint: `timeline-new-${item.id}`,
      });
    }
  }

  const bioChanged =
    previous.quote !== next.quote ||
    JSON.stringify(previous.bioParagraphs || []) !==
      JSON.stringify(next.bioParagraphs || []);

  if (bioChanged) {
    updates.push({
      contentType: "portfolio_update",
      title: "About section updated",
      description:
        next.quote ||
        "The artist bio and story on the portfolio have been refreshed.",
      imageUrl: "",
      linkUrl: buildAboutLink(),
      fingerprint: `about-${JSON.stringify(next).length}-${next.quote?.length || 0}`,
    });
  }

  return updates;
}
