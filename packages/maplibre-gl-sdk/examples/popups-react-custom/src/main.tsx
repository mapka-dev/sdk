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

// Color based on property type
const propertyTypeColors: Record<RealEstateProperty["propertyType"], string> = {
  house: "#22c55e", // green
  condo: "#3b82f6", // blue
  townhouse: "#f59e0b", // amber
  apartment: "#8b5cf6", // purple
};

// Create markers from generated points
const markers: MapkaMarkerOptions[] = points.features.map((feature, index) => {
  const id = `property-${index}`;
  const property = properties.get(id);
  const { coordinates } = feature.geometry;

  return {
    id,
    lngLat: coordinates as [number, number],
    color: property ? propertyTypeColors[property.propertyType] : "#6b7280",
    popup: {
      id,
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
  zoom: 4,
});

map.on("load", () => {
  console.log(`Adding ${markers.length} real estate markers to the map`);
  map.addMarkers(markers);
});
