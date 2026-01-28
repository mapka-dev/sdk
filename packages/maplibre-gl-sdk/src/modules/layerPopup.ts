import { get } from "es-toolkit/compat";
import { isBoolean, isPlainObject } from "es-toolkit";
import type { MapMouseEvent, MapGeoJSONFeature, LngLat } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaLayerPopupOptions } from "../types/popup.js";
import type { MapkaPopupOptions } from "../types/popup.js";

export function openOnFeatureClickPopups(map: MapkaMap, { lngLat, point }: MapMouseEvent) {
  const features = map.queryRenderedFeatures(point);

  if (features.length === 0) {
    return;
  }

  const popups = getFeaturePopups(features, lngLat);

  if (popups.length === 0) {
    return;
  }

  for (const popup of popups) {
    map.openPopup(popup);
  }
}

function genericPropertiesToPopup(feature: MapGeoJSONFeature, lngLat: LngLat): MapkaPopupOptions {
  const { id, properties, layer } = feature;

  return {
    id: id ?? properties.id,
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

function getFeaturePopups(features: MapGeoJSONFeature[], lngLat: LngLat): MapkaPopupOptions[] {
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
      popups.push(buildConfigDrivenPopup(feature, mapkaPopup, lngLat));
    }
  }

  return popups;
}
