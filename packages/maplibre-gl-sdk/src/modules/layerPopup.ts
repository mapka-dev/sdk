import { get } from "es-toolkit/compat";
import { isBoolean, isPlainObject } from "es-toolkit";
import { closeOnMapClickPopups, getPopupId } from "./popup.js";
import type { MapMouseEvent, MapGeoJSONFeature, LngLat, Point } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaLayerPopupOptions } from "../types/popup.js";
import type { MapkaPopupOptions } from "../types/popup.js";

function genericPropertiesToPopup(feature: MapGeoJSONFeature, lngLat: LngLat): MapkaPopupOptions {
  const { id, properties, layer } = feature;

  return {
    id: id ?? properties.id ?? getPopupId(layer),
    lngLat: lngLat.toArray(),
    content: {
      title: layer.id,
      rows: Object.entries(properties).map(([key, value]) => ({
        name: key,
        value: value,
      })),
    },
  };
}
function buildConfigDrivenPopup(
  feature: MapGeoJSONFeature,
  config: MapkaLayerPopupOptions,
  lngLat: LngLat,
): MapkaPopupOptions {
  throw new Error("Not implemented", { cause: { config, feature, lngLat } });
}

function getFeaturePopups(
  map: MapkaMap,
  point: Point,
  lngLat: LngLat,
  trigger: "click" | "hover",
): MapkaPopupOptions[] {
  const features = map.queryRenderedFeatures(point);
  const popups: MapkaPopupOptions[] = [];

  for (const feature of features) {
    const {
      layer: { metadata },
    } = feature;

    const mapkaPopup = get(metadata, "mapka.popup") as MapkaLayerPopupOptions | boolean | undefined;

    if (!mapkaPopup) {
      continue;
    }

    if (isBoolean(mapkaPopup)) {
      popups.push(genericPropertiesToPopup(feature, lngLat));
      continue;
    }

    if (isPlainObject(mapkaPopup)) {
      if (mapkaPopup.trigger && mapkaPopup.trigger !== trigger) {
        continue;
      }
      popups.push(buildConfigDrivenPopup(feature, mapkaPopup, lngLat));
    }
  }

  return popups;
}

export function openClickPopups(map: MapkaMap, { lngLat, point }: MapMouseEvent) {
  closeOnMapClickPopups(map);

  const featurePopups = getFeaturePopups(map, point, lngLat, "click");
  if (featurePopups.length === 0) {
    return;
  }
  map.openPopup(featurePopups);
}

export function openOnHoverPopups(map: MapkaMap, { lngLat, point }: MapMouseEvent) {
  const featurePopups = getFeaturePopups(map, point, lngLat, "hover");

  if (featurePopups.length === 0) {
    return;
  }
  map.openPopup(featurePopups);
}
