# Mapka JS SDK

![Publish](https://github.com/mapka-dev/sdk/actions/workflows/publish.yaml/badge.svg)

Additional features for Mapka JS SDK on top of MapLibre GL JS

## Packages

- [@mapka/maplibre-gl-sdk](packages/maplibre-gl-sdk/README.md)

## Quick start

```bash
yarn add @mapka/maplibre-gl-sdk
```

```tsx
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: "YOUR_MAPKA_PUBLIC_API_KEY_HERE",
  container: "map",
  style: "https://api.mapka.dev/v1/maputnik/styles/osm-liberty.json",
  center: [18, 54],
  zoom: 14,
});
```

## License

Apache-2.0
