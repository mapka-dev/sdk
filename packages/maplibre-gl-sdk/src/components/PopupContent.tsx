import type { MouseEventHandler } from "preact";
import type { MapkaPopupContent } from "../types/popup.js";
import { CloseIcon } from "./icons/CloseIcon.js";
import { PopupDataRows } from "./PopupDataRows.js";
import { ImageCarousel } from "./ImageCarousel.js";

interface PopupProps extends MapkaPopupContent {
  onClose?: () => void;
  closeButton?: boolean;
}

function PrimaryButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const handleClick = (e: Event) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button type="button" class="mapka-popup-button-primary" onClick={handleClick}>
      {label}
    </button>
  );
}

export function CloseButton({ onClose }: { onClose?: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button type="button" class="mapka-popup-close-btn" onClick={onClose} aria-label="Close">
      <CloseIcon />
    </button>
  );
}

export function PopupContent({
  title,
  description,
  rows,
  closeButton,
  imageUrls = [],
  primaryAction,
  onClose,
}: PopupProps) {
  const hasImages = imageUrls && imageUrls.length > 0;
  const hasRows = rows && rows.length > 0;

  const handleCloseClick = (e: Event) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div class="mapka-popup">
      {closeButton && <CloseButton onClose={handleCloseClick} />}
      {hasImages && <ImageCarousel imageUrls={imageUrls} title={title} />}

      <div class="mapka-popup-content">
        {title && <h3 class="mapka-popup-title">{title}</h3>}
        {description && <p class="mapka-popup-description">{description}</p>}

        {hasRows && <PopupDataRows rows={rows} />}

        {primaryAction && (
          <div class="mapka-popup-actions">
            <PrimaryButton label={primaryAction.label} onClick={primaryAction.onClick} />
          </div>
        )}
      </div>
    </div>
  );
}
