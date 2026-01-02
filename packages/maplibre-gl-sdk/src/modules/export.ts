import { toPng } from "html-to-image";
import type { MapkaMap } from "../map.js";
import type { MapkaExportOptions } from "../types/export.js";

export async function exportMap(
  map: MapkaMap,
  options: MapkaExportOptions = {},
): Promise<HTMLImageElement> {
  const { hideControls = false, hideMarkers = false, hidePopups = false, bbox } = options;

  const container = map.getContainer();
  const originalBounds = map.getBounds();

  if (bbox) {
    map.fitBounds(bbox, { padding: 20, animate: false });
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    map.once("render", () => {
      toPng(container, {
        skipFonts: navigator.userAgent.includes("Firefox"),
        filter: (node) => {
          if (node.classList) {
            const isControlsVisibleOrNotControl =
              !hideControls || !node.classList.contains("maplibregl-control-container");
            const isMarkersVisibleOrNotMarker =
              !hideMarkers || !node.classList.contains("maplibregl-marker");
            const isPopupsVisibleOrNotPopup =
              !hidePopups || !node.classList.contains("maplibregl-popup");

            return (
              isControlsVisibleOrNotControl &&
              isMarkersVisibleOrNotMarker &&
              isPopupsVisibleOrNotPopup
            );
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => resolve(img);
          img.onerror = reject;
        })
        .catch(reject)
        .finally(() => {
          if (bbox) {
            map.fitBounds(originalBounds, { animate: false });
          }
        });
    });
    map.triggerRepaint();
  });
}
