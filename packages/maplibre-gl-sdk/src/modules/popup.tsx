import { Popup } from "maplibre-gl";
import { PopupContent } from "../components/PopupContent.js";
import { PopupList } from "../components/PopupList.js";
import { render } from "preact";
import { remove } from "es-toolkit/array";
import { isPlainObject } from "es-toolkit";
import { computePopupGroups } from "./proximity.js";
import type { MapkaPopupOptions, MapkaPopupOptionsResolved } from "../types/popup.js";
import type { MapkaMap, MapMapkaPopup } from "../map.js";

export function getPopupId(popup: { id?: string }) {
  return popup.id ?? `popup-${crypto.randomUUID()}`;
}

export function getOnClose(map: MapkaMap, id: string) {
  return () => map.closePopup(id);
}

function hasObjectContent(options: MapkaPopupOptions[]) {
  return options.some((opt) => isPlainObject(opt.content));
}

function resolveContentCreators(options: MapkaPopupOptions[]): MapkaPopupOptionsResolved[] {
  return options.map((opt) => {
    const id = getPopupId(opt);

    if (typeof opt.content === "function") {
      return {
        ...opt,
        id,
        content: opt.content(id),
      };
    } else {
      return {
        ...opt,
        id,
        content: opt.content,
      };
    }
  });
}

function createNewPopup(map: MapkaMap, options: MapkaPopupOptionsResolved[]) {
  const [{ lngLat, id, content, closeButton, ...opts }] = options;

  const ids = options.map(getPopupId);
  const container = document.createElement("div");
  container.classList.add("mapka-popup-container");

  let popup: Popup | undefined;
  if (options.length > 1) {
    render(<PopupList items={options} />, container);

    popup = new Popup({
      ...opts,
      closeButton: false,
      closeOnClick: true,
    })
      .setLngLat(lngLat)
      .setDOMContent(container)
      .addTo(map);
  }

  if (content instanceof HTMLElement) {
    popup = new Popup({
      ...opts,
      closeButton: false,
    })
      .setLngLat(lngLat)
      .setDOMContent(content)
      .addTo(map);
  } else {
    popup = new Popup({
      ...opts,
      closeButton: false,
    })
      .setLngLat(lngLat)
      .setDOMContent(container)
      .addTo(map);

    render(<PopupContent {...content} onClose={getOnClose(map, id)} />, container);
  }

  if (!popup) return;

  map.popups.push({
    container,
    ids,
    options,
    popup,
  });

  return ids;
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

export function reconciliatePopups(map: MapkaMap, options: MapkaPopupOptions[]) {
  const resolved = resolveContentCreators(options);
  const actions = computePopupGroups(map, resolved);

  for (const action of actions) {
    if (action.type === "close") {
      closePopupsByIds(map, action.ids);
    } else if (action.type === "create") {
      createNewPopup(map, action.options);
    }
  }

  enforceMaxPopups(map);

  return resolved.map((opt) => opt.id);
}

export function closeOnMapClickPopups(map: MapkaMap) {
  const popupsToCloseOnMapClick = remove(map.popups, (popup) => {
    const [first] = popup.options;
    return (
      popup.ids.length > 1 || first?.closeOnClick === true || first?.closeOnClick === undefined
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

export function closePopupByIndex(map: MapkaMap, index: number) {
  const group = map.popups[index];
  group.popup.remove();
  if (hasObjectContent(group.options)) {
    render(null, group.container);
  }
  group.container.remove();
  map.popups.splice(index, 1);
}

export function closePopupsByIds(map: MapkaMap, ids: string[]) {
  const listsToReRender: Set<MapMapkaPopup> = new Set();

  map.popups.forEach((popup, index) => {
    const itemIndex = popup.ids.findIndex((id) => ids.includes(id));
    if (itemIndex < 0) return;

    if (popup.ids.length === 1) {
      closePopupByIndex(map, index);
    } else if (popup.ids.length > 1) {
      popup.ids.splice(itemIndex, 1);
      popup.options.splice(itemIndex, 1);
      listsToReRender.add(popup);
    }
  });

  map.popups.forEach((popup, index) => {
    if (listsToReRender.has(popup)) {
      closePopupByIndex(map, index);
      createNewPopup(map, popup.options);
    }
  });
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
