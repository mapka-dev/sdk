import Supercluster from "supercluster";
import type { MapkaMap, MapMapkaPopup } from "../map.js";
import type { MapkaPopupOptionsResolved } from "../types/popup.js";

export type ClosePopupAction = { type: "close"; ids: string[] };
export type CreatePopupAction = { type: "create"; options: MapkaPopupOptionsResolved[] };

export type PopupGroupAction = ClosePopupAction | CreatePopupAction;

interface PopupCluster {
  options: MapkaPopupOptionsResolved[];
  lngLat: number[];
}

interface PopupPointProps {
  index: number;
}

const WORLD_BOUNDS: [number, number, number, number] = [-180, -90, 180, 90];

function clustersByLocation(
  previous: MapkaPopupOptionsResolved[],
  newOptions: MapkaPopupOptionsResolved[],
  zoom: number,
): PopupCluster[] {
  const all = [...previous, ...newOptions];

  const features: Supercluster.PointFeature<PopupPointProps>[] = all.map(({ lngLat }, index) => ({
    type: "Feature",
    properties: { index },
    geometry: {
      type: "Point",
      coordinates: lngLat,
    },
  }));

  const sc = new Supercluster<PopupPointProps>({
    radius: 20,
    extent: 512,
  });
  sc.load(features);

  const results = sc.getClusters(WORLD_BOUNDS, zoom);
  const clusters: PopupCluster[] = [];

  for (const { properties, geometry } of results) {
    if ("cluster" in properties) {
      const leaves = sc.getLeaves(properties.cluster_id, Infinity);
      clusters.push({
        options: leaves.map((point) => all[point.properties.index]),
        lngLat: geometry.coordinates,
      });
    } else {
      const opt = all[properties.index];
      clusters.push({
        options: [opt],
        lngLat: opt.lngLat,
      });
    }
  }
  return clusters;
}

function clustersFromPopups(
  notUpdated: MapkaPopupOptionsResolved[],
  popups: MapMapkaPopup[],
): PopupCluster[] {
  const clusters: PopupCluster[] = [];
  for (const popup of popups) {
    clusters.push({
      options: popup.options.filter((opt) => notUpdated.includes(opt)),
      lngLat: popup.popup.getLngLat().toArray(),
    });
  }
  return clusters.filter((cluster) => cluster.options.length > 0);
}

function clusterKey(cluster: PopupCluster): string {
  return cluster.options
    .map((o) => o.id)
    .sort()
    .join("-");
}

function actionsByClustersChanges(
  prev: PopupCluster[],
  next: PopupCluster[],
): {
  close: ClosePopupAction[];
  create: CreatePopupAction[];
} {
  const prevByKey = new Map(prev.map((c) => [clusterKey(c), c]));
  const nextByKey = new Map(next.map((c) => [clusterKey(c), c]));

  const close: ClosePopupAction[] = [];
  const create: CreatePopupAction[] = [];

  for (const [key, cluster] of prevByKey) {
    if (!nextByKey.has(key)) {
      close.push({
        type: "close",
        ids: cluster.options.map((o) => o.id),
      });
    }
  }

  for (const [key, cluster] of nextByKey) {
    if (!prevByKey.has(key)) {
      create.push({
        type: "create",
        options: cluster.options,
      });
    }
  }

  return { close, create };
}

function actionsByProximity(
  popups: MapMapkaPopup[],
  newOptions: MapkaPopupOptionsResolved[],
  zoom: number,
): PopupGroupAction[] {
  const updated: MapkaPopupOptionsResolved[] = [];
  const nonUpdated: MapkaPopupOptionsResolved[] = [];

  for (const popup of popups) {
    for (const opt of popup.options) {
      if (newOptions.find((o) => o.id === opt.id)) {
        updated.push(opt);
      } else {
        nonUpdated.push(opt);
      }
    }
  }

  const prevClusters = clustersFromPopups(nonUpdated, popups);
  const nextClusters = clustersByLocation(nonUpdated, newOptions, zoom);
  const { close, create } = actionsByClustersChanges(prevClusters, nextClusters);

  const updatedIds = updated.map((opt) => opt.id);
  const closeIds = close.flatMap((opt) => opt.ids);

  return [
    {
      type: "close" as const,
      ids: updatedIds.concat(closeIds),
    },
    ...create,
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

  if (map.scrollPopups) {
    return actionsByProximity(popups, newOptions, zoom);
  } else {
    return actionsByChanges(popups, newOptions);
  }
}
