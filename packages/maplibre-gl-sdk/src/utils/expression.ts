import type { Expression, MapGeoJSONFeature } from "maplibre-gl";

export function evaluateDataExpression(
  expression: Expression,
  feature: MapGeoJSONFeature,
): string | undefined {
  throw new Error("Not implemented", { cause: { expression, feature } });
}
