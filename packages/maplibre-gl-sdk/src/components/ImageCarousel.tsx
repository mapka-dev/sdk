import { useState } from "preact/hooks";
import { HeartIcon } from "./icons/HeartIcon.js";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon.js";
import { ChevronRightIcon } from "./icons/ChevronRightIcon.js";

export function ImageCarousel({
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
      <div class="mapka-popup-carousel-image-container">
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
        <div class="mapka-popup-carousel-controls">
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
        </div>
      )}
    </div>
  );
}
