export interface MapkaPopupRating {
  value: number;
  count: number;
}

export interface MapkaPopupPrice {
  current: string;
  original?: string;
  suffix?: string;
}

export interface MapkaPopupOptions {
  id?: string;
  trigger?: "hover" | "click";
  title?: string;
  rating?: MapkaPopupRating;
  description?: string;
  subtitle?: string;
  price?: MapkaPopupPrice;
  imageUrls?: string[];
  onFavorite?: (id: string) => void;
}

export interface MapkaMarkerOptions {
  position: [number, number];
  color?: string;
  icon?: string;
  popup?: MapkaPopupOptions;
}
