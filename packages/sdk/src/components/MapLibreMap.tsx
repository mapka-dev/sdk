import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";
import { isEqual } from "es-toolkit";
import { type FC, memo, useCallback, useEffect, useMemo, useRef, version } from "react";
import { MapLibreContainer } from "./MapLibreContainer.js";
import { MapLibreStyles } from "./MapLibreStyles.js";
import type maplibre from "maplibre-gl";

interface MapLibreMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string | StyleSpecification;
  width?: string | number;
  height?: string | number;
  mapkaApiKey?: string;
  showFeatureTooltip?: boolean;
  onMapLoaded?: (map: maplibre.Map) => void;
}

export const MapLibreMap: FC<MapLibreMapProps> = memo((props) => {
  const {
    width = "100%",
    height = "100%",
    center,
    zoom,
    style,
    onMapLoaded,
    mapkaApiKey,
    showFeatureTooltip,
  } = props;

  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibre.Map | null>(null);

  const mapkaAPIkeyRef = useRef<string | undefined>(mapkaApiKey);
  if (mapkaApiKey !== mapkaAPIkeyRef.current) {
    mapkaAPIkeyRef.current = mapkaApiKey;
  }

  /*
   * We want to this callback ref to be created only once. Deps update will be handled in dedicated useEffect
   * biome-ignore lint/correctness/useExhaustiveDependencies: ref callback is created only once
   */
  const initMap = useCallback((element: HTMLDivElement) => {
    if (!map.current && element) {
      import("maplibre-gl").then(({ default: maplibre }) => {
        const mapLibreMap = new maplibre.Map({
          container: element,
          style,
          center,
          zoom,
          transformRequest: (url) => {
            if (url.includes("mapka.dev") || url.includes("mapka.localhost")) {
              if (mapkaAPIkeyRef.current) {
                return {
                  url,
                  headers: {
                    Authorization: `Bearer ${mapkaAPIkeyRef.current}`,
                  },
                };
              }
            }
            return {
              url,
            };
          },
        });
        container.current = element;
        map.current = mapLibreMap;

        if (onMapLoaded) {
          mapLibreMap.once("load", () => {
            onMapLoaded(mapLibreMap);
          });
        }
      });
    }

    if (!version?.startsWith("19")) {
      return;
    }
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const currentMap = map.current;

  useEffect(() => {
    if (!currentMap) return;
    if (!Number.isInteger(zoom)) return;

    const currentZoom = currentMap.getZoom();
    if (!isEqual(currentZoom, zoom)) {
      currentMap.setZoom(zoom as number);
    }
  }, [currentMap, zoom]);

  useEffect(() => {
    if (!currentMap) return;
    if (!Array.isArray(center)) return;

    const currentCenter = currentMap.getCenter().toArray();
    if (!isEqual(currentCenter, center)) {
      currentMap.setCenter(center);
    }
  }, [currentMap, center]);

  useEffect(() => {
    if (!currentMap) return;
    currentMap.setStyle(style ?? null);
  }, [currentMap, style]);

  useEffect(() => {
    if (!showFeatureTooltip) return;

    const onClick = (event: maplibre.MapMouseEvent) => {
      const features = currentMap?.queryRenderedFeatures(event.point);
      if (!features) return;
      console.log(features);
    };
    currentMap?.on("click", onClick);

    return () => {
      currentMap?.off("click", onClick);
    };
  }, [currentMap, showFeatureTooltip]);

  const styles = useMemo(() => {
    return {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
    };
  }, [width, height]);

  return (
    <>
      <MapLibreStyles />
      <MapLibreContainer ref={initMap} style={styles} />
    </>
  );
});

MapLibreMap.displayName = "MapLibreMap";
