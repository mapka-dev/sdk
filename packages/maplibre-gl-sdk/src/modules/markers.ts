import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { getPopupId } from "./popup.js";
import type { StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "../types/marker.js";

export function openMarkerPopup(
  map: MapkaMap,
  marker: Marker,
  options: Omit<MapkaPopupOptions, "lngLat">,
) {
  const latLng = marker.getLngLat().toArray();
  map.openPopup({
    ...options,
    lngLat: latLng,
  });
}

export function addMarkersOnMap(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  const markers: Marker[] = [];

  for (const markerConfig of markersOptions) {
    const { lngLat, popup, ...options } = markerConfig;
    const newMarker = new Marker(options).setLngLat(lngLat).addTo(currentMap);

    markers.push(newMarker);
    if (!popup) continue;

    const initialPopupId = getPopupId({
      ...popup,
      lngLat,
    });

    const markerElement = newMarker.getElement();
    let currentLngLat = newMarker.getLngLat().toArray();

    let currentPopupId = initialPopupId;

    if (options.draggable) {
      newMarker.on("dragend", () => {
        currentLngLat = newMarker.getLngLat().toArray();
        currentPopupId = currentMap.updatePopup(
          {
            ...popup,
            lngLat: currentLngLat,
          },
          currentPopupId,
        );
      });
      newMarker.on("drag", () => {
        currentLngLat = newMarker.getLngLat().toArray();
        currentPopupId = currentMap.updatePopup(
          {
            ...popup,
            lngLat: currentLngLat,
          },
          currentPopupId,
        );
      });
    }
    if (popup.trigger === "always") {
      openMarkerPopup(currentMap, newMarker, popup);

      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === currentPopupId)) {
          currentPopupId = currentMap.openPopup({
            ...popup,
            lngLat: currentLngLat,
          });
        }
      });
    } else if (popup.trigger === "click") {
      markerElement.style.cursor = "pointer";

      // TODO handle mem leak
      currentMap.on("click", () => {
        currentMap.closePopup(currentPopupId);
      });
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === currentPopupId)) {
          currentPopupId = currentMap.openPopup({
            ...popup,
            lngLat: currentLngLat,
          });
        }
      });
    } else if (popup?.trigger === "hover") {
      markerElement.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        if (!currentMap.popups.find((popup) => popup.id === currentPopupId)) {
          currentPopupId = currentMap.openPopup({
            ...popup,
            lngLat: currentLngLat,
          });
        }
      });
      markerElement.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        currentMap.closePopup(currentPopupId);
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
