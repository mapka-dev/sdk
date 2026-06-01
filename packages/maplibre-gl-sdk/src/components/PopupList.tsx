import { useState } from "preact/hooks";
import type { MapkaPopupOptionsResolved } from "../types/popup.js";
import { PopupContent } from "./PopupContent.js";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon.js";
import { ChevronRightIcon } from "./icons/ChevronRightIcon.js";
import { noop } from "es-toolkit";

interface PopupCollectionProps {
  items: MapkaPopupOptionsResolved[];
}

export function PopupCustomElement({ popup }: { popup: HTMLElement }) {
  return popup;
}

interface PopupListNavProps {
  index: number;
  total: number;
  onPrev: (e: Event) => void;
  onNext: (e: Event) => void;
}

function PopupListNav({ index, total, onPrev, onNext }: PopupListNavProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div class="mapka-popup-list-nav">
      <button
        type="button"
        class="mapka-popup-list-nav-btn"
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous popup"
      >
        <ChevronLeftIcon />
      </button>
      <div class="mapka-popup-list-nav-counter">
        {index + 1}/{total}
      </div>
      <button
        type="button"
        class="mapka-popup-list-nav-btn"
        onClick={onNext}
        disabled={isLast}
        aria-label="Next popup"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

export function PopupList({ items }: PopupCollectionProps) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, items.length - 1);

  const handlePrev = (e: Event) => {
    e.stopPropagation();
    if (safeIndex > 0) {
      setIndex(safeIndex - 1);
    }
  };

  const handleNext = (e: Event) => {
    e.stopPropagation();
    if (safeIndex < items.length - 1) {
      setIndex(safeIndex + 1);
    }
  };
  const { id, content } = items[safeIndex];
  return (
    <div class="mapka-popup-list-wrapper">
      <div class="mapka-popup-list">
        {content instanceof HTMLElement ? (
          <PopupCustomElement key={id} popup={content} />
        ) : (
          <PopupContent
            key={id}
            title={content.title}
            description={content.description}
            rows={content.rows}
            imageUrls={content.imageUrls}
            primaryAction={content.primaryAction}
            closeButton={false}
            onClose={noop}
          />
        )}
      </div>
      {items.length > 1 && (
        <PopupListNav
          index={safeIndex}
          total={items.length}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
