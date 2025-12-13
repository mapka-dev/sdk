// biome-ignore lint/correctness/noUnusedImports: <explanation>
import { h } from "preact";
import { Popup } from "maplibre-gl";
import { render } from "preact";
import { Tooltip } from "../components/Tooltip.js";
import type { MapkaTooltipOptions } from "../types/marker.js";

let currentPopup: maplibregl.Popup | null = null;

/**
 * Shows a tooltip for a marker
 */
export function showTooltip(
  marker: maplibregl.Marker,
  options: MapkaTooltipOptions,
  map: maplibregl.Map,
) {
  hideTooltip();

  const container = document.createElement("div");

  render(<Tooltip {...options} onClose={hideTooltip} />, container);

  const popup = new Popup({
    closeButton: false,
    closeOnClick: false,
    maxWidth: "320px",
    offset: 12,
  })
    .setLngLat(marker.getLngLat())
    .setDOMContent(container)
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
export function getCurrentTooltip(): Popup | null {
  return currentPopup;
}
