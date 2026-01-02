# Mapka MapLibre SDK

```bash
yarn add @mapka/maplibre-gl-sdk

# or

npm install @mapka/maplibre-gl-sdk

```

## Usage

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map } from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: mapkasdk.MapStyle.STREETS,
  center: [18, 54],
  zoom: 14,
});
```

Create map with popups:

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map } from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: mapkasdk.MapStyle.STREETS,
  center: [18, 54],
  zoom: 14,
});

// Add initially open popup to map
map.openPopup({
  id: 'popup-1',
  trigger: 'always',
  content: {
    title: 'Map',
  },
});
```

Markers with optional popups:

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map } from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: mapkasdk.MapStyle.STREETS,
  center: [18, 54],
  zoom: 14,
});

// Add simple marker
map.addMarkers([
  {
    id: 'marker-1',
    lngLat: [18, 54],
  },
]);

// Add popup to marker
map.updateMarkers([
  {
    id: 'marker-1',
    lngLat: [18, 54],
    popup: {
      id: 'popup-1',
      trigger: 'click',
      content: {
        title: 'Marker 1',
      },
    },
  },
]);

map.removeMarkers();

```
