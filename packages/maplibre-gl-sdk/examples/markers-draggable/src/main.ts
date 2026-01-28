import "@mapka/maplibre-gl-sdk/styles.css";

import { Map, MapStyle, type MapkaMarkerOptions } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  maxPopups: 2,
  zoom: 10,
});

const draggableWithAlwaysPopup: MapkaMarkerOptions = {
  lngLat: [16.1, 50.95],
  color: "#f59e0b",
  draggable: true,
  popup: {
    id: "draggable-always-popup",
    trigger: "always",
    content: {
      title: "Initially Visible",
      description: "This popup is initially visible",
    },
  },
};

const draggableWithClickPopup: MapkaMarkerOptions = {
  lngLat: [16.2, 50.95],
  color: "#191713ff",
  draggable: true,
  popup: {
    id: "draggable-click-popup",
    trigger: "click",
    content: {
      title: "Visible on click",
      description: "This popup is visible on click",
    },
  },
};

const markers: MapkaMarkerOptions[] = [draggableWithClickPopup, draggableWithAlwaysPopup];

map.addMarkers(markers);
