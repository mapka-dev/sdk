import "@mapka/maplibre-gl-sdk/styles.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { setWorkerUrl, Map, MapStyle } from "@mapka/maplibre-gl-sdk";

setWorkerUrl(workerUrl);

new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});
