import type { Expression, LayerSpecification } from "maplibre-gl";
import type { MapkaPopupRow } from "./popup.js";

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

export interface MapkaLayerPopupConfig {
  id?: Expression | string;
  title: Expression | string;
  description: Expression | string;
  rows?: Expression[] | MapkaPopupRow[];
}

export interface LayerWithMapkaMetadata {
  metadata?: {
    mapka?: {
      popup?: MapkaLayerPopupConfig | boolean;
    };
  };
}

export type MapkaLayerSpecification = LayerSpecification & LayerWithMapkaMetadata;
