import ky from "ky";
import { debounce, uniq } from "es-toolkit";
import { getMapkaUrl } from "../utils/url.js";
import type { MapkaMap } from "../map.js";

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
 * Resolve an icon that is missing from the map by loading it from the Mapka API.
 * MapLibre awaits the returned promise, so the image must be added before it settles.
 */
export async function resolveLayerIcon(map: MapkaMap, id: string): Promise<void> {
  if (map.hasImage(id) || !isStyleImage(id)) return;

  try {
    const svg = await loadMarkerIcon(id);
    const img = new Image(15, 15);
    img.src = `data:image/svg+xml;charset=utf-8;base64,${btoa(svg)}`;
    await img.decode();

    if (!map.hasImage(id)) {
      map.addImage(id, img);
    }
  } catch (err) {
    map.logger.warn(`[mapka] Failed to load layer icon "${id}":`, err);
  }
}
