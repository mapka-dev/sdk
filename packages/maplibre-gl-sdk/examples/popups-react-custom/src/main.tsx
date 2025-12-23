import "@mapka/maplibre-gl-sdk/styles.css";
import "./styles.css";

import { createRoot } from "react-dom/client";
import { randomPoint } from "@turf/random";
import { Map as MapkaMap, type MapkaMarkerOptions } from "@mapka/maplibre-gl-sdk";
import { RealEstatePopup, type RealEstateProperty } from "./components/RealEstatePopup.tsx";
import { generateProperty, US_BBOX } from "./utils.ts";

const points = randomPoint(2500, { bbox: US_BBOX });

const properties: Map<string, RealEstateProperty> = new Map();
points.features.forEach((_, index) => {
  const id = `property-${index}`;
  properties.set(id, generateProperty(id));
});

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  return `$${Math.round(price / 1000)}k`;
}

type ZoomLevel = "low" | "medium" | "high";

function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom <= 5) return "low";
  if (zoom <= 9) return "medium";
  return "high";
}

function createMarkerElement(id: string, zoomLevel: ZoomLevel): HTMLElement {
  const property = properties.get(id);
  const element = document.createElement("div");
  element.className = "custom-marker";
  element.dataset.id = id;

  if (zoomLevel === "low") {
    element.innerHTML = `<div class="marker-dot marker-dot-small"></div>`;
  } else if (zoomLevel === "medium") {
    element.innerHTML = `<div class="marker-dot marker-dot-large"></div>`;
  } else {
    const priceLabel = property ? formatPrice(property.price) : "$0";
    element.innerHTML = `<div class="marker-price-label">${priceLabel}</div>`;
  }

  return element;
}

function updateMarkerElements(zoom: number) {
  const zoomLevel = getZoomLevel(zoom);
  const markerElements = document.querySelectorAll(".custom-marker");

  markerElements.forEach((el) => {
    const id = (el as HTMLElement).dataset.id;
    if (!id) return;

    const property = properties.get(id);
    if (zoomLevel === "low") {
      el.innerHTML = `<div class="marker-dot marker-dot-small"></div>`;
    } else if (zoomLevel === "medium") {
      el.innerHTML = `<div class="marker-dot marker-dot-large"></div>`;
    } else {
      const priceLabel = property ? formatPrice(property.price) : "$0";
      el.innerHTML = `<div class="marker-price-label">${priceLabel}</div>`;
    }
  });
}

function createPopupElement(id: string): HTMLElement {
  const property = properties.get(id);
  if (!property) {
    throw new Error(`Property ${id} not found`);
  }
  const container = document.createElement("div");

  const handleFavorite = (propertyId: string) => {
    const prop = properties.get(propertyId);
    if (prop) {
      prop.isFavorite = !prop.isFavorite;
      console.log(`Property ${propertyId} favorite status: ${prop.isFavorite}`);
    }
  };

  const handleViewDetails = (propertyId: string) => {
    console.log(`View details for property: ${propertyId}`);
    alert(`Viewing details for: ${properties.get(propertyId)?.address}`);
  };

  createRoot(container).render(
    <RealEstatePopup
      property={property}
      onFavorite={handleFavorite}
      onViewDetails={handleViewDetails}
    />,
  );

  return container;
}

const initialZoom = 4;
const initialZoomLevel = getZoomLevel(initialZoom);

const markers: MapkaMarkerOptions[] = points.features.map((feature, index) => {
  const id = `property-${index}`;
  const { coordinates } = feature.geometry;

  return {
    id,
    lngLat: coordinates as [number, number],
    element: createMarkerElement(id, initialZoomLevel),
    popup: {
      id,
      offset: [0, 0],
      closeOnClick: true,
      maxWidth: "360px",
      trigger: "click" as const,
      content: createPopupElement,
    },
  };
});

// Initialize the map centered on US
const map = new MapkaMap({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: "https://api.mapka.dev/v1/maputnik/styles/osm-liberty.json",
  center: [-98.5795, 39.8283],
  zoom: initialZoom,
});

let currentZoomLevel = initialZoomLevel;

map.on("load", () => {
  console.log(`Adding ${markers.length} real estate markers to the map`);
  map.addMarkers(markers);
});

map.on("zoom", () => {
  const zoom = map.getZoom();
  const newZoomLevel = getZoomLevel(zoom);

  if (newZoomLevel !== currentZoomLevel) {
    console.log(`Zoom level changed to ${newZoomLevel}`);
    currentZoomLevel = newZoomLevel;
    updateMarkerElements(zoom);
  }
});
