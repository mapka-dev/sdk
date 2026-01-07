import "@mapka/maplibre-gl-sdk/styles.css";
import { Map, MapStyle, MapkaDrawControl } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});

const drawControl = new MapkaDrawControl({
  defaultMode: "select",
  modes: ["select", "polygon", "rectangle", "circle", "linestring", "freehand"],
});

map.addControl(drawControl, "top-right");

// Log drawn features when they change
const terraDraw = drawControl.getTerraDraw();
if (terraDraw) {
  terraDraw.on("finish", (id) => {
    console.log("Feature finished:", id);
    console.log("All features:", drawControl.getFeatures());
  });

  terraDraw.on("change", (ids, type) => {
    console.log("Features changed:", ids, type);
  });
}
