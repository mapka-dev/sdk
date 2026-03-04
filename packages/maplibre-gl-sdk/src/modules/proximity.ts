import type { MapkaMap } from "../map.js";
import type { MapkaPopupOptionsResolved } from "../types/popup.js";

const BASE_THRESHOLD = 140;

export function getProximityThreshold(zoom: number): number {
  return BASE_THRESHOLD / 2 ** zoom;
}

export function lngLatDistance(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export type PopupGroupAction =
  | { type: "close"; ids: string[] }
  | { type: "create"; options: MapkaPopupOptionsResolved[] };

export function computePopupGroups(
  map: MapkaMap,
  newOptions: MapkaPopupOptionsResolved[],
): PopupGroupAction[] {
  const { popups } = map;
  const threshold = getProximityThreshold(map.getZoom());
  const actions: PopupGroupAction[] = [];

  // Track which groups are affected and what new options map to them
  const affectedGroups = new Map<number, MapkaPopupOptionsResolved[]>();
  const unmatched: MapkaPopupOptionsResolved[] = [];

  // Pass 1: Match by id — new option updates an existing one
  const remainingNew: MapkaPopupOptionsResolved[] = [];
  for (const opt of newOptions) {
    const groupIndex = popups.findIndex((g) => g.ids.includes(opt.id));
    if (groupIndex >= 0) {
      const bucket = affectedGroups.get(groupIndex);
      if (bucket) {
        bucket.push(opt);
      } else {
        affectedGroups.set(groupIndex, [opt]);
      }
    } else {
      remainingNew.push(opt);
    }
  }

  // Pass 2: Match remaining by proximity
  for (const opt of remainingNew) {
    let bestIndex = -1;
    let bestDist = threshold;

    for (let i = 0; i < popups.length; i++) {
      const existing = popups[i];
      const trigger = existing.options[0]?.trigger;
      if (trigger === "hover" || trigger === "always") continue;

      const existingLngLat = existing.popup.getLngLat().toArray() as [number, number];
      const dist = lngLatDistance(existingLngLat, opt.lngLat);

      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0) {
      const bucket = affectedGroups.get(bestIndex);
      if (bucket) {
        bucket.push(opt);
      } else {
        affectedGroups.set(bestIndex, [opt]);
      }
    } else {
      unmatched.push(opt);
    }
  }

  // Emit close + create for each affected group
  for (const [index, newOpts] of affectedGroups) {
    const group = popups[index];
    actions.push({ type: "close", ids: group.ids });

    // Replace updated options, keep unchanged ones, add new proximity matches
    const updatedIds = new Set(newOpts.map((o) => o.id));
    const keptOptions = group.options.filter((o) => !updatedIds.has(o.id));
    const combinedOptions = [...keptOptions, ...newOpts];

    const clusters = clusterByProximity(combinedOptions, threshold);
    for (const cluster of clusters) {
      actions.push({ type: "create", options: cluster });
    }
  }

  // Cluster unmatched new options
  if (unmatched.length > 0) {
    const clusters = clusterByProximity(unmatched, threshold);
    for (const cluster of clusters) {
      actions.push({ type: "create", options: cluster });
    }
  }

  return actions;
}

function clusterByProximity(
  options: MapkaPopupOptionsResolved[],
  threshold: number,
): MapkaPopupOptionsResolved[][] {
  const clusters: MapkaPopupOptionsResolved[][] = [];

  for (const opt of options) {
    let merged = false;
    for (const cluster of clusters) {
      const representative = cluster[0];
      if (lngLatDistance(representative.lngLat, opt.lngLat) < threshold) {
        cluster.push(opt);
        merged = true;
        break;
      }
    }
    if (!merged) {
      clusters.push([opt]);
    }
  }

  return clusters;
}
