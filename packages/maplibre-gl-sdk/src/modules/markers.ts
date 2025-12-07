import * as maplibregl from "maplibre-gl";
import { get } from "es-toolkit/compat";
import type { StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions } from "../types/marker.js";
import { showTooltip, hideTooltip } from "./tooltip.js";

const prevMarkers = new Set<maplibregl.Marker>();

function addMarkersToMap(map: MapkaMap, markers: MapkaMarkerOptions[]) {
  for (const marker of prevMarkers) {
    marker.remove();
  }
  prevMarkers.clear();

  for (const markerConfig of markers) {
    const { position, color, tooltip } = markerConfig;
    const newMarker = new maplibregl.Marker({
      color,
    })
      .setLngLat(position)
      .addTo(map);

    if (tooltip?.trigger === "click") {
      const markerElement = newMarker.getElement();

      markerElement.style.cursor = "pointer";

      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        showTooltip(newMarker, tooltip, map);
      });
    } else if (tooltip?.trigger === "hover") {
      const markerElement = newMarker.getElement();

      markerElement.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        showTooltip(newMarker, tooltip, map);
      });
      markerElement.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        hideTooltip();
      });
    }

    prevMarkers.add(newMarker);
  }
}

export function addMarkers(map: MapkaMap) {
  const style = map.getStyle();
  const markers = get(style, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  addMarkersToMap(map, markers);
}

export function addMarkersStyleDiff(map: MapkaMap, next: StyleSpecification) {
  const markers = get(next, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  addMarkersToMap(map, markers);
}
