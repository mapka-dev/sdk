import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { getPopupId } from "./popup.js";
import type { Offset, StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "../types/marker.js";
import { remove } from "es-toolkit";

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

function setupMarkerPopupListeners(
  map: MapkaMap,
  marker: Marker,
  popup: Omit<MapkaPopupOptions, "lngLat">,
  options: MapkaMarkerOptions,
) {
  const popupId = getPopupId(popup);
  const markerElement = marker.getElement();

  if (options.draggable) {
    marker.on("dragend", () => {
      if (map.popups.find((p) => p.id === popupId)) {
        map.updatePopup(markerPopupOptions(marker, popup), popupId);
      }
    });
    marker.on("drag", () => {
      if (map.popups.find((p) => p.id === popupId)) {
        map.updatePopup(markerPopupOptions(marker, popup), popupId);
      }
    });
  }

  if (popup.trigger === "always") {
    if (!map.popups.find((p) => p.id === popupId)) {
      map.openPopup(markerPopupOptions(marker, popup), popupId);
    }

    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.id === popupId)) {
        map.openPopup(markerPopupOptions(marker, popup), popupId);
      }
    });
  } else if (popup.trigger === "click") {
    markerElement.style.cursor = "pointer";
    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.id === popupId)) {
        map.openPopup(markerPopupOptions(marker, popup), popupId);
      }
    });
  } else if (popup.trigger === "hover") {
    markerElement.addEventListener("mouseenter", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.id === popupId)) {
        map.openPopup(markerPopupOptions(marker, popup), popupId);
      }
    });
    markerElement.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      if (map.popups.find((p) => p.id === popupId)) {
        map.closePopup(popupId);
      }
    });
  }
}

export function addMarkers(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  for (const markerOptions of markersOptions) {
    const { lngLat, popup, ...options } = markerOptions;
    const newMarker = new Marker(options).setLngLat(lngLat).addTo(currentMap);

    currentMap.markers.push({
      id: getMarkerId(markerOptions),
      options: markerOptions,
      marker: newMarker,
    });
    if (!popup) continue;

    setupMarkerPopupListeners(currentMap, newMarker, popup, markerOptions);
  }
}

export function removeMarkersByIds(map: MapkaMap, ids: string[]) {
  const removedMarkers = remove(map.markers, (marker) => ids.includes(marker.id));
  for (const marker of removedMarkers) {
    marker.marker.remove();
  }
}

export function updateMarkers(map: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  const markersIds = markersOptions.map(getMarkerId);

  removeMarkersByIds(map, markersIds);
  addMarkers(map, markersOptions);
}

export function clearMarkers(map: MapkaMap) {
  for (const marker of map.markers) {
    marker.marker.remove();
  }
  map.markers = [];
}

export function addStyleMarkers(map: MapkaMap) {
  const style = map.getStyle();

  const markers = get(style, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  addMarkers(map, markers);
}

export function addStyleDiffMarkers(map: MapkaMap, next: StyleSpecification) {
  const markers = get(next, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  addMarkers(map, markers);
}
