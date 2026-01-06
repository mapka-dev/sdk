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
  style: MapStyle.MaputnikOSMLiberty,
  center: [18, 54],
  zoom: 14,
});
```

## Markers

Add markers to the map with optional styling and popups.

### Basic Markers

```ts
// Add simple markers
map.addMarkers([
  {
    id: 'marker-1',
    lngLat: [18, 54],
  },
  {
    id: 'marker-2',
    lngLat: [18.01, 54.01],
    color: '#ff0000',
  },
]);
```

### Markers with Popups

```ts
map.addMarkers([
  {
    id: 'marker-1',
    lngLat: [18, 54],
    popup: {
      trigger: 'click', // 'click' | 'hover' | 'always'
      content: {
        title: 'Location Name',
        description: 'A description of this place',
      },
    },
  },
]);
```

### Updating Markers

```ts
map.updateMarkers([
  {
    id: 'marker-1',
    lngLat: [18.005, 54.005], // Update position
    popup: {
      trigger: 'click',
      content: {
        title: 'Updated Title',
        description: 'New description',
        imageUrls: ['https://example.com/image.jpg'],
      },
    },
  },
]);
```

### Removing Markers

```ts
map.removeMarkers();
```

### Marker Options

Markers also support all standard maplibre-gl [marker options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MarkerOptions/).

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string` | Unique identifier for the marker |
| `lngLat` | `[number, number]` | Marker position as `[longitude, latitude]` |
| `color` | `string` | Marker color (CSS color value) |
| `icon` | `string` | URL to a custom marker icon |
| `popup` | `MapkaMarkerPopupOptions` | Popup configuration (see Popup Options) |

## Popups

Popups can be attached to markers or displayed independently on the map.

### Standalone Popups

```ts
// Open a popup at a specific location
map.openPopup({
  lngLat: [18, 54],
  trigger: 'always',
  content: {
    title: 'Popup Title',
    description: 'Popup description text',
  },
});

// Open popup with custom ID
map.openPopup({
  id: 'custom-popup-id',
  lngLat: [18, 54],
  trigger: 'always',
  content: {
    title: 'My Popup',
  }
});
```

### Popup with Image Carousel

```ts
map.openPopup({
  lngLat: [18, 54],
  trigger: 'always',
  content: {
    title: 'Photo Gallery',
    description: 'Beautiful views',
    imageUrls: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ],
  },
});
```

### Popup with Favorite Action

```ts
map.openPopup({
  lngLat: [18, 54],
  trigger: 'always',
  content: {
    title: 'Save this place',
    imageUrls: ['https://example.com/image.jpg'],
    onFavorite: (id) => {
      console.log('Favorited popup:', id);
    },
  },
});
```

### Custom HTML Popup

```ts
// Using an HTMLElement
const customElement = document.createElement('div');
customElement.innerHTML = '<strong>Custom Content</strong>';

map.openPopup({
  lngLat: [18, 54],
  trigger: 'always',
  content: customElement,
});

// Using a factory function
map.openPopup({
  id: 'custom-popup-id',
  lngLat: [18, 54],
  trigger: 'always',
  content: (id) => {
    const el = document.createElement('div');
    el.innerHTML = `<p>Popup ID: ${id}</p>`;
    return el;
  },
});
```

### Updating Popups

Requires the `id` property to be set on the popup options.

```ts
map.updatePopup({
  id: 'popup-id',
  lngLat: [18, 54],
  trigger: 'always',
  content: {
    title: 'Updated Title',
    description: 'New content',
  },
});
```

### Closing and Removing Popups

```ts
// Close a specific popup by ID
map.closePopup('popup-id');

// Remove all visible popups
map.removePopups();
```

### Popup Options

Popups also support all standard maplibre-gl [popup options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/PopupOptions/).

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string` | Unique identifier for the popup |
| `lngLat` | `[number, number]` | Popup position as `[longitude, latitude]` |
| `trigger` | `'hover' \| 'click' \| 'always'` | When the popup should appear |
| `content` | `MapkaPopupContent \| HTMLElement \| Function` | Popup content (see below) |

### Popup Content Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | `string` | Popup title text |
| `description` | `string` | Popup description text |
| `imageUrls` | `string[]` | Array of image URLs for the carousel |
| `onFavorite` | `(id: string) => void` | Callback when favorite button is clicked |

### Max Popups

Control how many popups can be open simultaneously:

```ts
const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: MapStyle.MaputnikOSMLiberty,
  maxPopups: 3, // Allow up to 3 popups open at once (default: 1)
});
```

## Exporting Maps

### Using the Export Control

Add a UI button to export the map as PNG:

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { 
  Map, 
  MapStyle, 
  MapkaExportControl 
} from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: MapStyle.MaputnikOSMLiberty,
  center: [18, 54],
  zoom: 14,
});

// Add export control with default options
map.addControl(new MapkaExportControl());

// Or with custom filename
map.addControl(new MapkaExportControl({
  filename: 'my-custom-map',
}));

// Or with additional export options
map.addControl(new MapkaExportControl({
  filename: 'clean-map',
  hideControls: true,
  hideMarkers: true,
  hidePopups: true,
}));
```

### Programmatic Export

Export the map programmatically using the `export()` method:

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map, MapStyle } from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: MapStyle.MaputnikOSMLiberty,
  center: [18, 54],
  zoom: 14,
});

// Basic export - returns an HTMLImageElement
const image = await map.export();

// Export with options
const image = await map.export({
  hideControls: true,  // Hide map controls in export
  hideMarkers: false,  // Show markers in export
  hidePopups: false,   // Show popups in export
});

// Export specific bounding box
const image = await map.export({
  bbox: [17.9, 53.9, 18.1, 54.1], // [west, south, east, north]
});

// Download the exported image
function downloadImage(img: HTMLImageElement, filename: string) {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = img.src;
  link.click();
}

const image = await map.export({ hideControls: true });
downloadImage(image, 'my-map-export');
```

### Export Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hideControls` | `boolean` | `false` | Hide map controls in the exported image |
| `hideMarkers` | `boolean` | `false` | Hide markers in the exported image |
| `hidePopups` | `boolean` | `false` | Hide popups in the exported image |
| `bbox` | `[number, number, number, number]` | - | Bounding box to export `[west, south, east, north]` |

### Export Control Options

The `MapkaExportControl` accepts all export options plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filename` | `string` | `'map-export'` | Filename for the downloaded PNG (without extension) |

## Drawing on Maps

The `MapkaDrawControl` provides drawing tools powered by [Terra Draw](https://github.com/JamesLMilner/terra-draw), allowing users to create and edit geographic features directly on the map.

### Using the Draw Control

```ts
import "@mapka/maplibre-gl-sdk/styles.css";
import { Map, MapStyle, MapkaDrawControl } from '@mapka/maplibre-gl-sdk';

const map = new Map({
  apiKey: 'YOUR_MAPKA_API_KEY_HERE',
  container: 'map',
  style: MapStyle.MaputnikOSMLiberty,
  center: [18, 54],
  zoom: 14,
});

// Add draw control with all modes
const drawControl = new MapkaDrawControl();
map.addControl(drawControl, 'top-right');

// Or with specific modes only
const drawControl = new MapkaDrawControl({
  modes: ['select', 'polygon', 'rectangle'],
  defaultMode: 'polygon',
});
map.addControl(drawControl, 'top-right');
```

### Available Drawing Modes

| Mode | Description |
|------|-------------|
| `select` | Select and edit existing features (drag, resize, delete vertices) |
| `polygon` | Draw polygons by clicking to add vertices |
| `rectangle` | Draw rectangles (click-move-click or click-drag) |
| `circle` | Draw circles (click-move-click or click-drag) |
| `linestring` | Draw lines by clicking to add vertices |
| `freehand` | Draw freehand shapes by dragging |

### Getting Drawn Features

```ts
// Get all drawn features as GeoJSON
const features = drawControl.getFeatures();
console.log(features);

// Listen for drawing events via Terra Draw
const terraDraw = drawControl.getTerraDraw();
if (terraDraw) {
  terraDraw.on('finish', (id) => {
    console.log('Feature completed:', id);
    console.log('All features:', drawControl.getFeatures());
  });

  terraDraw.on('change', (ids, type) => {
    console.log('Features changed:', ids, type);
  });
}
```

### Programmatic Control

```ts
// Set the active drawing mode
drawControl.setMode('polygon');

// Get the current mode
const currentMode = drawControl.getMode();


// Access the underlying Terra Draw instance for advanced usage
const terraDraw = drawControl.getTerraDraw();

// Clear all drawn features
drawControl.clear();
```

### Draw Control Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `modes` | `DrawMode[]` | All modes | Array of modes to enable in the control |
| `defaultMode` | `DrawMode` | `'static'` | Initial drawing mode when control is added |

### DrawMode Type

```ts
type DrawMode = 'static' | 'select' | 'polygon' | 'rectangle' | 'circle' | 'linestring' | 'freehand';
```

### Selection Mode Features

When in `select` mode, users can:

- **Drag features** - Move entire shapes by dragging
- **Edit vertices** - Drag individual points to reshape
- **Add midpoints** - Click midpoints to add new vertices (polygon, rectangle, linestring)
- **Delete vertices** - Remove vertices from shapes (polygon, rectangle, linestring)
