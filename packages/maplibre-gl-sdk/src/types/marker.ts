export interface MapkaTooltipRating {
  value: number;
  count: number;
}

export interface MapkaTooltipPrice {
  current: string;
  original?: string;
  suffix?: string;
}

export interface MapkaTooltipOptions {
  id?: string;
  trigger?: "hover" | "click";
  title?: string;
  rating?: MapkaTooltipRating;
  description?: string;
  subtitle?: string;
  price?: MapkaTooltipPrice;
  imageUrls?: string[];
  onFavorite?: (id: string) => void;
}

export interface MapkaMarkerOptions {
  position: [number, number];
  color?: string;
  icon?: string;
  tooltip?: MapkaTooltipOptions;
}
