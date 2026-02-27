import { Fragment } from "preact";
import { PopupCollectionItem } from "./PopupCollectionItem.js";
import type { MapkaPopupContent } from "../types/popup.js";

interface PopupCollectionProps {
  items: MapkaPopupContent[];
}

export function PopupCollection({ items }: PopupCollectionProps) {
  return (
    <div class="mapka-popup-collection">
      {items.map((item, index) => (
        <Fragment key={index}>
          <PopupCollectionItem {...item} />
          {index < items.length - 1 && <div class="mapka-popup-collection-divider" />}
        </Fragment>
      ))}
    </div>
  );
}
