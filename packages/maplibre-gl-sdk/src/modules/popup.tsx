// biome-ignore lint/correctness/noUnusedImports: later fix
import { h } from "preact";
import { Popup } from "maplibre-gl";
import { Tooltip } from "../components/Tooltip.js";
import { render } from "preact";
import { remove } from "es-toolkit/array";
import type { LngLat } from "maplibre-gl";
import type { MapkaPopupOptions } from "../types/marker.js";
import type { MapkaMap } from "../map.js";

export function getPopupId(lngLat: LngLat, { id, ...rest }: MapkaPopupOptions) {
  if (id) return id;

  return `${lngLat.lat}_${lngLat.lng}_${JSON.stringify(rest)}`;
}

export function getOnClose(map: MapkaMap, id: string) {
  return () => map.closePopup(id);
}

const basePopupOption = {
  closeButton: false,
  closeOnClick: false,
  offset: 12,
};

export function openPopup(map: MapkaMap, lngLat: LngLat, options: MapkaPopupOptions, id: string) {
  const onClose = getOnClose(map, id);

  const container = document.createElement("div");
  container.classList.add("mapka-tooltip-container");

  render(<Tooltip {...options} id={id} onClose={onClose} />, container);

  const popup = new Popup(basePopupOption).setLngLat(lngLat).setDOMContent(container).addTo(map);

  map.popups.push({
    container,
    id,
    lngLat,
    options,
    popup,
  });

  if (map.popups.length > map.maxPopups) {
    const popupToRemove = map.popups.shift();
    popupToRemove?.popup.remove();
    popupToRemove?.container.remove();
  }

  return id;
}

export function updatePopup(map: MapkaMap, lngLat: LngLat, options: MapkaPopupOptions, id: string) {
  const onClose = getOnClose(map, id);

  const mapkaPopups = map.popups.filter((popup) => popup.id === id);

  for (const { popup, container } of mapkaPopups) {
    render(<Tooltip {...options} id={id} onClose={onClose} />, container);

    popup.setLngLat(lngLat).setDOMContent(container);
  }
}

export function closePopup(map: MapkaMap, id: string) {
  const removedPopups = remove(map.popups, (popup) => popup.id === id);

  for (const popup of removedPopups) {
    popup.popup.remove();
    popup.container.remove();
  }
}
