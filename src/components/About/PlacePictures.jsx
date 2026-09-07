import { forwardRef, useImperativeHandle, useState } from "react";
import ImageLightbox from "./ImageLightbox";
import "./PlacePictures.css";

const PlacePictures = forwardRef(({ placeTitle, images = [] }, ref) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const closeLightbox = () => setLightboxIndex(null);

  const openLightbox = (index = 0) => {
    if (!images.length) return;
    setLightboxIndex(Math.max(0, Math.min(index, images.length - 1)));
  };

  useImperativeHandle(ref, () => ({
    open: openLightbox,
  }));

  if (!images.length) {
    return (
      <div className="place-pictures place-pictures-empty">
        <div className="place-pictures-empty-box">
          <p className="place-pictures-empty-text">
            Photos from this assignment will appear here once uploaded in the
            admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="place-pictures">
      <p className="place-pictures-label">Featured Works</p>
      <div className="place-pictures-grid">
        {images.map((image, index) => (
          <button
            key={image.id || `${placeTitle}-${index}`}
            type="button"
            className="place-picture-item"
            onClick={() => openLightbox(index)}
            aria-label={`View ${image.description || `${placeTitle} photo ${index + 1}`}`}
          >
            <span className="place-picture-frame">
              <img
                src={image.src}
                alt={image.description || `${placeTitle} photo ${index + 1}`}
                loading="lazy"
              />
              <span className="place-picture-zoom" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </span>
            </span>
            {image.description ? (
              <span className="place-picture-caption">{image.description}</span>
            ) : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="place-view-btn"
        onClick={() => openLightbox(0)}
      >
        VIEW WORKS
        <svg
          className="arrow-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      {lightboxIndex !== null ? (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          title={placeTitle}
          onClose={closeLightbox}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
});

PlacePictures.displayName = "PlacePictures";

export default PlacePictures;
