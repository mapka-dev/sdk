import { useState } from "react";

export interface RealEstateProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: "house" | "condo" | "townhouse" | "apartment";
  imageUrl: string;
  isFavorite?: boolean;
}

interface RealEstatePopupProps {
  property: RealEstateProperty;
  onFavorite?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function RealEstatePopup({
  property,
  onFavorite,
  onViewDetails,
}: RealEstatePopupProps) {
  const [isFavorite, setIsFavorite] = useState(property.isFavorite ?? false);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.(property.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const propertyTypeLabels: Record<RealEstateProperty["propertyType"], string> =
    {
      house: "Single Family",
      condo: "Condo",
      townhouse: "Townhouse",
      apartment: "Apartment",
    };

  return (
    <div className="real-estate-popup">
      <div className="popup-image-container">
        <img src={property.imageUrl} alt={property.address} />
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? "active" : ""}`}
          onClick={handleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <span className="property-type-badge">
          {propertyTypeLabels[property.propertyType]}
        </span>
      </div>

      <div className="popup-content">
        <div className="popup-price">{formatPrice(property.price)}</div>

        <div className="popup-stats">
          <span>
            <strong>{property.bedrooms}</strong> bd
          </span>
          <span className="separator">|</span>
          <span>
            <strong>{property.bathrooms}</strong> ba
          </span>
          <span className="separator">|</span>
          <span>
            <strong>{formatNumber(property.sqft)}</strong> sqft
          </span>
        </div>

        <div className="popup-address">
          <div className="street">{property.address}</div>
          <div className="city-state">
            {property.city}, {property.state}
          </div>
        </div>

        <div className="popup-meta">
          <span>Built {property.yearBuilt}</span>
        </div>

        <button
          type="button"
          className="view-details-btn"
          onClick={() => onViewDetails?.(property.id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
