/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import type { MapkaTooltipOptions } from "../types/marker.js";

interface TooltipProps extends MapkaTooltipOptions {
  onClose?: () => void;
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-tooltip-icon"
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
      class="mapka-tooltip-icon"
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
      class="mapka-tooltip-icon mapka-tooltip-icon-sm"
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
      class="mapka-tooltip-icon mapka-tooltip-icon-sm"
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

function StarIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      class="mapka-tooltip-icon mapka-tooltip-icon-star"
    >
      <path
        d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z"
        fill="currentColor"
      />
    </svg>
  );
}

function ImageCarousel({
  imageUrls,
  title,
  onFavorite,
  id,
  onClose,
}: {
  imageUrls: string[];
  title?: string;
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
    <div class="mapka-tooltip-carousel">
      <div
        class="mapka-tooltip-carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={title || `Image ${index + 1}`}
            class="mapka-tooltip-carousel-image"
          />
        ))}
      </div>

      <div class="mapka-tooltip-carousel-actions">
        {onFavorite && (
          <button
            type="button"
            class="mapka-tooltip-action-btn"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
          >
            <HeartIcon />
          </button>
        )}
        <button
          type="button"
          class="mapka-tooltip-action-btn"
          onClick={handleCloseClick}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      {imageUrls.length > 1 && (
        <Fragment>
          <button
            type="button"
            class="mapka-tooltip-carousel-btn mapka-tooltip-carousel-prev"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            class="mapka-tooltip-carousel-btn mapka-tooltip-carousel-next"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </button>

          <div class="mapka-tooltip-dots">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                type="button"
                class={`mapka-tooltip-dot ${index === currentIndex ? "mapka-tooltip-dot-active" : ""}`}
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

export function Tooltip({
  id,
  title,
  rating,
  description,
  subtitle,
  price,
  imageUrls,
  onFavorite,
  onClose,
}: TooltipProps) {
  const hasImages = imageUrls && imageUrls.length > 0;

  return (
    <div class="mapka-tooltip">
      {hasImages && (
        <ImageCarousel
          imageUrls={imageUrls}
          title={title}
          onFavorite={onFavorite}
          id={id}
          onClose={onClose}
        />
      )}

      <div class="mapka-tooltip-content">
        {(title || rating) && (
          <div class="mapka-tooltip-header">
            {title && <h3 class="mapka-tooltip-title">{title}</h3>}
            {rating && (
              <div class="mapka-tooltip-rating">
                <StarIcon />
                <span class="mapka-tooltip-rating-value">
                  {rating.value.toFixed(2).replace(".", ",")}
                </span>
                <span class="mapka-tooltip-rating-count">({rating.count})</span>
              </div>
            )}
          </div>
        )}

        {description && <p class="mapka-tooltip-description">{description}</p>}
        {subtitle && <p class="mapka-tooltip-subtitle">{subtitle}</p>}

        {price && (
          <div class="mapka-tooltip-price">
            {price.original && <span class="mapka-tooltip-price-original">{price.original}</span>}
            <span class="mapka-tooltip-price-current">{price.current}</span>
            {price.suffix && <span class="mapka-tooltip-price-suffix">{price.suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
