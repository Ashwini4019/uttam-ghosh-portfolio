import { useEffect, useState } from "react";
import {
  MAX_IMAGES_PER_PLACE,
  createEmptyPlace,
  getPlaceCoverImage,
} from "../../cms/placeDefaults";
import { readImagesAsDataUrls } from "../../cms/categoryStore";
import { usePlaces } from "../../cms/usePlaces";
import { detectPlacePublishes } from "../../cms/publishDetector";
import { notifyContentPublished } from "../../api/newsletterApi";

const GALLERY_COLLAPSED_COUNT = 2;

const AdminPlacesSection = ({ onMessage }) => {
  const { places, loading, setPlaces, restoreDefaults } = usePlaces();
  const [drafts, setDrafts] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [expandedGalleries, setExpandedGalleries] = useState(() => new Set());

  const toggleGalleryExpanded = (placeId) => {
    setExpandedGalleries((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!loading) {
      setDrafts(
        places.map((place) => ({
          ...place,
          images: (place.images || []).map((image) => ({ ...image })),
        }))
      );
    }
  }, [places, loading]);

  const updateDraft = (id, patch) => {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
    onMessage("");
  };

  const updateImageDescription = (placeId, imageIndex, description) => {
    setDrafts((prev) =>
      prev.map((place) => {
        if (place.id !== placeId) return place;
        return {
          ...place,
          images: place.images.map((image, index) =>
            index === imageIndex ? { ...image, description } : image
          ),
        };
      })
    );
    onMessage("");
  };

  const handleImagesChange = async (id, fileList) => {
    setErrors((prev) => ({ ...prev, [id]: "" }));
    setUploadingId(id);

    try {
      const current = drafts.find((item) => item.id === id);
      const currentImages = current?.images || [];
      const remainingSlots = MAX_IMAGES_PER_PLACE - currentImages.length;

      const { images, uploadErrors, skipped } = await readImagesAsDataUrls(
        fileList,
        remainingSlots
      );

      if (images.length > 0) {
        updateDraft(id, { images: [...currentImages, ...images] });
      }

      const notices = [];
      if (skipped > 0) {
        notices.push(
          `${skipped} file(s) skipped — max ${MAX_IMAGES_PER_PLACE} images per place`
        );
      }
      if (uploadErrors.length > 0) {
        notices.push(uploadErrors.join(" · "));
      }

      if (notices.length > 0) {
        setErrors((prev) => ({ ...prev, [id]: notices.join(" | ") }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [id]: error.message || "Could not upload images",
      }));
    } finally {
      setUploadingId(null);
    }
  };

  const removeImage = (placeId, imageIndex) => {
    const current = drafts.find((item) => item.id === placeId);
    if (!current) return;

    updateDraft(placeId, {
      images: current.images.filter((_, index) => index !== imageIndex),
    });
    setErrors((prev) => ({ ...prev, [placeId]: "" }));
  };

  const setAsCover = (placeId, imageIndex) => {
    const current = drafts.find((item) => item.id === placeId);
    if (!current || imageIndex === 0) return;

    const nextImages = [...current.images];
    const [selected] = nextImages.splice(imageIndex, 1);
    nextImages.unshift(selected);
    updateDraft(placeId, { images: nextImages });
  };

  const addPlace = () => {
    setDrafts((prev) => [...prev, createEmptyPlace()]);
    onMessage("");
  };

  const removePlace = (id) => {
    const item = drafts.find((draft) => draft.id === id);
    const confirmed = window.confirm(
      `Delete "${item?.title || "this place"}"? This cannot be undone until you save.`
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

  const handleSave = async () => {
    const invalid = drafts.find((item) => !item.title.trim());
    if (invalid) {
      onMessage("");
      setErrors((prev) => ({
        ...prev,
        [invalid.id]: "Title is required",
      }));
      return;
    }

    try {
      const normalizedDrafts = drafts.map((item) => ({
        ...item,
        title: item.title.trim(),
        description: item.description?.trim() || "",
        images: item.images.slice(0, MAX_IMAGES_PER_PLACE),
      }));

      await setPlaces(normalizedDrafts);

      const updates = detectPlacePublishes(places, normalizedDrafts);
      const notifyResult = await notifyContentPublished(updates);

      onMessage(
        notifyResult?.queued
          ? "Places saved to the website. Newsletter readers will be emailed about new photos."
          : "Places saved. Visitors can see them in the About section."
      );
    } catch (error) {
      onMessage("");
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to save places.",
      }));
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset all Places Visited content to the original set?"
    );
    if (!confirmed) return;

    await restoreDefaults();
    setErrors({});
    onMessage("Restored the original Places Visited set.");
  };

  if (loading) {
    return <p className="admin-hint">Loading places…</p>;
  }

  return (
    <>
      <div className="admin-section-actions">
        <button type="button" className="admin-btn secondary" onClick={addPlace}>
          + Add a place
        </button>
        <button type="button" className="admin-btn danger" onClick={handleReset}>
          Restore original places
        </button>
        <button type="button" className="admin-btn primary" onClick={handleSave}>
          Save to website
        </button>
      </div>

      {errors.form ? <p className="admin-error">{errors.form}</p> : null}

      <div className="admin-list">
        {drafts.map((place) => {
          const imageCount = place.images?.length || 0;
          const remaining = MAX_IMAGES_PER_PLACE - imageCount;
          const cover = getPlaceCoverImage(place);
          const isExpanded = expandedGalleries.has(place.id);
          const shouldCollapse = imageCount > GALLERY_COLLAPSED_COUNT;
          const visibleImages =
            isExpanded || !shouldCollapse
              ? place.images
              : place.images.slice(0, GALLERY_COLLAPSED_COUNT);
          const hiddenCount = imageCount - GALLERY_COLLAPSED_COUNT;

          return (
            <article key={place.id} className="admin-card admin-card-wide admin-place-card">
              <div className="admin-preview">
                {cover ? (
                  <img src={cover} alt={place.title || "Place preview"} />
                ) : (
                  <div className="admin-hint" style={{ padding: 16 }}>
                    No photos yet — add pictures on the right
                  </div>
                )}
                {cover ? <span className="cover-badge">Card cover</span> : null}
              </div>

              <div className="admin-fields">
                <div className="admin-field">
                  <label htmlFor={`place-title-${place.id}`}>Place name</label>
                  <input
                    id={`place-title-${place.id}`}
                    type="text"
                    value={place.title}
                    onChange={(event) =>
                      updateDraft(place.id, { title: event.target.value })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor={`place-desc-${place.id}`}>Short story for this place</label>
                  <textarea
                    id={`place-desc-${place.id}`}
                    className="admin-textarea"
                    rows={3}
                    value={place.description || ""}
                    onChange={(event) =>
                      updateDraft(place.id, {
                        description: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label>
                    Pictures ({imageCount}/{MAX_IMAGES_PER_PLACE})
                  </label>
                  <div className="admin-upload">
                    <label
                      className={`admin-upload-label ${
                        remaining <= 0 || uploadingId === place.id
                          ? "disabled"
                          : ""
                      }`}
                    >
                      {uploadingId === place.id ? "Uploading…" : "Add photos"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={remaining <= 0 || uploadingId === place.id}
                        onChange={(event) => {
                          const files = event.target.files;
                          if (files?.length) {
                            handleImagesChange(place.id, files);
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <span className="admin-hint">
                      You can add {remaining} more. Max 10MB each.
                    </span>
                  </div>

                  {imageCount > 0 ? (
                    <div className="gallery-list">
                      {visibleImages.map((image, index) => (
                        <div
                          key={image.id || `${place.id}-${index}`}
                          className="gallery-row"
                        >
                          <div className="gallery-item">
                            <img
                              src={image.src}
                              alt={`${place.title} ${index + 1}`}
                            />
                            {index === 0 ? (
                              <span className="gallery-cover-tag">Card cover</span>
                            ) : null}
                            <div className="gallery-actions">
                              {index !== 0 ? (
                                <button
                                  type="button"
                                  className="gallery-btn"
                                  onClick={() => setAsCover(place.id, index)}
                                >
                                  Use as cover
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="gallery-btn danger"
                                onClick={() => removeImage(place.id, index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="gallery-meta">
                            <label
                              htmlFor={`place-image-desc-${place.id}-${index}`}
                            >
                              Caption for this photo
                            </label>
                            <textarea
                              id={`place-image-desc-${place.id}-${index}`}
                              className="admin-textarea gallery-desc"
                              rows={3}
                              value={image.description || ""}
                              onChange={(event) =>
                                updateImageDescription(
                                  place.id,
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder="Describe this picture"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {shouldCollapse ? (
                    <button
                      type="button"
                      className="gallery-view-all-btn"
                      onClick={() => toggleGalleryExpanded(place.id)}
                    >
                      {isExpanded
                        ? "Show fewer photos"
                        : `Show all ${imageCount} photos (${hiddenCount} hidden)`}
                    </button>
                  ) : null}

                  {errors[place.id] ? (
                    <p className="admin-error">{errors[place.id]}</p>
                  ) : null}
                </div>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => removePlace(place.id)}
                  >
                    Remove this place
                  </button>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => {
                      const match = places.find((item) => item.id === place.id);
                      if (match) {
                        updateDraft(place.id, {
                          title: match.title,
                          description: match.description || "",
                          images: (match.images || []).map((image) => ({
                            ...image,
                          })),
                        });
                        setErrors((prev) => ({ ...prev, [place.id]: "" }));
                      }
                    }}
                  >
                    Undo this place
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};

export default AdminPlacesSection;
