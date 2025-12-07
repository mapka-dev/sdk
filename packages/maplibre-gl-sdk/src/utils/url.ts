import { MapkaMap } from "../map.js";

export function getMapkaUrl() {
  if (MapkaMap.env === "dev") {
    return "https://api.dev.mapka.dev";
  }
  if (MapkaMap.env === "local") {
    return "https://api.mapka.localhost";
  }
  return "https://api.mapka.dev";
}
