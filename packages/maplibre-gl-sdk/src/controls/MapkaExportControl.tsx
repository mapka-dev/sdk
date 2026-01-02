// biome-ignore lint/correctness/noUnusedImports: preact jsx
import { h } from "preact";
import { render } from "preact";
import { DownloadIcon } from "../components/DownloadIcon.js";
import { ProgressDownIcon } from "../components/ProgressDownIcon.js";
import type { IControl } from "maplibre-gl";
import type { MapkaMap } from "../map.js";
import type { MapkaExportOptions } from "../types/export.js";

export interface MapkaExportControlOptions extends MapkaExportOptions {
  filename?: string;
}

const Button = ({ isExporting, onClick }: { isExporting: boolean; onClick: () => void }) => {
  return (
    <button
      type="button"
      className="maplibregl-ctrl maplibregl-ctrl-group"
      title="Export map as PNG"
      aria-label="Export map as PNG"
      disabled={isExporting}
      onClick={onClick}
    >
      {isExporting ? <ProgressDownIcon /> : <DownloadIcon />}
    </button>
  );
};

export class MapkaExportControl implements IControl {
  private map: MapkaMap | undefined;
  private container: HTMLDivElement | undefined;
  private options: MapkaExportControlOptions;
  private isExporting = false;

  constructor(options: MapkaExportControlOptions = {}) {
    this.options = {
      filename: "map-export",
      ...options,
    };
  }

  private downloadImage(img: HTMLImageElement): void {
    const link = document.createElement("a");
    link.download = `${this.options.filename}.png`;
    link.href = img.src;

    link.click();
    link.remove();
  }

  private handleError(error: Error) {
    this.map?.logger.error(error, "Failed to export map image");
  }

  private onClick = async (): Promise<void> => {
    if (!this.map || this.isExporting) return;

    this.isExporting = true;
    this.render();

    this.map
      .export({
        hideControls: true,
        hideMarkers: false,
        hidePopups: false,
        ...this.options,
      })
      .then((img) => this.downloadImage(img))
      .catch((error) => this.handleError(error))
      .finally(() => {
        this.isExporting = false;
        this.render();
      });
  };

  private render(): void {
    if (!this.container) {
      this.map?.logger.error("Export control container not found");
      return;
    }
    render(<Button isExporting={this.isExporting} onClick={this.onClick} />, this.container);
  }

  public onAdd(map: MapkaMap): HTMLElement {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "mapka-export-control";

    this.render();

    return this.container;
  }

  public onRemove(): void {
    this.container?.remove();
    this.map = undefined;
  }
}
