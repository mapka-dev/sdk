import "./main.css";
import "@mapka/maplibre-gl-sdk/styles.css";

import { Map } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: "https://api.mapka.dev/v1/maputnik/styles/osm-liberty.json",
  center: [16, 51],
  zoom: 10
});