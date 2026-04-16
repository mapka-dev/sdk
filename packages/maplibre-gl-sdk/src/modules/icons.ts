import ky from "ky";
import { debounce, uniq } from "es-toolkit";
import { getMapkaUrl } from "../utils/url.js";
import type { MapkaMap } from "../map.js";
import type { MapStyleImageMissingEvent } from "maplibre-gl";

interface Icon {
  id: string;
  svg: string;
}

const svgCache = new Map<string, string>();
const pendingResolvers = new Map<string, PromiseWithResolvers<string>>();
let pendingIds: string[] = [];

/**
 * Debounced batch fetch: pulls unique pending ids, hits the icons API
 * in one request, populates svgCache, and resolves waiting callers.
 */
const flushIcons = debounce(() => {
  const idsToFetch = uniq(pendingIds).filter((id) => !svgCache.has(id));
  if (idsToFetch.length === 0) return;

  pendingIds = [];

  ky.get(`${getMapkaUrl()}/v1/icons`, {
    searchParams: idsToFetch.map((id) => ["ids", id]),
  })
    .json<Icon[]>()
    .then((data) => {
      for (const { id, svg } of data) {
        svgCache.set(id, svg);
        const resolver = pendingResolvers.get(id);
        if (resolver) {
          resolver.resolve(svg);
          pendingResolvers.delete(id);
        }
      }
    })
    .catch((err) => {
      for (const id of idsToFetch) {
        const resolver = pendingResolvers.get(id);
        if (resolver) {
          resolver.reject(err);
          pendingResolvers.delete(id);
        }
      }
    });
}, 50);

/**
 * Fetch an icon's SVG source from the Mapka API.
 * Batched and cached across callers; concurrent requests for the same
 * id share one fetch.
 */
export function loadMarkerIcon(id: string): Promise<string> {
  const cached = svgCache.get(id);
  if (cached) return Promise.resolve(cached);

  const existing = pendingResolvers.get(id);
  if (existing) return existing.promise;

  const resolver = Promise.withResolvers<string>();
  pendingResolvers.set(id, resolver);
  pendingIds.push(id);
  flushIcons();
  return resolver.promise;
}

const isStyleImage = (id: string) => id.includes(":");

/**
 * Load any icons that are missing from the map from the Mapka API.
 * @see https://github.com/mapbox/mapbox-gl-js/issues/5529
 */
export function loadLayersIcons(map: MapkaMap, event: MapStyleImageMissingEvent) {
  if (map.hasImage(event.id) || !isStyleImage(event.id)) return;

  loadMarkerIcon(event.id)
    .then((svg) => {
      if (map.hasImage(event.id)) return;
      const img = new Image(15, 15);
      img.onload = () => {
        if (!map.hasImage(event.id)) {
          map.addImage(event.id, img);
        }
      };
      img.src = `data:image/svg+xml;charset=utf-8;base64,${btoa(svg)}`;
    })
    .catch((err) => {
      map.logger.warn(`[mapka] Failed to load layer icon "${event.id}":`, err);
    });
}
