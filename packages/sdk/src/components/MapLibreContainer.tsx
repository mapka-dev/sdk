import { type CSSProperties, forwardRef } from "react";

const containerId = "mapka-maplibre-container";

export const MapLibreContainer = forwardRef<HTMLDivElement, { style: CSSProperties }>(
  (props, ref) => {
    return <div id={containerId} ref={ref} {...props} />;
  },
);
