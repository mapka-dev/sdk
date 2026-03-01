import { PopupDataRows } from "./PopupDataRows.js";
import type { MapkaPopupContent } from "../types/popup.js";

interface PopupHeaderProps {
  title?: string;
  description?: string;
  imageUrls: string[];
}

export function PopupHeader({ title, description, imageUrls: [firstImage] }: PopupHeaderProps) {
  return (
    <div class="mapka-popup-collection-item-header">
      {firstImage && <img src={firstImage} alt={title} class="mapka-popup-collection-item-image" />}

      <div class="mapka-popup-collection-item-info">
        {title && <span class="mapka-popup-title">{title}</span>}
        {description && <span class="mapka-popup-description">{description}</span>}
      </div>
    </div>
  );
}

interface PopupCollectionItemProps {
  popup: MapkaPopupContent;
}

export function PopupListItem({
  popup: { title, description, rows = [], imageUrls = [] },
}: PopupCollectionItemProps) {
  const hasImages = Boolean(imageUrls.length);
  const hasHeader = Boolean(title || description || hasImages);
  const hasDataRows = Boolean(rows.length);

  return (
    <div class="mapka-popup-collection-item">
      {hasHeader && <PopupHeader title={title} description={description} imageUrls={imageUrls} />}
      {hasDataRows && <PopupDataRows rows={rows} />}
    </div>
  );
}
