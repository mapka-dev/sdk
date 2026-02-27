import { PopupRows } from "./PopupRows.js";
import type { MapkaPopupContent } from "../types/popup.js";

interface PopupProps extends MapkaPopupContent {
  onClose?: () => void;
  closeButton?: boolean;
}

export function PopupCollectionItem({ title, description, rows, imageUrls = [] }: PopupProps) {
  const hasRows = rows && rows.length > 0;
  const [firstImage] = imageUrls;

  return (
    <div class="mapka-popup mapka-popup-compact">
      <div class="mapka-popup-compact-header">
        {firstImage && <img src={firstImage} alt={title} class="mapka-popup-compact-image" />}

        <div class="mapka-popup-compact-info">
          {title && <span class="mapka-popup-title">{title}</span>}
          {description && <span class="mapka-popup-description">{description}</span>}
        </div>
      </div>

      {hasRows && <PopupRows rows={rows} />}
    </div>
  );
}
