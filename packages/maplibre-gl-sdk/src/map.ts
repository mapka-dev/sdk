import * as maplibregl from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";
import { addMarkers, addMarkersStyleDiff } from "./modules/markers.js";
import type {
  RequestTransformFunction,
  MapStyleImageMissingEvent,
  MapOptions,
  StyleSwapOptions,
  StyleOptions,
  StyleSpecification,
} from "maplibre-gl";

export interface MapkaMapOptions extends MapOptions {
  apiKey: string;
  env?: "dev" | "prod" | "local";
}

const noopTransformRequest: maplibregl.RequestTransformFunction = (url) => {
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

const noopTransformStyle: maplibregl.TransformStyleFunction = (_, next) => {
  return next;
};

export class MapkaMap extends maplibregl.Map {
  static env: string = "prod";

  public constructor({ transformRequest, apiKey, ...options }: MapkaMapOptions) {
    super({
      ...options,
      transformRequest: createTransformRequest(apiKey, transformRequest),
    });

    super.on("styledata", (_: maplibregl.MapStyleDataEvent) => {
      addMarkers(this);
    });

    super.on("styleimagemissing", (event: MapStyleImageMissingEvent) => {
      loadLayersIcons(this, event);
    });
  }

  public setStyle(
    style: string | StyleSpecification,
    options: StyleSwapOptions & StyleOptions = {},
  ) {
    const { transformStyle = noopTransformStyle, ...rest } = options;

    super.setStyle(style, {
      ...rest,
      transformStyle: (prev, next) => {
        addMarkersStyleDiff(this, next);
        return transformStyle(prev, next);
      },
    });

    return this;
  }
}
