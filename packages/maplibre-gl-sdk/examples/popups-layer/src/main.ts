import "@mapka/maplibre-gl-sdk/styles.css";
import { Map, MapStyle } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});

map.on("load", () => {
  map.addSource("points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Wrocław",
            description: "Capital of Lower Silesia",
          },
          geometry: {
            type: "Point",
            coordinates: [17.0385, 51.1079],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Opole",
            description: "City on the Oder River",
          },
          geometry: {
            type: "Point",
            coordinates: [17.9213, 50.6751],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Legnica",
            description: "Historic copper mining town",
          },
          geometry: {
            type: "Point",
            coordinates: [16.1619, 51.207],
          },
        },
      ],
    },
  });

  map.addLayer({
    id: "points-layer",
    type: "circle",
    source: "points",
    paint: {
      "circle-radius": 8,
      "circle-color": "#007cbf",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
    metadata: {
      mapka: {
        popup: true,
      },
    },
  });
});
