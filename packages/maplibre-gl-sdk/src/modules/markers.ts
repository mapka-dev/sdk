import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { getPopupId } from "./popup.js";
import type { StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "../types/marker.js";

const markerPopupOptions = (marker: Marker, popupOptions: Omit<MapkaPopupOptions, "lngLat">) => {
  const latLng = marker.getLngLat().toArray();
  return {
    ...popupOptions,
    lngLat: latLng,
  };
};

export function addMarkersOnMap(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  const markers: Marker[] = [];

  for (const markerConfig of markersOptions) {
    const { lngLat, popup, ...options } = markerConfig;
    const newMarker = new Marker(options).setLngLat(lngLat).addTo(currentMap);

    markers.push(newMarker);
    if (!popup) continue;

    const popupId = getPopupId(popup);
    const markerElement = newMarker.getElement();

    if (options.draggable) {
      newMarker.on("dragend", () => {
        console.log("dragend", currentMap.popups, popupId);
        if (currentMap.popups.find((popup) => popup.id === popupId)) {
          currentMap.updatePopup(markerPopupOptions(newMarker, popup), popupId);
        }
      });
      newMarker.on("drag", () => {
        console.log("dragend", currentMap.popups, popupId);
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
        currentMap.closePopup(popupId);
      });
    }
  }

  return markers;
}

export function removeMarkers(map: MapkaMap) {
  while (map.markers.length > 0) {
    map.markers?.shift()?.remove();
  }
}

export function addMarkers(map: MapkaMap) {
  const style = map.getStyle();

  const markers = get(style, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return addMarkersOnMap(map, markers);
}

export function addMarkersStyleDiff(map: MapkaMap, next: StyleSpecification) {
  const markers = get(next, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return addMarkersOnMap(map, markers);
}
