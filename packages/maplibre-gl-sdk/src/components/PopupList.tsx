import type { MapkaPopupOptionsResolved } from "../types/popup.js";
import { PopupListItem } from "./PopupListItem.js";

interface PopupCollectionProps {
  items: MapkaPopupOptionsResolved[];
}

export function PopupCustomElement({ popup }: { popup: HTMLElement }) {
  return popup;
}

export function PopupList({ items }: PopupCollectionProps) {
  return (
    <div class="mapka-popup-list-wrapper">
      <div class="mapka-popup-list">
        {items.map(({ content, id }) =>
          content instanceof HTMLElement ? (
            <PopupCustomElement key={id} popup={content} />
          ) : (
            <PopupListItem key={id} popup={content} />
          ),
        )}
      </div>
      <div class="mapka-popup-list-gradient" />
    </div>
  );
}
