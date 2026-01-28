import type { CustomLayerInterface, LayerSpecification, SourceSpecification } from "maplibre-gl";
import type { MapkaLayerPopupOptions } from "./popup.js";

export interface MapkaLayerConfig {
  /**
   * Layer id, layer can belong only to one group
   */
  value: string;
}

export interface MapkaLayerGroupConfig {
  /**
   * Unique identifier for the group, randomly generated
   */
  value: string;
  /**
   * Human readable label for the group
   */
  label: string;
  /**
   * Icon for the group
   */
  icon: string;
  /**
   * Children of the group
   * This could be other groups or layer items
   */
  children: MapkaLayerTreeConfig;
}

export type MapkaLayerTreeConfig = (MapkaLayerConfig | MapkaLayerGroupConfig)[];

export interface LayerWithMapkaMetadata {
  metadata?: {
    [key: string]: unknown;
    mapka?: {
      popup?: MapkaLayerPopupOptions | boolean;
    };
  };
}

export type MapkaLayerSpecification = LayerSpecification & LayerWithMapkaMetadata;

/**
 * Layer specification with embedded source
 */
export type MapkaLayerSpecificationWithEmbededSource = MapkaLayerSpecification & {
  source: SourceSpecification;
};

/**
 * Extends maplibregl.AddLayerObject with Mapka specific metadata
 */
export type MapkaAddLayerObject =
  | MapkaLayerSpecification
  | MapkaLayerSpecificationWithEmbededSource
  | CustomLayerInterface;
