import type { MarkerOptions } from "maplibre-gl";
import type { MapkaMarkerPopupOptions } from "./popup.js";

export interface MapkaMarkerOptions extends MarkerOptions {
  id?: string;
  lngLat: [number, number];
  color?: string;
  icon?: string;
  popup?: MapkaMarkerPopupOptions;
}
