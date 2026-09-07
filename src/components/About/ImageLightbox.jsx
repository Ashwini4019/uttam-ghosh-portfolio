import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ImageLightbox.css";

const SWIPE_THRESHOLD = 48;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const ImageLightbox = ({
  images = [],
  index = 0,
  title = "",
  onClose,
  onIndexChange,
}) => {
  const [slideDir, setSlideDir] = useState(0);
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef(null);
  const overlayRef = useRef(null);

  const count = images.length;
  const active = images[index];
  const prevImage = count > 1 ? images[(index - 1 + count) % count] : null;
  const nextImage = count > 1 ? images[(index + 1) % count] : null;
  const hasMultiple = count > 1;
  const showSideZones = hasMultiple && zoom <= 1;

  const goPrev = () => {
    if (!hasMultiple) return;
    setSlideDir(-1);
    setZoom(1);
    onIndexChange((index - 1 + count) % count);
  };

  const goNext = () => {
    if (!hasMultiple) return;
    setSlideDir(1);
    setZoom(1);
    onIndexChange((index + 1) % count);
  };

  const actionRef = useRef({ goPrev, goNext, onClose });
  actionRef.current = { goPrev, goNext, onClose };

  const toggleZoom = () => {
    setZoom((current) => (current > 1 ? 1 : 1.75));
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") actionRef.current.onClose();
      if (event.key === "ArrowLeft") actionRef.current.goPrev();
      if (event.key === "ArrowRight") actionRef.current.goNext();
    };

    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.18 : 0.18;
      setZoom((current) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta))
      );
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    [prevImage, nextImage, active].forEach((image) => {
      if (!image?.src) return;
      const preload = new Image();
      preload.src = image.src;
    });
  }, [index, prevImage, nextImage, active]);

  const onTouchStart = (event) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={`image-lightbox${zoom > 1 ? " is-zoomed" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} gallery` : "Image viewer"}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        className="image-lightbox-close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close viewer"
      >
        ×
      </button>

      {showSideZones ? (
        <>
          <button
            type="button"
            className="image-lightbox-zone image-lightbox-zone-left"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
          >
            <span className="image-lightbox-arrow" aria-hidden="true">
              ‹
            </span>
            {prevImage ? (
              <span className="image-lightbox-preview">
                <img src={prevImage.src} alt="" />
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className="image-lightbox-zone image-lightbox-zone-right"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
          >
            <span className="image-lightbox-arrow" aria-hidden="true">
              ›
            </span>
            {nextImage ? (
              <span className="image-lightbox-preview">
                <img src={nextImage.src} alt="" />
              </span>
            ) : null}
          </button>
        </>
      ) : null}

      <figure
        className="image-lightbox-stage"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          key={`${active.src}-${index}-${slideDir}`}
          src={active.src}
          alt={active.description || `${title} ${index + 1}`}
          className={`image-lightbox-image${
            slideDir < 0 ? " from-left" : slideDir > 0 ? " from-right" : " from-open"
          }`}
          style={{ "--zoom": zoom > 1 ? zoom : 1.03 }}
          onClick={toggleZoom}
        />

        <figcaption className="image-lightbox-meta">
          {title ? <span className="image-lightbox-title">{title}</span> : null}
          {active.description ? (
            <span className="image-lightbox-caption">{active.description}</span>
          ) : null}
          {hasMultiple ? (
            <span className="image-lightbox-counter">
              {index + 1} / {count}
            </span>
          ) : null}
        </figcaption>

        {count > 1 ? (
          <div className="image-lightbox-thumbs" role="tablist">
            {images.map((image, thumbIndex) => (
              <button
                key={image.id || `${title}-thumb-${thumbIndex}`}
                type="button"
                role="tab"
                aria-selected={thumbIndex === index}
                className={`image-lightbox-thumb${
                  thumbIndex === index ? " is-active" : ""
                }`}
                onClick={() => {
                  setSlideDir(thumbIndex > index ? 1 : -1);
                  setZoom(1);
                  onIndexChange(thumbIndex);
                }}
                aria-label={`View image ${thumbIndex + 1}`}
              >
                <img src={image.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        ) : null}
      </figure>
    </div>,
    document.body
  );
};

export default ImageLightbox;
