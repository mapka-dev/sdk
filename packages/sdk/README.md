# React Mapka MapLibre map components

```bash
yarn add @mapka/sdk

```

## Usage

```tsx
import * as mapkasdk from '@mapka/sdk';

const map = new mapkasdk.Map({
  apiKey: 'YOUR_MAPTILER_API_KEY_HERE',
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [16.62662018, 49.2125578], // starting position [lng, lat]
  zoom: 14, // starting zoom
});
```
