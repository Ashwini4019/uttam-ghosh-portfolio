import { useEffect, useState } from "react";
import {
  MAX_IMAGES_PER_CATEGORY,
  createEmptyCategory,
  createEmptySubcategory,
} from "../../cms/defaults";
import {
  getCategoryImageCount,
  getCategoryOptions,
  getCoverImage,
  categorySupportsSubcategories,
  hasSubcategories,
  moveImageInDrafts,
} from "../../cms/categoryUtils";
import { readImagesAsDataUrls } from "../../cms/categoryStore";
import { useCategories } from "../../cms/useCategories";
import { detectCategoryPublishes } from "../../cms/publishDetector";
import { notifyContentPublished } from "../../api/newsletterApi";
import { getCategoryTheme } from "../../components/CategoryCard/categoryThemes";

const GALLERY_COLLAPSED_COUNT = 2;

const cloneDrafts = (categories) =>
  categories.map((category) => ({
    ...category,
    images: (category.images || []).map((image) => ({ ...image })),
    subcategories: (category.subcategories || []).map((sub) => ({
      ...sub,
      images: (sub.images || []).map((image) => ({ ...image })),
    })),
  }));

const AdminCategoriesSection = ({ onMessage }) => {
  const { categories, loading, setCategories, restoreDefaults } = useCategories();
  const [drafts, setDrafts] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);
  const [expandedGalleries, setExpandedGalleries] = useState(() => new Set());

  const toggleGalleryExpanded = (key) => {
    setExpandedGalleries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!loading) {
      setDrafts(cloneDrafts(categories));
    }
  }, [categories, loading]);

  const updateDraft = (id, patch) => {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
    onMessage("");
  };

  const updateSubDraft = (categoryId, subId, patch) => {
    setDrafts((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          subcategories: (category.subcategories || []).map((sub) =>
            sub.id === subId ? { ...sub, ...patch } : sub
          ),
        };
      })
    );
    onMessage("");
  };

  const updateImageDescription = (
    categoryId,
    imageIndex,
    description,
    subcategoryId = null
  ) => {
    setDrafts((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;

        if (subcategoryId) {
          return {
            ...category,
            subcategories: (category.subcategories || []).map((sub) => {
              if (sub.id !== subcategoryId) return sub;
              return {
                ...sub,
                images: sub.images.map((image, index) =>
                  index === imageIndex ? { ...image, description } : image
                ),
              };
            }),
          };
        }

        return {
          ...category,
          images: category.images.map((image, index) =>
            index === imageIndex ? { ...image, description } : image
          ),
        };
      })
    );
    onMessage("");
  };

  const handleImagesChange = async (categoryId, fileList, subcategoryId = null) => {
    const key = subcategoryId ? `${categoryId}:${subcategoryId}` : categoryId;
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setUploadingKey(key);

    try {
      const category = drafts.find((item) => item.id === categoryId);
      const currentImages = subcategoryId
        ? category?.subcategories?.find((sub) => sub.id === subcategoryId)?.images || []
        : category?.images || [];
      const remainingSlots = MAX_IMAGES_PER_CATEGORY - currentImages.length;

      const { images, uploadErrors, skipped } = await readImagesAsDataUrls(
        fileList,
        remainingSlots
      );

      if (images.length > 0) {
        if (subcategoryId) {
          updateSubDraft(categoryId, subcategoryId, {
            images: [...currentImages, ...images],
          });
        } else {
          updateDraft(categoryId, { images: [...currentImages, ...images] });
        }
      }

      const notices = [];
      if (skipped > 0) {
        notices.push(
          `${skipped} file(s) skipped — max ${MAX_IMAGES_PER_CATEGORY} images per section`
        );
      }
      if (uploadErrors.length > 0) {
        notices.push(uploadErrors.join(" · "));
      }

      if (notices.length > 0) {
        setErrors((prev) => ({ ...prev, [key]: notices.join(" | ") }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [key]: error.message || "Could not upload images",
      }));
    } finally {
      setUploadingKey(null);
    }
  };

  const removeImage = (categoryId, imageIndex, subcategoryId = null) => {
    const category = drafts.find((item) => item.id === categoryId);
    if (!category) return;

    if (subcategoryId) {
      const sub = category.subcategories.find((item) => item.id === subcategoryId);
      if (!sub) return;
      updateSubDraft(categoryId, subcategoryId, {
        images: sub.images.filter((_, index) => index !== imageIndex),
      });
    } else {
      updateDraft(categoryId, {
        images: category.images.filter((_, index) => index !== imageIndex),
      });
    }

    setErrors((prev) => ({ ...prev, [categoryId]: "" }));
    onMessage("");
  };

  const setAsCover = (categoryId, imageIndex, subcategoryId = null) => {
    if (imageIndex === 0) return;

    const category = drafts.find((item) => item.id === categoryId);
    if (!category) return;

    if (subcategoryId) {
      const sub = category.subcategories.find((item) => item.id === subcategoryId);
      if (!sub) return;
      const nextImages = [...sub.images];
      const [selected] = nextImages.splice(imageIndex, 1);
      nextImages.unshift(selected);
      updateSubDraft(categoryId, subcategoryId, { images: nextImages });
      return;
    }

    const nextImages = [...category.images];
    const [selected] = nextImages.splice(imageIndex, 1);
    nextImages.unshift(selected);
    updateDraft(categoryId, { images: nextImages });
  };

  const addCategory = () => {
    setDrafts((prev) => [...prev, createEmptyCategory()]);
    onMessage("");
  };

  const removeCategory = (id) => {
    const item = drafts.find((draft) => draft.id === id);
    const confirmed = window.confirm(
      `Delete "${item?.title || "this gallery"}" and all of its photos?`
    );
    if (!confirmed) return;

    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    onMessage("");
  };

  const addSubcategory = (categoryId) => {
    setDrafts((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          subcategories: [
            ...(category.subcategories || []),
            createEmptySubcategory(),
          ],
        };
      })
    );
    onMessage("");
  };

  const removeSubcategory = (categoryId, subId) => {
    const category = drafts.find((item) => item.id === categoryId);
    const sub = category?.subcategories?.find((item) => item.id === subId);
    const confirmed = window.confirm(
      `Delete photo group "${sub?.title || "this group"}" and its photos?`
    );
    if (!confirmed) return;

    setDrafts((prev) =>
      prev.map((item) => {
        if (item.id !== categoryId) return item;
        return {
          ...item,
          subcategories: item.subcategories.filter((sub) => sub.id !== subId),
        };
      })
    );
    onMessage("");
  };

  const moveImage = (imageId, targetValue) => {
    const [targetCategoryId, targetSubcategoryId] = targetValue.split("::");
    setDrafts((prev) =>
      moveImageInDrafts(
        prev,
        imageId,
        targetCategoryId,
        targetSubcategoryId || null
      )
    );
    onMessage("");
  };

  const handleSave = async () => {
    const invalid = drafts.find((item) => !item.title.trim());
    if (invalid) {
      onMessage("");
      setErrors((prev) => ({
        ...prev,
        [invalid.id]: "Category title is required",
      }));
      return;
    }

    const invalidSub = drafts
      .filter((category) => categorySupportsSubcategories(category))
      .flatMap((category) =>
        (category.subcategories || []).map((sub) => ({
          categoryId: category.id,
          sub,
        }))
      )
      .find((entry) => !entry.sub.title.trim());

    if (invalidSub) {
      onMessage("");
      setErrors((prev) => ({
        ...prev,
        [`${invalidSub.categoryId}:${invalidSub.sub.id}`]:
          "Subcategory title is required",
      }));
      return;
    }

    try {
      const normalizedDrafts = drafts.map((item) => {
        const supportsSubs = categorySupportsSubcategories(item);
        return {
          ...item,
          title: item.title.trim(),
          description: item.description?.trim() || "",
          images: (item.images || []).slice(0, MAX_IMAGES_PER_CATEGORY),
          subcategories: supportsSubs
            ? (item.subcategories || []).map((sub) => ({
                ...sub,
                title: sub.title.trim(),
                description: sub.description?.trim() || "",
                images: (sub.images || []).slice(0, MAX_IMAGES_PER_CATEGORY),
              }))
            : [],
        };
      });

      await setCategories(normalizedDrafts);

      const updates = detectCategoryPublishes(categories, normalizedDrafts);
      const notifyResult = await notifyContentPublished(updates);

      onMessage(
        notifyResult?.queued
          ? "Galleries saved to the website. Newsletter readers will be emailed about new work."
          : "Galleries saved. Visitors can see the new photos on the home page."
      );
    } catch (error) {
      onMessage("");
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to save.",
      }));
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset all galleries and photos to the original set?"
    );
    if (!confirmed) return;

    await restoreDefaults();
    setErrors({});
    onMessage("Restored the original galleries.");
  };

  const renderImageList = (
    category,
    images,
    subcategoryId = null,
    options = []
  ) => {
    const key = subcategoryId ? `${category.id}:${subcategoryId}` : category.id;
    const imageCount = images.length;
    const remaining = MAX_IMAGES_PER_CATEGORY - imageCount;
    const uploading = uploadingKey === key;
    const isExpanded = expandedGalleries.has(key);
    const shouldCollapse = imageCount > GALLERY_COLLAPSED_COUNT;
    const visibleImages =
      isExpanded || !shouldCollapse
        ? images
        : images.slice(0, GALLERY_COLLAPSED_COUNT);
    const hiddenCount = imageCount - GALLERY_COLLAPSED_COUNT;

    return (
      <div className="admin-field">
        <label>
          Photos in this gallery ({imageCount}/{MAX_IMAGES_PER_CATEGORY})
        </label>
        <div className="admin-upload">
          <label
            className={`admin-upload-label ${
              remaining <= 0 || uploading ? "disabled" : ""
            }`}
          >
            {uploading ? "Uploading…" : "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={remaining <= 0 || uploading}
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  handleImagesChange(category.id, files, subcategoryId);
                }
                event.target.value = "";
              }}
            />
          </label>
          <span className="admin-hint">
            You can add {remaining} more. JPG, PNG, or WebP. Max 10MB each.
          </span>
        </div>

        {imageCount > 0 ? (
          <div className="gallery-list">
            {visibleImages.map((image, index) => (
              <div key={image.id || `${key}-${index}`} className="gallery-row">
                <div className="gallery-item">
                  <img src={image.src} alt={`${category.title} ${index + 1}`} />
                  {index === 0 ? (
                    <span className="gallery-cover-tag">Homepage cover</span>
                  ) : null}
                  <div className="gallery-actions">
                    {index !== 0 ? (
                      <button
                        type="button"
                        className="gallery-btn"
                        onClick={() =>
                          setAsCover(category.id, index, subcategoryId)
                        }
                      >
                        Use as cover
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="gallery-btn danger"
                      onClick={() =>
                        removeImage(category.id, index, subcategoryId)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="gallery-meta">
                  <label htmlFor={`image-desc-${key}-${index}`}>
                    Caption for this photo
                  </label>
                  <textarea
                    id={`image-desc-${key}-${index}`}
                    className="admin-textarea gallery-desc"
                    rows={3}
                    value={image.description || ""}
                    onChange={(event) =>
                      updateImageDescription(
                        category.id,
                        index,
                        event.target.value,
                        subcategoryId
                      )
                    }
                    placeholder="What should visitors know about this photo?"
                  />

                  <label htmlFor={`image-move-${key}-${index}`}>
                    Move this photo to another gallery
                  </label>
                  <select
                    id={`image-move-${key}-${index}`}
                    className="admin-select"
                    value=""
                    onChange={(event) => {
                      if (!event.target.value) return;
                      moveImage(image.id, event.target.value);
                      event.target.value = "";
                    }}
                  >
                    <option value="">Choose a gallery…</option>
                    {options.map((option) => (
                      <option
                        key={`${option.categoryId}-${option.subcategoryId || "root"}`}
                        value={`${option.categoryId}::${option.subcategoryId || ""}`}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {shouldCollapse ? (
          <button
            type="button"
            className="gallery-view-all-btn"
            onClick={() => toggleGalleryExpanded(key)}
          >
            {isExpanded
              ? "Show fewer photos"
              : `Show all ${imageCount} photos (${hiddenCount} hidden)`}
          </button>
        ) : null}

        {errors[key] ? <p className="admin-error">{errors[key]}</p> : null}
      </div>
    );
  };

  if (loading) {
    return <p className="admin-hint">Loading categories…</p>;
  }

  const destinationOptions = getCategoryOptions(drafts);

  return (
    <>
      <div className="admin-section-actions">
        <button type="button" className="admin-btn secondary" onClick={addCategory}>
          + Add a new gallery
        </button>
        <button type="button" className="admin-btn danger" onClick={handleReset}>
          Restore original galleries
        </button>
        <button type="button" className="admin-btn primary" onClick={handleSave}>
          Save to website
        </button>
      </div>

      {errors.form ? <p className="admin-error">{errors.form}</p> : null}

      <div className="admin-list admin-list-categories">
        {drafts.map((category) => {
          const totalImages = getCategoryImageCount(category);
          const cover = getCoverImage(category);
          const supportsSubs = categorySupportsSubcategories(category);
          const categoryHasSubs = supportsSubs && hasSubcategories(category);
          const theme = getCategoryTheme(category.id, category.title);

          return (
            <article
              key={category.id}
              className="admin-card admin-card-wide admin-category-card"
              style={{
                "--category-accent": theme.color,
                "--category-bg": theme.light,
              }}
            >
              <header className="admin-category-heading">
                <h3 className="admin-category-name">
                  {category.title.trim() || "Untitled category"}
                </h3>
                {supportsSubs ? (
                  <span className="admin-category-badge">Has photo groups</span>
                ) : null}
              </header>

              <div className="admin-preview">
                {cover ? (
                  <img src={cover} alt={category.title || "Category preview"} />
                ) : (
                  <div className="admin-hint" style={{ padding: 16 }}>
                    No cover photo yet — add one below
                  </div>
                )}
                {cover ? <span className="cover-badge">Homepage cover</span> : null}
              </div>

              <div className="admin-fields">
                <div className="admin-field">
                  <label htmlFor={`title-${category.id}`}>Gallery name on the website</label>
                  <input
                    id={`title-${category.id}`}
                    type="text"
                    value={category.title}
                    onChange={(event) =>
                      updateDraft(category.id, { title: event.target.value })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor={`description-${category.id}`}>
                    Short line under the gallery name
                  </label>
                  <textarea
                    id={`description-${category.id}`}
                    className="admin-textarea"
                    rows={3}
                    value={category.description || ""}
                    onChange={(event) =>
                      updateDraft(category.id, {
                        description: event.target.value,
                      })
                    }
                    placeholder="Short line under the gallery name"
                  />
                </div>

                <p className="admin-hint category-count-badge">
                  Photos in this gallery: <strong>{totalImages}</strong>
                </p>

                {!supportsSubs || !categoryHasSubs
                  ? renderImageList(
                      category,
                      category.images || [],
                      null,
                      destinationOptions
                    )
                  : null}

                {supportsSubs ? (
                <div className="subcategory-panel">
                  <div className="subcategory-panel-header">
                    <h3>Photo groups inside Photographs</h3>
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => addSubcategory(category.id)}
                    >
                      + Add a photo group
                    </button>
                  </div>

                  {categoryHasSubs ? (
                    <div className="subcategory-list">
                      {(category.subcategories || []).map((sub) => (
                        <section
                          key={sub.id}
                          className="subcategory-card"
                        >
                          <div className="admin-field">
                            <label htmlFor={`sub-title-${sub.id}`}>
                              Group name (for example Fashion or News)
                            </label>
                            <input
                              id={`sub-title-${sub.id}`}
                              type="text"
                              value={sub.title}
                              onChange={(event) =>
                                updateSubDraft(category.id, sub.id, {
                                  title: event.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label htmlFor={`sub-desc-${sub.id}`}>
                              Group description
                            </label>
                            <textarea
                              id={`sub-desc-${sub.id}`}
                              className="admin-textarea"
                              rows={2}
                              value={sub.description || ""}
                              onChange={(event) =>
                                updateSubDraft(category.id, sub.id, {
                                  description: event.target.value,
                                })
                              }
                            />
                          </div>

                          <p className="admin-hint">
                            Photos in this group:{" "}
                            <strong>{sub.images?.length || 0}</strong>
                          </p>

                          {renderImageList(
                            category,
                            sub.images || [],
                            sub.id,
                            destinationOptions
                          )}

                          <div className="admin-card-actions">
                            <button
                              type="button"
                              className="admin-btn danger"
                              onClick={() =>
                                removeSubcategory(category.id, sub.id)
                              }
                            >
                              Delete this photo group
                            </button>
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-hint">
                      Photographs can be split into groups such as Fashion, News,
                      Portraits, Street, and Rural Landscapes.
                    </p>
                  )}
                </div>
                ) : null}

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => removeCategory(category.id)}
                  >
                    Delete this gallery
                  </button>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => {
                      const match = categories.find(
                        (item) => item.id === category.id
                      );
                      if (match) {
                        setDrafts((prev) =>
                          prev.map((item) =>
                            item.id === category.id
                              ? cloneDrafts([match])[0]
                              : item
                          )
                        );
                        setErrors((prev) => ({ ...prev, [category.id]: "" }));
                      }
                    }}
                  >
                    Undo this gallery
                  </button>
                </div>

                {errors[category.id] ? (
                  <p className="admin-error">{errors[category.id]}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};

export default AdminCategoriesSection;
