import { randomInt, sample } from "es-toolkit";
import type { RealEstateProperty } from "./components/RealEstatePopup";

// US bounding box: [west, south, east, north]
export const US_BBOX: [number, number, number, number] = [
  -124.7844079, // West (California)
  24.396308, // South (Florida Keys)
  -66.9513812, // East (Maine)
  49.384358, // North (Washington/Canada border)
];

// Sample data for generating realistic real estate properties
const streetNames = [
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Elm",
  "Birch",
  "Walnut",
  "Spruce",
  "Willow",
  "Hickory",
  "Main",
  "Park",
  "Lake",
  "River",
  "Mountain",
  "Valley",
  "Forest",
  "Meadow",
  "Spring",
  "Sunset",
];

const streetTypes = ["St", "Ave", "Blvd", "Dr", "Ln", "Ct", "Way", "Rd", "Pl", "Cir"];

const cities = [
  { name: "Los Angeles", state: "CA" },
  { name: "New York", state: "NY" },
  { name: "Chicago", state: "IL" },
  { name: "Houston", state: "TX" },
  { name: "Phoenix", state: "AZ" },
  { name: "Philadelphia", state: "PA" },
  { name: "San Antonio", state: "TX" },
  { name: "San Diego", state: "CA" },
  { name: "Dallas", state: "TX" },
  { name: "Austin", state: "TX" },
  { name: "Jacksonville", state: "FL" },
  { name: "Fort Worth", state: "TX" },
  { name: "Columbus", state: "OH" },
  { name: "Charlotte", state: "NC" },
  { name: "San Francisco", state: "CA" },
  { name: "Indianapolis", state: "IN" },
  { name: "Seattle", state: "WA" },
  { name: "Denver", state: "CO" },
  { name: "Boston", state: "MA" },
  { name: "Nashville", state: "TN" },
  { name: "Portland", state: "OR" },
  { name: "Las Vegas", state: "NV" },
  { name: "Atlanta", state: "GA" },
  { name: "Miami", state: "FL" },
  { name: "Raleigh", state: "NC" },
];

const propertyTypes: RealEstateProperty["propertyType"][] = [
  "house",
  "condo",
  "townhouse",
  "apartment",
];

// Real estate image URLs (placeholder architecture/house images)
const propertyImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
];

export function generateProperty(id: string): RealEstateProperty {
  const city = sample(cities);
  const propertyType = sample(propertyTypes);
  const streetNumber = randomInt(100, 9999);
  const streetName = sample(streetNames);
  const streetType = sample(streetTypes);

  // Price ranges based on property type
  const priceRanges: Record<RealEstateProperty["propertyType"], [number, number]> = {
    house: [250000, 1500000],
    condo: [150000, 800000],
    townhouse: [200000, 950000],
    apartment: [100000, 600000],
  };

  const [minPrice, maxPrice] = priceRanges[propertyType];
  const price = randomInt(minPrice / 1000, maxPrice / 1000) * 1000;

  // Size and features based on property type
  const bedroomRanges: Record<RealEstateProperty["propertyType"], [number, number]> = {
    house: [2, 6],
    condo: [1, 3],
    townhouse: [2, 4],
    apartment: [1, 3],
  };

  const sqftRanges: Record<RealEstateProperty["propertyType"], [number, number]> = {
    house: [1200, 4500],
    condo: [600, 1800],
    townhouse: [1000, 2500],
    apartment: [500, 1500],
  };

  const bedrooms = randomInt(...bedroomRanges[propertyType]);
  const bathrooms = Math.max(1, bedrooms - randomInt(0, 1));
  const sqft = randomInt(...sqftRanges[propertyType]);
  const yearBuilt = randomInt(1950, 2024);

  return {
    id,
    address: `${streetNumber} ${streetName} ${streetType}`,
    city: city.name,
    state: city.state,
    price,
    bedrooms,
    bathrooms,
    sqft,
    yearBuilt,
    propertyType,
    imageUrl: sample(propertyImages),
    isFavorite: false,
  };
}
