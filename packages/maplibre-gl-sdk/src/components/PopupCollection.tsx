import { Fragment } from "preact";
import { CompactPopupContent } from "./PopupContent.js";
import type { MapkaPopupContent } from "../types/popup.js";

interface PopupCollectionProps {
  items: MapkaPopupContent[];
}

export function PopupCollection({ items }: PopupCollectionProps) {
  return (
    <div class="mapka-popup-collection">
      {items.map((item, index) => (
        <Fragment key={index}>
          <CompactPopupContent {...item} />
          {index < items.length - 1 && <div class="mapka-popup-collection-divider" />}
        </Fragment>
      ))}
    </div>
  );
}
