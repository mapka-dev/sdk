// biome-ignore lint/correctness/noUnusedImports: later fix
import { h } from "preact";
import { Popup } from "maplibre-gl";
import { PopupContent } from "../components/PopupContent.js";
import { render } from "preact";
import { remove } from "es-toolkit/array";
import type { MapkaPopupOptions } from "../types/marker.js";
import type { MapkaMap } from "../map.js";
import { isEqual } from "es-toolkit";

export function getPopupId(popup: { id?: string }) {
  return popup.id ?? `popup-${crypto.randomUUID()}`;
}

export function getOnClose(map: MapkaMap, id: string) {
  return () => map.closePopup(id);
}

export function enforceMaxPopups(map: MapkaMap) {
  if (map.popups.length > map.maxPopups) {
    const popupToRemove = map.popups.shift();
    popupToRemove?.popup.remove();
    popupToRemove?.container.remove();
  }
}

export function openPopup(map: MapkaMap, options: MapkaPopupOptions, id: string) {
  const { lngLat, content, closeButton, ...popupOptions } = options;
  if (content instanceof HTMLElement) {
    const popup = new Popup({
      ...popupOptions,
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(lngLat)
      .setDOMContent(content)
      .addTo(map);

    map.popups.push({
      container: content,
      id,
      options,
      popup,
    });
    enforceMaxPopups(map);
    return id;
  } else if (typeof content === "object") {
    const onClose = getOnClose(map, id);
    const container = document.createElement("div");
    container.classList.add("mapka-popup-container");

    render(<PopupContent {...content} closeButton={closeButton} onClose={onClose} />, container);

    const popup = new Popup({
      ...popupOptions,
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(lngLat)
      .setDOMContent(container)
      .addTo(map);

    map.popups.push({
      container,
      id,
      options,
      popup,
    });
    enforceMaxPopups(map);
    return id;
  } else if (typeof content === "function") {
    const newContent = content(id);
    return openPopup(
      map,
      {
        ...options,
        content: newContent,
      },
      id,
    );
  }

  throw new Error("Invalid popup content");
}

const DEFAULT_POPUP_MAX_WIDTH = "240px";

export function updatePopupBaseOptions(
  popup: Popup,
  options: MapkaPopupOptions,
  newOptions: Omit<MapkaPopupOptions, "content">,
) {
  if (!isEqual(options.maxWidth, newOptions.maxWidth)) {
    popup.setMaxWidth(newOptions.maxWidth ?? DEFAULT_POPUP_MAX_WIDTH);
  }
  if (!isEqual(options.offset, newOptions.offset)) {
    popup.setOffset(newOptions.offset);
  }
  if (!isEqual(options.lngLat, newOptions.lngLat)) {
    popup.setLngLat(newOptions.lngLat);
  }
  return popup;
}

export function updatePopup(
  map: MapkaMap,
  { content, ...newOptions }: MapkaPopupOptions,
  id: string,
) {
  if (content instanceof HTMLElement) {
    const mapkaPopups = map.popups.filter((popup) => popup.id === id);
    for (const { popup, options } of mapkaPopups) {
      updatePopupBaseOptions(popup, options, newOptions);
      popup.setDOMContent(content);
    }
  } else if (typeof content === "object") {
    const onClose = getOnClose(map, id);
    const mapkaPopups = map.popups.filter((popup) => popup.id === id);

    for (const { popup, container, options } of mapkaPopups) {
      const { closeButton } = options;
      render(<PopupContent {...content} closeButton={closeButton} onClose={onClose} />, container);
      updatePopupBaseOptions(popup, options, newOptions);
      popup.setDOMContent(container);
    }
  } else if (typeof content === "function") {
    const newContent = content(id);
    return updatePopup(
      map,
      {
        ...newOptions,
        content: newContent,
      },
      id,
    );
  }
}

export function closeOnMapClickPopups(map: MapkaMap) {
  const popupsToCloseOnMapClick = remove(map.popups, (popup) =>
    Boolean(popup.options.closeOnClick),
  );
  for (const popup of popupsToCloseOnMapClick) {
    popup.popup.remove();
    popup.container.remove();
  }
}

export function closePopupsById(map: MapkaMap, id: string) {
  const removedPopups = remove(map.popups, (popup) => popup.id === id);
  for (const popup of removedPopups) {
    popup.popup.remove();
    popup.container.remove();
  }
}

export function removePopups(map: MapkaMap) {
  for (const popup of map.popups) {
    popup.popup.remove();
    popup.container.remove();
  }
  map.popups = [];
}
