import type { ExpressionSpecification, PopupOptions } from "maplibre-gl";

export interface MapkaPopupRow {
  name: string;
  value: unknown;
}

export interface MapkaPopupAction {
  label: string;
  onClick?: () => void;
}

export type MapkaLayerPopupRow = {
  name: ExpressionSpecification | string;
  value: ExpressionSpecification | unknown;
};

export interface MapkaPopupContent {
  title?: string;
  description?: string;
  rows?: MapkaPopupRow[];
  imageUrls?: string[];
  primaryAction?: MapkaPopupAction;
}

type CreatePopupElement = (id: string) => HTMLElement;
type CreatePopupContent = (id: string) => MapkaPopupContent;

export type MapkaPopupCreator =
  | HTMLElement
  | MapkaPopupContent
  | CreatePopupElement
  | CreatePopupContent;

export interface MapkaPopupOptions extends PopupOptions {
  id?: string;
  lngLat: [number, number];
  trigger?: "hover" | "click" | "always";
  content: MapkaPopupCreator;
}

export interface MapkaPopupOptionsResolved extends MapkaPopupOptions {
  id: string;
  content: HTMLElement | MapkaPopupContent;
}

export interface MapkaLayerPopupContent {
  title: ExpressionSpecification | string;
  description: ExpressionSpecification | string;
  rows?: MapkaLayerPopupRow[];
}

export interface MapkaLayerPopupOptions {
  id?: ExpressionSpecification | string;
  trigger?: "hover" | "click" | "always";
  content: MapkaLayerPopupContent;
}

export type MapkaMarkerPopupOptions = Omit<MapkaPopupOptions, "lngLat">;
