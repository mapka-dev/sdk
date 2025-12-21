/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import type { MapkaPopupContent } from "../types/marker.js";

interface PopupProps extends MapkaPopupContent {
  onClose?: () => void;
  closeButton?: boolean;
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-popup-icon"
    >
      <path
        d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-popup-icon"
    >
      <path d="m6 6 20 20M26 6 6 26" fill="none" stroke="currentColor" stroke-width="3" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-popup-icon mapka-popup-icon-sm"
    >
      <path
        d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-popup-icon mapka-popup-icon-sm"
    >
      <path
        d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
      />
    </svg>
  );
}

function ImageCarousel({
  imageUrls,
  title,
  onFavorite,
  id,
  closeButton,
  onClose,
}: {
  imageUrls: string[];
  title?: string;
  closeButton?: boolean;
  onFavorite?: (id: string) => void;
  id?: string;
  onClose?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: Event) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e: Event) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const handleFavoriteClick = (e: Event) => {
    e.stopPropagation();
    if (onFavorite && id) {
      onFavorite(id);
    }
  };

  const handleCloseClick = (e: Event) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div class="mapka-popup-carousel">
      <div
        class="mapka-popup-carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={title || `Image ${index + 1}`}
            class="mapka-popup-carousel-image"
          />
        ))}
      </div>

      <div class="mapka-popup-carousel-actions">
        {onFavorite && (
          <button
            type="button"
            class="mapka-popup-action-btn"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
          >
            <HeartIcon />
          </button>
        )}
        {closeButton && (
          <button
            type="button"
            class="mapka-popup-action-btn"
            onClick={handleCloseClick}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {imageUrls.length > 1 && (
        <Fragment>
          <button
            type="button"
            class="mapka-popup-carousel-btn mapka-popup-carousel-prev"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            class="mapka-popup-carousel-btn mapka-popup-carousel-next"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </button>

          <div class="mapka-popup-dots">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                type="button"
                class={`mapka-popup-dot ${index === currentIndex ? "mapka-popup-dot-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
}

export function PopupContent({
  title,
  description,
  closeButton,
  imageUrls,
  onFavorite,
  onClose,
}: PopupProps) {
  const hasImages = imageUrls && imageUrls.length > 0;

  return (
    <div class="mapka-tooltip">
      {hasImages && (
        <ImageCarousel
          imageUrls={imageUrls}
          title={title}
          closeButton={closeButton}
          onFavorite={onFavorite}
          onClose={onClose}
        />
      )}

      <div class="mapka-popup-content">
        {title && <h3 class="mapka-popup-title">{title}</h3>}
        {description && <p class="mapka-popup-description">{description}</p>}
      </div>
    </div>
  );
}
