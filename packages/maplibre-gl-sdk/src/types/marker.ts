export interface MapkaTooltipOptions {
  trigger?: "hover" | "click";
  title?: string;
  description?: string;
  imageUrls?: string[];
}

export interface MapkaMarkerOptions {
  position: [number, number];
  color?: string;
  icon?: string;
  tooltip?: MapkaTooltipOptions;
}
