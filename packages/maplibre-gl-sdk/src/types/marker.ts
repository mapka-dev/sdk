import type { MarkerOptions } from "maplibre-gl";
import type { MapkaMarkerPopupOptions } from "./popup.js";

export interface MapkaMarkerOptions extends Omit<MarkerOptions, "color"> {
  id?: string;
  lngLat: [number, number];
  /** Mapka icon id (e.g. `"maki:restaurant"`). Omit to use the default pin. */
  icon?: string;
  /** CSS color applied to the SVG fill. Default pin uses `#3FB1CE` when unset. */
  color?: string;
  popup?: MapkaMarkerPopupOptions;
}
