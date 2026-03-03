import { Popup } from "maplibre-gl";
import { PopupContent } from "../components/PopupContent.js";
import { PopupList } from "../components/PopupList.js";
import { render } from "preact";
import { remove } from "es-toolkit/array";
import type { MapkaPopupOptions } from "../types/popup.js";
import type { MapkaMap } from "../map.js";
import { isEqual, isPlainObject } from "es-toolkit";

export function getPopupId(popup: { id?: string }) {
  return popup.id ?? `popup-${crypto.randomUUID()}`;
}

export function getOnClose(map: MapkaMap, id: string) {
  return () => map.closePopup(id);
}

function hasObjectContent(options: MapkaPopupOptions | MapkaPopupOptions[]) {
  if (Array.isArray(options)) {
    return options.some((opt) => isPlainObject(opt.content));
  }
  return isPlainObject(options.content);
}

export function enforceMaxPopups(map: MapkaMap) {
  if (map.popups.length > map.maxPopups) {
    const popupToRemove = map.popups.shift();
    if (popupToRemove) {
      popupToRemove.popup.remove();
      if (hasObjectContent(popupToRemove.options)) {
        render(null, popupToRemove.container);
      }
      popupToRemove.container.remove();
    }
  }
}

export function openPopups(map: MapkaMap, options: MapkaPopupOptions | MapkaPopupOptions[]) {
  if (!Array.isArray(options)) {
    const { lngLat, content, closeButton, id = getPopupId(options), ...popupOptions } = options;

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
      return openPopups(map, [
        {
          ...options,
          content: newContent,
        },
      ]);
    }
  } else {
    const [firstOption] = options;
    const { lngLat } = firstOption;
    const ids = options.map(getPopupId);

    const contents = options.map(({ content, ...opt }) => {
      if (typeof content === "function") {
        return content(getPopupId(opt));
      }
      return content;
    });
    const container = document.createElement("div");
    container.classList.add("mapka-popup-container");

    render(<PopupList items={contents} />, container);

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(lngLat)
      .setDOMContent(container)
      .addTo(map);

    map.popups.push({
      container,
      id: ids,
      options,
      popup,
    });
    enforceMaxPopups(map);
    return ids;
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

export function updatePopup(map: MapkaMap, { content, ...newOptions }: MapkaPopupOptions) {
  const id = getPopupId(newOptions);

  if (content instanceof HTMLElement) {
    const mapkaPopups = map.popups.filter((popup) => popup.id === id);
    for (const { popup, options } of mapkaPopups) {
      const singleOptions = Array.isArray(options) ? options[0] : options;
      updatePopupBaseOptions(popup, singleOptions, newOptions);
      popup.setDOMContent(content);
    }
  } else if (typeof content === "object") {
    const onClose = getOnClose(map, id);
    const mapkaPopups = map.popups.filter((popup) => popup.id === id);

    for (const { popup, container, options } of mapkaPopups) {
      const singleOptions = Array.isArray(options) ? options[0] : options;
      const { closeButton } = singleOptions;
      render(<PopupContent {...content} closeButton={closeButton} onClose={onClose} />, container);
      updatePopupBaseOptions(popup, singleOptions, newOptions);
      popup.setDOMContent(container);
    }
  } else if (typeof content === "function") {
    const newContent = content(id);
    return updatePopup(map, {
      ...newOptions,
      content: newContent,
    });
  }
}

/**
 * Close all popups that have closeOnClick set to true or undefined
 * Close any PopupList popups
 */
export function closeOnMapClickPopups(map: MapkaMap) {
  const popupsToCloseOnMapClick = remove(map.popups, (popup) => {
    return (
      Array.isArray(popup.options) ||
      popup.options.closeOnClick === true ||
      popup.options.closeOnClick === undefined
    );
  });
  for (const popup of popupsToCloseOnMapClick) {
    popup.popup.remove();
    if (hasObjectContent(popup.options)) {
      render(null, popup.container);
    }
    popup.container.remove();
  }
}

export function closePopupsById(map: MapkaMap, id: string) {
  const removedPopups = remove(map.popups, (popup) => popup.id === id);
  for (const popup of removedPopups) {
    popup.popup.remove();
    if (hasObjectContent(popup.options)) {
      render(null, popup.container);
    }
    popup.container.remove();
  }
}

export function removePopups(map: MapkaMap) {
  for (const popup of map.popups) {
    popup.popup.remove();
    if (hasObjectContent(popup.options)) {
      render(null, popup.container);
    }
    popup.container.remove();
  }
  map.popups = [];
}
