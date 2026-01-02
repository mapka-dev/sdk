import "@mapka/maplibre-gl-sdk/styles.css";

import { Map, MapStyle, type MapkaMarkerOptions } from "@mapka/maplibre-gl-sdk";

const map = new Map({
  apiKey: import.meta.env.VITE_MAPKA_PUBLIC_API_KEY,
  container: "map",
  style: MapStyle.MaputnikOSMLiberty,
  center: [16, 51],
  zoom: 10,
});

// Example 1: Simple marker with hover tooltip (title only)
const simpleHoverMarker = {
  lngLat: [16.0, 51.0] as [number, number],
  color: "#3b82f6", // blue
  popup: {
    trigger: "hover" as const,
    title: "Simple Hover Tooltip",
  },
};

// Example 2: Marker with click tooltip (title + description)
const clickTooltipMarker = {
  lngLat: [16.05, 51.0] as [number, number],
  color: "#10b981", // green
  popup: {
    trigger: "click" as const,
    title: "Click to Open",
    description:
      "This tooltip opens when you click on the marker. It includes a longer description to showcase multi-line text support.",
  },
};

// Example 3: Marker with full tooltip (all features)
const fullFeaturedMarker = {
  lngLat: [16.1, 51.0] as [number, number],
  color: "#ef4444", // red
  popup: {
    id: "marker-3",
    trigger: "click" as const,
    content: {
      title: "Premium Hotel",
      subtitle: "Downtown Location",
      description:
        "Experience luxury accommodation in the heart of the city with stunning views and world-class amenities.",
      rating: {
        value: 4.8,
        count: 342,
      },
      price: {
        current: "$299",
        original: "$399",
        suffix: "/night",
      },
      imageUrls: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
      ],
      onFavorite: (id: string) => {
        console.log(`Favorites marker: ${id}`);
      },
    },
  },
};

// Example 4: Restaurant with rating and price
const restaurantMarker = {
  lngLat: [16.0, 50.95] as [number, number],
  color: "#f59e0b", // orange
  popup: {
    id: "restaurant-1",
    trigger: "click" as const,
    title: "Italian Bistro",
    subtitle: "Mediterranean Cuisine",
    description: "Authentic Italian dishes prepared with fresh local ingredients.",
    rating: {
      value: 4.5,
      count: 128,
    },
    price: {
      current: "$$$",
      suffix: "per person",
    },
  },
};

// Example 5: Attraction with images
const attractionMarker = {
  lngLat: [16.05, 50.95] as [number, number],
  color: "#8b5cf6", // purple
  popup: {
    trigger: "hover" as const,
    title: "Historic Castle",
    description: "A beautiful medieval castle dating back to the 13th century.",
    imageUrls: [
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
      "https://images.unsplash.com/photo-1564594424543-21f7f48c51ca?w=400",
    ],
  },
};

// Example 6: Simple marker without tooltip
const simpleMarker = {
  lngLat: [16.1, 50.95] as [number, number],
  color: "#6b7280", // gray
};

// Example 7: Event with price (no discount)
const eventMarker = {
  lngLat: [15.95, 51.0] as [number, number],
  color: "#ec4899", // pink
  popup: {
    trigger: "click" as const,
    title: "Summer Music Festival",
    subtitle: "3-Day Pass",
    description:
      "Join us for three days of amazing live music performances from international and local artists.",
    price: {
      current: "$150",
      suffix: "Early Bird",
    },
  },
};

// Example 8: Shop with discounted price
const shopMarker = {
  lngLat: [15.95, 50.95] as [number, number],
  color: "#14b8a6", // teal
  popup: {
    trigger: "hover" as const,
    title: "Local Craft Shop",
    subtitle: "Handmade Goods",
    description: "Unique handcrafted items from local artisans.",
    price: {
      current: "$25",
      original: "$40",
      suffix: "average",
    },
    rating: {
      value: 4.9,
      count: 87,
    },
  },
};

const markers: MapkaMarkerOptions[] = [
  simpleHoverMarker,
  clickTooltipMarker,
  fullFeaturedMarker,
  restaurantMarker,
  attractionMarker,
  simpleMarker,
  eventMarker,
  shopMarker,
];

map.addMarkers(markers);
