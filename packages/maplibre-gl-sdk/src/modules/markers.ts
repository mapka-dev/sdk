import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { getPopupId } from "./popup.js";
import type { Offset, StyleSpecification } from "maplibre-gl";
import type { MapkaMap, MapMapkaMarker } from "../map.js";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "../types/marker.js";

/**
 * Default marker offset
 * @see https://github.com/maplibre/maplibre-gl-js/blob/master/src/ui/marker.ts#L457
 */
const DEFAULT_MARKET_OFFSET = {
  top: [0, 0],
  "top-left": [0, 0],
  "top-right": [0, 0],
  bottom: [0, -38.1],
  "bottom-left": [9.54594154601839, -34.14594154601839],
  "bottom-right": [-9.54594154601839, -34.14594154601839],
  left: [13.5, -24.6],
  right: [-13.5, -24.6],
} as Offset;

export function getMarkerId(marker: { id?: string }) {
  return marker.id ?? `marker-${crypto.randomUUID()}`;
}

const markerPopupOptions = (marker: Marker, popupOptions: Omit<MapkaPopupOptions, "lngLat">) => {
  const latLng = marker.getLngLat().toArray();

  if ("offset" in popupOptions) {
    return {
      ...popupOptions,
      lngLat: latLng,
    };
  } else {
    return {
      ...popupOptions,
      lngLat: latLng,
      offset: DEFAULT_MARKET_OFFSET,
    };
  }
};

export function addMarkers(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  const markers: MapMapkaMarker[] = [];

  for (const markerConfig of markersOptions) {
    const { lngLat, popup, ...options } = markerConfig;
    const newMarker = new Marker(options).setLngLat(lngLat).addTo(currentMap);

    markers.push({
      id: getMarkerId(markerConfig),
      options: markerConfig,
      marker: newMarker,
    });
    if (!popup) continue;

    const popupId = getPopupId(popup);
    const markerElement = newMarker.getElement();

    if (options.draggable) {
      newMarker.on("dragend", () => {
        if (currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.updatePopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
      newMarker.on("drag", () => {
        if (currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.updatePopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
    }
    if (popup.trigger === "always") {
      if (!currentMap.popups.find((popup) => popup.id === popupId)) {
        currentMap.openPopup(markerPopupOptions(newMarker, popup), popupId);
      }

      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.openPopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
    } else if (popup.trigger === "click") {
      markerElement.style.cursor = "pointer";
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.openPopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
    } else if (popup?.trigger === "hover") {
      markerElement.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.openPopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
      markerElement.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        if (currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.closePopup(popupId);
        }
      });
    }
  }
  currentMap.markers.push(...markers);
}

export function updateMarkers(map: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  throw new Error("Not implemented.", { cause: { map, markersOptions } });
}

export function clearMarkers(map: MapkaMap) {
  const { markers } = map;
  for (const marker of markers) {
    marker.marker.remove();
  }
  map.markers = [];
}

export function addStyleMarkers(map: MapkaMap) {
  const style = map.getStyle();

  const markers = get(style, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return addMarkers(map, markers);
}

export function addStyleDiffMarkers(map: MapkaMap, next: StyleSpecification) {
  const markers = get(next, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return addMarkers(map, markers);
}
