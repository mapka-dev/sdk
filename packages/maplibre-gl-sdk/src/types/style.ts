import type { MapkaLayerTreeConfig } from "./layer.js";
import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { MapkaMarkerOptions } from "./marker.js";

export interface MapkaStyleSpecification extends StyleSpecification {
  metadata?: {
    mapka?: {
      layerGroups?: MapkaLayerTreeConfig;
      markers?: MapkaMarkerOptions[];
    };
  };
}
