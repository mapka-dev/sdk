import { Marker } from "maplibre-gl";
import { get } from "es-toolkit/compat";
import { remove } from "es-toolkit";
import { loadMarkerIcon } from "./icons.js";
import type { MarkerOptions, Offset, StyleSpecification } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaMarkerOptions } from "../types/marker.js";
import type { MapkaMarkerPopupOptions, MapkaPopupOptions } from "../types/popup.js";

/**
 * Offset for the default pin so the tip sits on the LngLat anchor point.
 * Value taken from maplibre-gl-js: (shadow translate-y + ellipse cy) - (height/2) ≈ 14.
 */
const DEFAULT_PIN_OFFSET: [number, number] = [0, -14];

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

export function getMarkerPopupId(marker: { id?: string }, popup: { id?: string }) {
  return popup.id ?? marker.id ?? `marker-popup-${crypto.randomUUID()}`;
}

const markerPopupOptions = (
  id: string,
  marker: Marker,
  popupOptions: Omit<MapkaPopupOptions, "lngLat">,
) => {
  const latLng = marker.getLngLat().toArray();

  if ("offset" in popupOptions) {
    return {
      ...popupOptions,
      id,
      lngLat: latLng,
    };
  } else {
    return {
      ...popupOptions,
      id,
      lngLat: latLng,
      offset: DEFAULT_MARKET_OFFSET,
    };
  }
};

function setupMarkerPopupListeners(
  map: MapkaMap,
  marker: Marker,
  popup: MapkaMarkerPopupOptions,
  options: MapkaMarkerOptions,
) {
  const markerElement = marker.getElement();
  const popupId = getMarkerPopupId(options, popup);
  const popupOptions = markerPopupOptions(popupId, marker, popup);

  if (options.draggable) {
    marker.on("dragend", () => {
      if (map.popups.find((p) => p.ids.includes(popupId))) {
        map.updatePopup(popupOptions);
      }
    });
    marker.on("drag", () => {
      if (map.popups.find((p) => p.ids.includes(popupId))) {
        map.updatePopup(popupOptions);
      }
    });
  }

  if (popup.trigger === "always") {
    if (!map.popups.find((p) => p.ids.includes(popupId))) {
      map.openPopup(popupOptions);
    }

    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.ids.includes(popupId))) {
        map.openPopup(popupOptions);
      }
    });
  } else if (popup.trigger === "click") {
    markerElement.style.cursor = "pointer";
    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.ids.includes(popupId))) {
        map.openPopup(popupOptions);
      }
    });
  } else if (popup.trigger === "hover") {
    markerElement.addEventListener("mouseenter", (e) => {
      e.stopPropagation();
      if (!map.popups.find((p) => p.ids.includes(popupId))) {
        map.openPopup(popupOptions);
      }
    });
    markerElement.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      if (map.popups.find((p) => p.ids.includes(popupId))) {
        map.closePopup(popupId);
      }
    });
  }
}

/**
 * Apply `color` (as SVG `fill`) to the fetched icon SVG inside `element`.
 *
 * Override every descendant whose `fill` attribute is set and not `"none"`,
 * then set `fill` on the root `<svg>` itself so paths that omit the
 * attribute (common in maki — they inherit the browser default) pick up the
 * user color via SVG cascading. `fill="none"` is preserved so outline-only
 * shapes keep their transparency.
 *
 * Only invoked for icon markers; the default maplibre pin handles its own
 * color via `MarkerOptions.color`.
 */
function applyMarkerColors(element: HTMLElement, color?: string) {
  if (!color) {
    return;
  }
  for (const el of element.querySelectorAll('[fill]:not([fill="none"])')) {
    el.setAttribute("fill", color);
  }
  const svg = element.querySelector("svg");
  if (svg && !svg.hasAttribute("fill")) {
    svg.setAttribute("fill", color);
  }
}

function createMarkerElement(
  currentMap: MapkaMap,
  options: MapkaMarkerOptions,
): HTMLElement | undefined {
  const { color, icon } = options;
  if (!icon) {
    return;
  }

  const element = document.createElement("div");
  element.className = "mapka-marker-icon";

  element.dataset.iconId = icon;
  loadMarkerIcon(icon)
    .then((svg) => {
      element.innerHTML = svg;
      applyMarkerColors(element, color);
    })
    .catch((err) => {
      currentMap.logger.warn(`[mapka] Failed to load marker icon "${icon}":`, err);
    });

  return element;
}

export function addMarkers(currentMap: MapkaMap, markersOptions: MapkaMarkerOptions[]) {
  for (const markerOptions of markersOptions) {
    const { lngLat, popup, icon, offset = DEFAULT_PIN_OFFSET, ...rest } = markerOptions;

    const markerOpts: MarkerOptions = {
      ...rest,
      element: createMarkerElement(currentMap, markerOptions),
      offset,
    };

    const newMarker = new Marker(markerOpts).setLngLat(lngLat).addTo(currentMap);

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

export function removeMarkers(map: MapkaMap) {
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
