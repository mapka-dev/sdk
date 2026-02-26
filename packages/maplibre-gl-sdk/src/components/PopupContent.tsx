import { Fragment, type MouseEventHandler } from "preact";
import { useState } from "preact/hooks";
import type { MapkaPopupContent } from "../types/popup.js";
import { ChevronRightIcon } from "./ChevronRightIcon.js";
import { ChevronLeftIcon } from "./ChevronLeftIcon.js";
import { HeartIcon } from "./HeartIcon.js";
import { CloseIcon } from "./CloseIcon.js";

interface PopupProps extends MapkaPopupContent {
  onClose?: () => void;
  closeButton?: boolean;
}

function PrimaryButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const handleClick = (e: Event) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button type="button" class="mapka-popup-button-primary" onClick={handleClick}>
      {label}
    </button>
  );
}

function ImageCarousel({
  imageUrls,
  title,
  onFavorite,
  id,
}: {
  imageUrls: string[];
  title?: string;
  onFavorite?: (id: string) => void;
  id?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFirstImage = currentIndex === 0;
  const isLastImage = currentIndex === imageUrls.length - 1;

  const handlePrev = (e: Event) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = (e: Event) => {
    e.stopPropagation();
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFavoriteClick = (e: Event) => {
    e.stopPropagation();
    if (onFavorite && id) {
      onFavorite(id);
    }
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
            class="mapka-popup-carousel-image mapka-popup-image"
          />
        ))}
      </div>

      {onFavorite && (
        <div class="mapka-popup-carousel-actions">
          <button
            type="button"
            class="mapka-popup-action-btn"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
          >
            <HeartIcon />
          </button>
        </div>
      )}

      {imageUrls.length > 1 && (
        <Fragment>
          {!isFirstImage && (
            <button
              type="button"
              class="mapka-popup-carousel-btn mapka-popup-carousel-prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
          )}
          {!isLastImage && (
            <button
              type="button"
              class="mapka-popup-carousel-btn mapka-popup-carousel-next"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          )}

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

function displayRowValue(value: unknown) {
  if (value == null) {
    return "";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return String(value);
}

function displayRowName(name: string) {
  return name.replace(/_/g, " ");
}

export function CloseButton({ onClose }: { onClose?: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button type="button" class="mapka-popup-close-btn" onClick={onClose} aria-label="Close">
      <CloseIcon />
    </button>
  );
}

export function PopupContent({
  title,
  description,
  rows,
  closeButton,
  imageUrls = [],
  primaryAction,
  onFavorite,
  onClose,
}: PopupProps) {
  const hasImages = imageUrls && imageUrls.length > 0;
  const hasRows = rows && rows.length > 0;

  const handleCloseClick = (e: Event) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div class="mapka-popup">
      {closeButton && <CloseButton onClose={handleCloseClick} />}
      {hasImages && <ImageCarousel imageUrls={imageUrls} title={title} onFavorite={onFavorite} />}

      <div class="mapka-popup-content">
        {title && <h3 class="mapka-popup-title">{title}</h3>}
        {description && <p class="mapka-popup-description">{description}</p>}

        {hasRows && (
          <dl class="mapka-popup-rows">
            {rows.map((row, index) => (
              <div key={index} class="mapka-popup-row">
                <dt class="mapka-popup-row-label">{displayRowName(row.name)}</dt>
                <dd class="mapka-popup-row-value">{displayRowValue(row.value)}</dd>
              </div>
            ))}
          </dl>
        )}

        {primaryAction && (
          <div class="mapka-popup-actions">
            <PrimaryButton label={primaryAction.label} onClick={primaryAction.onClick} />
          </div>
        )}
      </div>
    </div>
  );
}

export function CompactPopupContent({ title, description, rows, imageUrls = [] }: PopupProps) {
  const hasRows = rows && rows.length > 0;
  const [firstImage] = imageUrls;

  return (
    <div class="mapka-popup mapka-popup-compact">
      <div class="mapka-popup-compact-header">
        {firstImage && <img src={firstImage} alt={title} class="mapka-popup-compact-image" />}

        <div class="mapka-popup-compact-info">
          {title && <span class="mapka-popup-title">{title}</span>}
          {description && <span class="mapka-popup-description">{description}</span>}
        </div>
      </div>

      {hasRows && (
        <dl class="mapka-popup-rows">
          {rows.map((row, index) => (
            <div key={index} class="mapka-popup-row">
              <dt class="mapka-popup-row-label">{displayRowName(row.name)}</dt>
              <dd class="mapka-popup-row-value">{displayRowValue(row.value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
