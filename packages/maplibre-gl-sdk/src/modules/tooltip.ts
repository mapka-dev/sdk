import * as maplibregl from "maplibre-gl";
import type { MapkaTooltipOptions } from "../types/marker.js";

let currentPopup: maplibregl.Popup | null = null;
let currentCarouselIndex = 0;

/**
 * Creates the tooltip content HTML with Airbnb-style design
 */
function createTooltipContent(options: MapkaTooltipOptions): HTMLElement {
  const content = document.createElement("div");
  content.className = "mapka-tooltip-content-wrapper";

  // Add image carousel if images are provided
  if (options.imageUrls && options.imageUrls.length > 0) {
    const carouselContainer = document.createElement("div");
    carouselContainer.className = "mapka-tooltip-carousel";

    const carouselTrack = document.createElement("div");
    carouselTrack.className = "mapka-tooltip-carousel-track";

    options.imageUrls.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = options.title || "Marker image";
      img.className = "mapka-tooltip-image";
      if (index === 0) img.classList.add("active");
      carouselTrack.appendChild(img);
    });

    carouselContainer.appendChild(carouselTrack);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.className = "mapka-tooltip-action-btn mapka-tooltip-close";
    closeButton.innerHTML = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:block;fill:none;height:16px;width:16px;stroke:currentColor;stroke-width:3;overflow:visible"><path d="m6 6 20 20M26 6 6 26"></path></svg>`;
    closeButton.setAttribute("aria-label", "Close");
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      hideTooltip();
    });

    carouselContainer.appendChild(closeButton);

    // Add navigation dots if multiple images
    if (options.imageUrls.length > 1) {
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "mapka-tooltip-dots";

      options.imageUrls.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "mapka-tooltip-dot";
        if (index === 0) dot.classList.add("active");
        dot.setAttribute("aria-label", `Go to image ${index + 1}`);
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          showCarouselImage(carouselTrack, dotsContainer, index);
        });
        dotsContainer.appendChild(dot);
      });

      carouselContainer.appendChild(dotsContainer);

      // Add prev/next buttons
      const prevButton = document.createElement("button");
      prevButton.className = "mapka-tooltip-carousel-btn mapka-tooltip-carousel-prev";
      prevButton.innerHTML = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:block;fill:none;height:12px;width:12px;stroke:currentColor;stroke-width:4;overflow:visible"><path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>`;
      prevButton.setAttribute("aria-label", "Previous image");
      prevButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const imageCount = options.imageUrls?.length ?? 0;
        const newIndex = currentCarouselIndex === 0 ? imageCount - 1 : currentCarouselIndex - 1;
        showCarouselImage(carouselTrack, dotsContainer, newIndex);
      });

      const nextButton = document.createElement("button");
      nextButton.className = "mapka-tooltip-carousel-btn mapka-tooltip-carousel-next";
      nextButton.innerHTML = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:block;fill:none;height:12px;width:12px;stroke:currentColor;stroke-width:4;overflow:visible"><path fill="none" d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path></svg>`;
      nextButton.setAttribute("aria-label", "Next image");
      nextButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const imageCount = options.imageUrls?.length ?? 0;
        const newIndex = (currentCarouselIndex + 1) % imageCount;
        showCarouselImage(carouselTrack, dotsContainer, newIndex);
      });

      carouselContainer.appendChild(prevButton);
      carouselContainer.appendChild(nextButton);
    }

    content.appendChild(carouselContainer);
  }

  // Add text content section
  const textContent = document.createElement("div");
  textContent.className = "mapka-tooltip-text";

  if (options.title) {
    const title = document.createElement("h3");
    title.className = "mapka-tooltip-title";
    title.textContent = options.title;
    textContent.appendChild(title);
  }

  if (options.description) {
    const description = document.createElement("p");
    description.className = "mapka-tooltip-description";
    description.textContent = options.description;
    textContent.appendChild(description);
  }

  content.appendChild(textContent);

  return content;
}

/**
 * Shows a specific image in the carousel
 */
function showCarouselImage(track: HTMLElement, dotsContainer: HTMLElement, index: number) {
  currentCarouselIndex = index;

  const images = track.querySelectorAll(".mapka-tooltip-image");
  const dots = dotsContainer.querySelectorAll(".mapka-tooltip-dot");

  images.forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  track.style.transform = `translateX(-${index * 100}%)`;
}

/**
 * Injects the required CSS styles for the tooltip
 */
function injectStyles() {
  if (document.getElementById("mapka-tooltip-styles")) return;

  const style = document.createElement("style");
  style.id = "mapka-tooltip-styles";
  style.textContent = `
    .maplibregl-popup-content {
      padding: 0 !important;
      border-radius: 12px !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
      min-width: 280px;
      max-width: 320px;
    }

    .maplibregl-popup-close-button {
      display: none !important;
    }

    .mapka-tooltip-content-wrapper {
      border-radius: 12px;
      overflow: hidden;
    }

    .mapka-tooltip-carousel {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      border-radius: 12px 12px 0 0;
    }

    .mapka-tooltip-carousel-track {
      display: flex;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .mapka-tooltip-image {
      min-width: 100%;
      height: 100%;
      object-fit: cover;
      display: none;
    }

    .mapka-tooltip-image.active {
      display: block;
    }

    .mapka-tooltip-action-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
      transition: background 0.2s ease, transform 0.2s ease;
      color: #222;
      z-index: 3;
    }

    .mapka-tooltip-action-btn:hover {
      background: white;
      transform: scale(1.05);
    }

    .mapka-tooltip-carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      transition: background 0.2s ease, transform 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
      color: #222;
    }

    .mapka-tooltip-carousel-btn:hover {
      background: white;
      transform: translateY(-50%) scale(1.05);
    }

    .mapka-tooltip-carousel-prev {
      left: 12px;
    }

    .mapka-tooltip-carousel-next {
      right: 12px;
    }

    .mapka-tooltip-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 2;
    }

    .mapka-tooltip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .mapka-tooltip-dot:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .mapka-tooltip-dot.active {
      background: white;
    }

    .mapka-tooltip-text {
      padding: 12px 16px 16px;
    }

    .mapka-tooltip-title {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 600;
      color: #222;
      line-height: 1.3;
    }

    .mapka-tooltip-description {
      margin: 0;
      font-size: 14px;
      color: #717171;
      line-height: 1.4;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Shows a tooltip for a marker
 */
export function showTooltip(
  marker: maplibregl.Marker,
  options: MapkaTooltipOptions,
  map: maplibregl.Map,
) {
  // Hide any existing tooltip
  hideTooltip();

  // Inject styles if not already present
  injectStyles();

  // Reset carousel index
  currentCarouselIndex = 0;

  const content = createTooltipContent(options);

  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: "320px",
    offset: 12,
  })
    .setLngLat(marker.getLngLat())
    .setDOMContent(content)
    .addTo(map);

  currentPopup = popup;
}

/**
 * Hides the current tooltip
 */
export function hideTooltip() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

/**
 * Gets the current visible popup
 */
export function getCurrentTooltip(): maplibregl.Popup | null {
  return currentPopup;
}
