import "@mapka/maplibre-gl-sdk/styles.css";

import { Map, MapStyle, type MapkaMarkerOptions, type MapkaPopupOptions } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
  maxPopups: 3,
});

// Example 1: Simple marker with hover popup (title only)
const simpleHoverMarker: MapkaMarkerOptions = {
  lngLat: [16.0, 51.0],
  color: "#3b82f6",
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
  color: "#10b981",
  popup: {
    trigger: "click",
    content: {
      title: "Click to Open",
      description:
        "This popup opens when you click on the marker. It includes a longer description to showcase multi-line text support.",
    },
  },
};

// Example 3: Marker with full popup (images, rows, primary action, favorite)
const fullFeaturedMarker: MapkaMarkerOptions = {
  lngLat: [16.1, 51.0],
  color: "#ef4444",
  popup: {
    id: "marker-3",
    trigger: "click",
    closeButton: true,
    content: {
      title: "Premium Hotel",
      description:
        "Experience luxury accommodation in the heart of the city with stunning views and world-class amenities.",
      imageUrls: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
      ],
      rows: [
        { name: "Rating", value: "4.8 (342 reviews)" },
        { name: "Price", value: "$299/night" },
      ],
      primaryAction: {
        label: "Book Now",
        onClick: () => console.log("Booking hotel..."),
      },
      onFavorite: (id: string) => {
        console.log(`Favorited marker: ${id}`);
      },
    },
  },
};

// Example 4: Restaurant with data rows
const restaurantMarker: MapkaMarkerOptions = {
  lngLat: [16.0, 50.95],
  color: "#f59e0b",
  popup: {
    id: "restaurant-1",
    trigger: "click",
    content: {
      title: "Italian Bistro",
      description: "Authentic Italian dishes prepared with fresh local ingredients.",
      rows: [
        { name: "Cuisine", value: "Mediterranean" },
        { name: "Rating", value: "4.5 (128 reviews)" },
        { name: "Price Range", value: "$$$" },
      ],
    },
  },
};

// Example 5: Attraction with images
const attractionMarker: MapkaMarkerOptions = {
  lngLat: [16.05, 50.95],
  color: "#8b5cf6",
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

// Example 6: Simple marker without popup
const simpleMarker: MapkaMarkerOptions = {
  lngLat: [16.1, 50.95],
  color: "#6b7280",
};

// Example 7: Popup with primary action button
const eventMarker: MapkaMarkerOptions = {
  lngLat: [15.95, 51.0],
  color: "#ec4899",
  popup: {
    trigger: "click",
    content: {
      title: "Summer Music Festival",
      description:
        "Join us for three days of amazing live music performances from international and local artists.",
      rows: [
        { name: "Date", value: "July 15-17, 2026" },
        { name: "Price", value: "$150 (Early Bird)" },
      ],
      primaryAction: {
        label: "Get Tickets",
        onClick: () => console.log("Getting tickets..."),
      },
    },
  },
};

// Example 8: Popup with custom HTML content
const customHtmlMarker: MapkaMarkerOptions = {
  lngLat: [15.95, 50.95],
  color: "#14b8a6",
  popup: {
    trigger: "click",
    content: (id: string) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="padding: 8px;">
          <strong>Custom HTML Popup</strong>
          <p style="margin: 4px 0;">This popup uses a raw HTMLElement for full control over the content.</p>
          <code>id: ${id}</code>
        </div>
      `;
      return el;
    },
  },
};

const markers: MapkaMarkerOptions[] = [
  simpleHoverMarker,
  clickPopupMarker,
  fullFeaturedMarker,
  restaurantMarker,
  attractionMarker,
  simpleMarker,
  eventMarker,
  customHtmlMarker,
];

map.addMarkers(markers);

// Example 9: Programmatic popup via map.openPopup()
map.on("load", () => {
  map.openPopup({
    id: "programmatic-popup",
    lngLat: [16.05, 51.05],
    closeButton: true,
    closeOnClick: true,
    content: {
      title: "Programmatic Popup",
      description: "This popup was opened via map.openPopup() after the map loaded.",
      primaryAction: {
        label: "Close",
        onClick: () => map.closePopup("programmatic-popup"),
      },
    },
  } satisfies MapkaPopupOptions);
});
