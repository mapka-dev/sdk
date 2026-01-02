import "@mapka/maplibre-gl-sdk/styles.css";

import { MapkaExportControl, Map, type MapkaMarkerOptions } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: "https://api.mapka.dev/v1/maputnik/styles/osm-liberty.json",
  center: [16, 51],
  zoom: 10,
});

const markerWithAlwaysVisiblePopup: MapkaMarkerOptions = {
  lngLat: [16.1, 50.95],
  color: "#f59e0b", // orange
  popup: {
    trigger: "always",
    content: {
      title: "Always Visible",
      description: "This popup is always shown on the map.",
    },
  },
};

map.addMarkers([markerWithAlwaysVisiblePopup]);

map.addControl(
  new MapkaExportControl({
    hideControls: true,
    hideMarkers: false,
    hidePopups: false,
  }),
);
