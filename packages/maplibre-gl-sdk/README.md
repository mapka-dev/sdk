# React Mapka MapLibre map components

```bash
yarn add @mapka/maplibre-gl-sdk

```

## Usage

```tsx
import * as mapkasdk from '@mapka/maplibre-gl-sdk';

const map = new mapkasdk.Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: mapka.MapStyle.STREETS,
  center: [18, 54],
  zoom: 14,
});
```
