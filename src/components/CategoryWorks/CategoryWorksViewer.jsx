import { useEffect, useState } from "react";
import { getCoverImage } from "../../cms/categoryUtils";
import "./CategoryWorksViewer.css";

const CategoryWorksViewer = ({
  open,
  title,
  subtitle,
  images = [],
  subcategories = null,
  onSelectSubcategory,
  onClose,
  onBack,
  showBack = false,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!open) {
      setLightboxIndex(null);
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  const showPrev = () => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    );
  };

  const showNext = () => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % images.length
    );
  };

  return (
    <div className="works-viewer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="works-viewer-backdrop" onClick={onClose} />

      <div className="works-viewer-panel">
        <div className="works-viewer-header">
          <div>
            {showBack && onBack ? (
              <button type="button" className="works-viewer-back" onClick={onBack}>
                ← Back
              </button>
            ) : null}
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="works-viewer-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {subcategories ? (
          <div className="works-subcategory-grid">
            {subcategories.map((sub) => {
              const cover = getCoverImage({
                images: sub.images,
                subcategories: [],
              });
              const count = sub.images?.length || 0;

              return (
                <button
                  key={sub.id}
                  type="button"
                  className="works-subcategory-card"
                  onClick={() => onSelectSubcategory?.(sub)}
                >
                  {cover ? (
                    <img src={cover} alt={sub.title} loading="lazy" />
                  ) : (
                    <div className="works-subcategory-placeholder" />
                  )}
                  <div className="works-subcategory-body">
                    <strong>{sub.title}</strong>
                    {sub.description ? <p>{sub.description}</p> : null}
                    <span>
                      {count} {count === 1 ? "photo" : "photos"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : images.length === 0 ? (
          <p className="works-viewer-empty">
            No images in this section yet. Upload works from the admin panel.
          </p>
        ) : (
          <div className="works-viewer-grid">
            {images.map((image, index) => (
              <button
                key={image.id || `${title}-${index}`}
                type="button"
                className="works-viewer-item"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={image.src}
                  alt={image.description || `${title} ${index + 1}`}
                  loading="lazy"
                />
                {image.description ? (
                  <span>{image.description}</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeImage ? (
        <div
          className="works-lightbox"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="works-lightbox-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="works-lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image"
            >
              ×
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="works-lightbox-nav works-lightbox-prev"
                  onClick={showPrev}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="works-lightbox-nav works-lightbox-next"
                  onClick={showNext}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            ) : null}

            <img
              src={activeImage.src}
              alt={
                activeImage.description || `${title} ${lightboxIndex + 1}`
              }
            />
            {activeImage.description ? (
              <p className="works-lightbox-caption">{activeImage.description}</p>
            ) : null}
            {images.length > 1 ? (
              <p className="works-lightbox-counter">
                {lightboxIndex + 1} / {images.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CategoryWorksViewer;
