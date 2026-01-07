import * as maplibregl from "maplibre-gl";
import { loadLayersIcons } from "./modules/icons.js";
import {
  closeOnMapClickPopups,
  closePopupsById,
  openPopup,
  removePopups,
  updatePopup,
} from "./modules/popup.js";
import {
  addMarkers,
  addStyleDiffMarkers,
  addStyleMarkers,
  removeMarkers,
  updateMarkers,
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
import type { MapkaExportOptions } from "./types/export.js";
import { exportMap } from "./modules/export.js";

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

export type MapMapkaPopup = {
  id: string;
  container: HTMLElement;
  options: MapkaPopupOptions;
  popup: Popup;
};

export type MapMapkaMarker = {
  id: string;
  options: MapkaMarkerOptions;
  marker: Marker;
};

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export class MapkaMap extends maplibregl.Map {
  static env: string = "prod";

  public logger: Logger = console;
  public markers: MapMapkaMarker[] = [];

  public maxPopups: number = 1;
  public popups: MapMapkaPopup[] = [];

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
      addStyleMarkers(this);
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
        addStyleDiffMarkers(this, next);
        return transformStyle(prev, next);
      },
    });

    return this;
  }

  public addMarkers(markers: MapkaMarkerOptions[]) {
    addMarkers(this, markers);
  }

  public updateMarkers(markers: MapkaMarkerOptions[]) {
    updateMarkers(this, markers);
  }

  public removeMarkers() {
    removeMarkers(this);
  }

  public openPopup(popup: MapkaPopupOptions) {
    return openPopup(this, popup);
  }

  public closePopup(id: string) {
    closePopupsById(this, id);
  }

  public updatePopup(popup: MapkaPopupOptions) {
    return updatePopup(this, popup);
  }

  public removePopups() {
    removePopups(this);
  }

  public async export(options?: MapkaExportOptions) {
    return exportMap(this, options);
  }
}
