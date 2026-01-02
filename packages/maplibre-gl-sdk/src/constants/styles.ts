export const MapStyle = {
  MaputnikOSMLiberty: `https://api.mapka.dev/v1/maputnik/styles/osm-liberty.json`,
} as const;

export type MapStyle = (typeof MapStyle)[keyof typeof MapStyle];
