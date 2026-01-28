import type { PopupOptions } from "maplibre-gl";

export interface MapkaPopupRow {
  name: string;
  value: unknown;
}

export interface MapkaPopupContent {
  title?: string;
  description?: string;
  rows?: MapkaPopupRow[];
  imageUrls?: string[];
  onFavorite?: (id: string) => void;
}

type CreatePopupElement = (id: string) => HTMLElement;
type CreatePopupContent = (id: string) => MapkaPopupContent;

export interface MapkaPopupOptions extends PopupOptions {
  id?: string;
  lngLat: [number, number];
  trigger?: "hover" | "click" | "always";
  content: HTMLElement | MapkaPopupContent | CreatePopupElement | CreatePopupContent;
}

export type MapkaMarkerPopupOptions = Omit<MapkaPopupOptions, "lngLat">;
