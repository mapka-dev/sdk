import type { MarkerOptions, PopupOptions } from "maplibre-gl";

export interface MapkaPopupContent {
  title?: string;
  description?: string;
  imageUrls?: string[];
  onFavorite?: (id: string) => void;
}

type CreatePopupElement = (id: string) => HTMLElement;
type CreatePopupContent = (id: string) => MapkaPopupContent;

export interface MapkaPopupOptions extends PopupOptions {
  id?: string;
  lngLat: [number, number];
  trigger?: "hover" | "click" | "always";
  content: MapkaPopupContent | HTMLElement | CreatePopupElement | CreatePopupContent;
}

export type MapkaMarkerPopupOptions = Omit<MapkaPopupOptions, "lngLat">;

export interface MapkaMarkerOptions extends MarkerOptions {
  id?: string;
  lngLat: [number, number];
  color?: string;
  icon?: string;
  popup?: Omit<MapkaPopupOptions, "lngLat">;
}
