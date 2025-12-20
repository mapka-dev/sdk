import * as maplibregl from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";
import {
  closeOnMapClickPopups,
  closePopupsById,
  getPopupId,
  openPopup,
  updatePopup,
} from "./modules/popup.js";
import {
  addMarkers,
  addMarkersStyleDiff,
  removeMarkers,
  addMarkersOnMap,
} from "./modules/markers.js";
import type {
  Marker,
  Popup,
  RequestTransformFunction,
  MapStyleImageMissingEvent,
  MapOptions,
  TransformStyleFunction,
  StyleSwapOptions,
  StyleOptions,
  StyleSpecification,
} from "maplibre-gl";
import type { MapkaMarkerOptions, MapkaPopupOptions } from "./types/marker.js";

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
  options: MapkaPopupOptions;
  popup: Popup;
};

export class MapkaMap extends maplibregl.Map {
  static env: string = "prod";

  public manualMarkers: boolean = false;
  public markers: Marker[] = [];

  public maxPopups: number = 1;
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
    super.on("click", () => {
      closeOnMapClickPopups(this);
    });

    super.on("style.load", () => {
      if (!this.manualMarkers) {
        removeMarkers(this);
      }
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
        if (!this.manualMarkers) {
          removeMarkers(this);
        }
        this.markers = addMarkersStyleDiff(this, next);
        return transformStyle(prev, next);
      },
    });

    return this;
  }

  public setMarkers(markers: MapkaMarkerOptions[]) {
    removeMarkers(this);
    this.manualMarkers = true;
    this.markers = addMarkersOnMap(this, markers);
  }

  public openPopup(popup: MapkaPopupOptions, id: string = getPopupId(popup)) {
    return openPopup(this, popup, id);
  }

  public closePopup(id: string) {
    closePopupsById(this, id);
  }

  public updatePopup(popup: MapkaPopupOptions, id: string = getPopupId(popup)) {
    return updatePopup(this, popup, id);
  }
}
