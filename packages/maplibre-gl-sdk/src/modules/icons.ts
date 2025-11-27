import { debounce, uniq } from "es-toolkit";
import { getMapkaUrl } from "../utils/url.js";
import type { MapkaMap } from "../map.js";
import type { MapStyleImageMissingEvent } from "maplibre-gl";

let missingIcons: string[] = [];
let loadedIcons: string[] = [];

interface Icon {
  id: string;
  svg: string;
}

/**
 * Load missing icons from Mapka API
 * Inspired by https://github.com/mapbox/mapbox-gl-js/issues/5529
 */
const loadIcons = debounce((map: MapkaMap) => {
  if (missingIcons.length === 0) {
    return;
  }
  const iconsToLoad = uniq(missingIcons).filter((id) => !loadedIcons.includes(id));
  loadedIcons = loadedIcons.concat(iconsToLoad);
  missingIcons = [];

  if (iconsToLoad.length === 0) {
    return;
  }

  const search = new URLSearchParams(iconsToLoad.map((id) => ["ids", id]));
  fetch(`${getMapkaUrl()}/v1/icons?${search}`)
    .then((response) => response.json())
    .then((data: Icon[]) => {
      data.forEach(({ svg, id }) => {
        const img = new Image(15, 15);
        img.onload = () => map.addImage(id, img);
        img.src = `data:image/svg+xml;charset=utf-8;base64,${btoa(svg)}`;
      });
    });
}, 50);

/**
 * Load any icons that are missing from the map
 * Only supports icons from Mapka API maki, temaki and tabler
 * @param map
 * @param event
 */
export function loadLayersIcons(map: MapkaMap, event: MapStyleImageMissingEvent) {
  if (
    event.id.startsWith("maki:") ||
    event.id.startsWith("temaki:") ||
    event.id.startsWith("tabler:")
  ) {
    missingIcons.push(event.id);
  }
  loadIcons(map);
}
