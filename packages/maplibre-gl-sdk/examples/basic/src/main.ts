import "@mapka/maplibre-gl-sdk/styles.css";
import { Map, MapStyle } from "@mapka/maplibre-gl-sdk";

new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});
