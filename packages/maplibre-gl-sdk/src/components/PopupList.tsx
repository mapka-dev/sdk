import { PopupListItem } from "./PopupListItem.js";
import type { MapkaPopupContent } from "../types/popup.js";

interface PopupCollectionProps {
  items: (MapkaPopupContent | HTMLElement)[];
}

export function PopupCustomElement({ popup }: { popup: HTMLElement }) {
  return popup;
}

export function PopupCollection({ items }: PopupCollectionProps) {
  return (
    <div class="mapka-popup-list">
      {items.map((item, index) =>
        item instanceof HTMLElement ? (
          <PopupCustomElement key={index} popup={item} />
        ) : (
          <PopupListItem key={index} popup={item} />
        ),
      )}
    </div>
  );
}
