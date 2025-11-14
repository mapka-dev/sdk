import * as maplibregl from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";

export class MapkaMap extends maplibregl.Map {
  constructor(props: maplibregl.MapOptions) {
    super(props);

    super.on("load", () => {
      loadLayersIcons(this);
    });
  }
}
