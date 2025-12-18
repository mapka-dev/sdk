import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { getPopupId } from "./popup.js";
import type { StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions } from "../types/marker.js";

export function updateMarkersOnMap(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  const markers: Marker[] = [];
  for (const markerConfig of markersOptions) {
    const { position, color, popup } = markerConfig;
    const newMarker = new Marker({
      color,
    })
      .setLngLat(position)
      .addTo(currentMap);

    markers.push(newMarker);
    if (!popup) continue;

    const markerElement = newMarker.getElement();
    const lngLat = newMarker.getLngLat();

    const popupId = getPopupId(lngLat, popup);

    if (popup.trigger === "click") {
      markerElement.style.cursor = "pointer";

      markerElement.addEventListener("blur", (e) => {
        e.stopPropagation();
        currentMap.closePopup(popupId);
      });
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        currentMap.openPopup(lngLat, popup);
      });
    } else if (popup?.trigger === "hover") {
      markerElement.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        currentMap.openPopup(lngLat, popup);
      });
      markerElement.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        currentMap.closePopup(popupId);
      });
    }
  }

  return markers;
}

export function addMarkers(map: MapkaMap) {
  const style = map.getStyle();

  const markers = get(style, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return updateMarkersOnMap(map, markers);
}

export function addMarkersStyleDiff(map: MapkaMap, next: StyleSpecification) {
  const markers = get(next, "metadata.mapka.markers", []) as MapkaMarkerOptions[];
  return updateMarkersOnMap(map, markers);
}
