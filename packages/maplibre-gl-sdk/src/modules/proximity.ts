import type { MapkaMap, MapMapkaPopup } from "../map.js";
import type { MapkaPopupOptionsResolved } from "../types/popup.js";

export type PopupGroupAction =
  | { type: "close"; ids: string[] }
  | { type: "create"; options: MapkaPopupOptionsResolved[] };

interface PopupCluster {
  options: MapkaPopupOptionsResolved[];
  lngLat: [number, number];
}

function clustersByLocation(
  previous: MapkaPopupOptionsResolved[],
  newOptions: MapkaPopupOptionsResolved[],
  threshold: number,
): PopupCluster[] {}

function actionsByProximity(
  popups: MapMapkaPopup[],
  newOptions: MapkaPopupOptionsResolved[],
  threshold: number,
): PopupGroupAction[] {
  const updated: MapMapkaPopup[] = [];
  const nonUpdated: MapkaPopupOptionsResolved[] = [];

  for (const popup of popups) {
    if (newOptions.find((o) => popup.ids.includes(o.id))) {
      updated.push(popup);
    } else {
      nonUpdated.push(...popup.options);
    }
  }

  const group = clustersByLocation(nonUpdated, newOptions, threshold);

  return [
    ...updated.map((popup) => ({
      type: "close" as const,
      ids: popup.ids,
    })),
  ];
}

export function actionsByChanges(
  popups: MapMapkaPopup[],
  newOptions: MapkaPopupOptionsResolved[],
): PopupGroupAction[] {
  const updated = [];

  for (const popup of popups) {
    if (newOptions.find((o) => popup.ids.includes(o.id))) {
      updated.push(popup);
    }
  }

  return [
    ...updated.map((popup) => ({
      type: "close" as const,
      ids: popup.ids,
    })),
    {
      type: "create" as const,
      options: newOptions,
    },
  ];
}

export function computePopupGroups(
  map: MapkaMap,
  newOptions: MapkaPopupOptionsResolved[],
): PopupGroupAction[] {
  const popups = map.getPopups();
  const zoom = map.getZoom();
  const threshold = getProximityThreshold(zoom);

  if (map.scrollPopups) {
    return actionsByProximity(popups, newOptions, threshold);
  } else {
    return actionsByChanges(popups, newOptions);
  }
}
