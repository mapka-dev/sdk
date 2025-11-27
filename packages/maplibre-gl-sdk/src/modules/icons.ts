import type * as maplibregl from "maplibre-gl";

export function loadLayersIcons(map: maplibregl.Map, event: maplibregl.MapStyleImageMissingEvent) {
  console.log("loadLayersIcons", map);
}
