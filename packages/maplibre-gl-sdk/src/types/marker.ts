import type { MarkerOptions, PopupOptions } from "maplibre-gl";

export interface MapkaPopupContent {
  title?: string;
  description?: string;
  imageUrls?: string[];
  onFavorite?: (id: string) => void;
}

export interface MapkaPopupOptions extends PopupOptions {
  id?: string;
  lngLat: [number, number];
  trigger?: "hover" | "click" | "always";
  content?: MapkaPopupContent | HTMLElement;
}

export type MapkaMarkerPopupOptions = Omit<MapkaPopupOptions, "lngLat">

export interface MapkaMarkerOptions extends MarkerOptions {
  id?: string;
  lngLat: [number, number];
  color?: string;
  icon?: string;
  popup?: Omit<MapkaPopupOptions, "lngLat">;
}
