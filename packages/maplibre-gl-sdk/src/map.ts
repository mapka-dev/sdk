import * as maplibregl from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";
import { closePopup, getPopupId, openPopup, updatePopup } from "./modules/popup.js";
import { addMarkers, addMarkersStyleDiff, updateMarkersOnMap } from "./modules/markers.js";
import type {
  Marker,
  Popup,
  LngLat,
  RequestTransformFunction,
  MapStyleImageMissingEvent,
  MapOptions,
  TransformStyleFunction,
  StyleSwapOptions,
  StyleOptions,
  StyleSpecification,
} from "maplibre-gl";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "./types/marker.js";
import { get } from "http";

export interface MapkaMapOptions extends MapOptions {
  maxPopups?: number;

  apiKey: string;
  env?: "dev" | "prod" | "local";
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

const noopTransformStyle: TransformStyleFunction = (_, next) => {
  return next;
};

type MapkaPopup = {
  id: string;
  container: HTMLElement;
  lngLat: LngLat;
  options: MapkaPopupOptions;
  popup: Popup;
};

export class MapkaMap extends maplibregl.Map {
  static env: string = "prod";

  public maxPopups: number = 1;
  public markers: Marker[] = [];
  public popups: MapkaPopup[] = [];

  public constructor({ transformRequest, apiKey, maxPopups = 1, ...options }: MapkaMapOptions) {
    super({
      ...options,
      transformRequest: createTransformRequest(apiKey, transformRequest),
    });

    this.maxPopups = maxPopups;

    super.on("styleimagemissing", (event: MapStyleImageMissingEvent) => {
      loadLayersIcons(this, event);
    });

    super.on("style.load", () => {
      this.markers = addMarkers(this);
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
        this.markers = addMarkersStyleDiff(this, next);
        return transformStyle(prev, next);
      },
    });

    return this;
  }

  public openPopup(
    lngLat: LngLat,
    popupOptions: MapkaPopupOptions,
    id: string = getPopupId(lngLat, popupOptions),
  ) {
    return openPopup(this, lngLat, popupOptions, id);
  }

  public closePopup(id: string) {
    closePopup(this, id);
  }

  public updatePopup(
    lngLat: LngLat,
    popupOptions: MapkaPopupOptions,
    id: string = getPopupId(lngLat, popupOptions),
  ) {
    return updatePopup(this, lngLat, popupOptions, id);
  }

  public setMarkers(markers: MapkaMarkerOptions[]) {
    this.markers = updateMarkersOnMap(this, markers);
  }
}
