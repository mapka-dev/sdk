import "@mapka/maplibre-gl-sdk/styles.css";

import { Map, MapkaExportControl, MapStyle, type MapkaMarkerOptions } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});

// Example 1: Simple marker with hover popup (title only)
const simpleHoverMarker: MapkaMarkerOptions = {
  lngLat: [16.0, 51.0],
  color: "#3b82f6", // blue
  popup: {
    trigger: "hover",
    content: {
      title: "Simple Hover Popup",
    },
  },
};

// Example 2: Marker with click popup (title + description)
const clickPopupMarker: MapkaMarkerOptions = {
  lngLat: [16.05, 51.0],
  color: "#10b981", // green
  popup: {
    trigger: "click",
    content: {
      title: "Click to Open",
      description:
        "This popup opens when you click on the marker. It includes a longer description to showcase multi-line text support.",
    },
  },
};

// Example 3: Marker with full popup (images + favorite action)
const fullFeaturedMarker: MapkaMarkerOptions = {
  lngLat: [16.1, 51.0],
  color: "#ef4444", // red
  popup: {
    id: "hotel-1",
    trigger: "click",
    content: {
      title: "Premium Hotel",
      description:
        "Experience luxury accommodation in the heart of the city with stunning views and world-class amenities.",
      imageUrls: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
      ],
      onFavorite: (id: string) => {
        console.log(`Favorited marker: ${id}`);
      },
    },
  },
};

// Example 4: Marker with images on hover
const attractionMarker: MapkaMarkerOptions = {
  lngLat: [16.0, 50.95],
  color: "#8b5cf6", // purple
  popup: {
    trigger: "hover",
    content: {
      title: "Historic Castle",
      description: "A beautiful medieval castle dating back to the 13th century.",
      imageUrls: [
        "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
        "https://images.unsplash.com/photo-1564594424543-21f7f48c51ca?w=400",
      ],
    },
  },
};

// Example 5: Simple marker without popup
const simpleMarker: MapkaMarkerOptions = {
  lngLat: [16.05, 50.95],
  color: "#6b7280", // gray
};

// Example 6: Always visible popup
const alwaysVisibleMarker: MapkaMarkerOptions = {
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

const markers: MapkaMarkerOptions[] = [
  simpleHoverMarker,
  clickPopupMarker,
  fullFeaturedMarker,
  attractionMarker,
  simpleMarker,
  alwaysVisibleMarker,
];

map.addMarkers(markers);

map.addControl(new MapkaExportControl());
