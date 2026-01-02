import type { IControl } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaExportOptions } from "../types/export.js";

export interface MapkaExportControlOptions extends MapkaExportOptions {
  filename?: string;
}

export class MapkaExportControl implements IControl {
  private map: MapkaMap | undefined;
  private container: HTMLDivElement | undefined;
  private button: HTMLButtonElement | undefined;
  private options: MapkaExportControlOptions;

  constructor(options: MapkaExportControlOptions = {}) {
    this.options = {
      filename: "map-export",
      ...options,
    };
  }

  public onAdd(map: MapkaMap): HTMLElement {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "maplibregl-ctrl-export";
    this.button.title = "Export map as PNG";
    this.button.setAttribute("aria-label", "Export map as PNG");
    this.button.addEventListener("click", this.onClick);

    const icon = document.createElement("span");
    icon.className = "maplibregl-ctrl-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z"/></svg>`;

    this.button.appendChild(icon);
    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove(): void {
    this.button?.removeEventListener("click", this.onClick);
    this.container?.remove();
    this.map = undefined;
  }

  private onClick = async (): Promise<void> => {
    if (!this.map) return;

    this.button?.classList.add("maplibregl-ctrl-export-loading");

    try {
      const img = await this.map.export({
        hideControls: true,
        hideMarkers: false,
        hidePopups: false,
        ...this.options,
      });
      this.downloadImage(img);
    } catch (error) {
      console.error("Failed to export map:", error);
    } finally {
      this.button?.classList.remove("maplibregl-ctrl-export-loading");
    }
  };

  private downloadImage(img: HTMLImageElement): void {
    const link = document.createElement("a");
    link.download = `${this.options.filename}.png`;
    link.href = img.src;
    link.click();
    link.remove();
  }
}
