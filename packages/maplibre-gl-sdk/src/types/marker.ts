import type { MarkerOptions } from "maplibre-gl";
import type { MapkaPopupOptions } from "./popup.js";

export interface MapkaMarkerOptions extends MarkerOptions {
  id?: string;
  lngLat: [number, number];
  color?: string;
  icon?: string;
  popup?: Omit<MapkaPopupOptions, "lngLat">;
}
