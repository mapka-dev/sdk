import * as maplibregl from "maplibre-gl";
import type { RequestTransformFunction, MapOptions } from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";

export interface MapkaMapOptions extends MapOptions {
  apiKey: string;
}

const noopTransformRequest: RequestTransformFunction = (url) => {
  return {
    url,
  };
};

const createTransformRequest =
  (apiKey: string, transformRequest?: RequestTransformFunction | null): RequestTransformFunction =>
  (url) => {
    if (url.includes("mapka.dev") || url.includes("mapka.localhost")) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      };
    }
    return transformRequest ? transformRequest(url) : noopTransformRequest(url);
  };

export class MapkaMap extends maplibregl.Map {
  constructor({ transformRequest, apiKey, ...props }: MapkaMapOptions) {
    super({
      ...props,
      transformRequest: createTransformRequest(apiKey, transformRequest),
    });

    super.on("styleimagemissing", (event: maplibregl.MapStyleImageMissingEvent) => {
      loadLayersIcons(this, event);
    });
  }
}
