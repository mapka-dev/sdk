import type { MapkaPopupRow } from "../types/popup.js";

export function displayRowValue(value: unknown) {
  if (value == null) {
    return "-";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

export function displayRowName(name: string) {
  return name;
}

export function PopupDataRows({ rows }: { rows: MapkaPopupRow[] }) {
  return (
    <dl class="mapka-popup-rows">
      {rows.map((row, index) => (
        <div key={index} class="mapka-popup-row">
          <dt class="mapka-popup-row-label">{displayRowName(row.name)}</dt>
          <dd class="mapka-popup-row-value">{displayRowValue(row.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
