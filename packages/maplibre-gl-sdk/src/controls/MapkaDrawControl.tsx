// biome-ignore lint/correctness/noUnusedImports: preact jsx
import { h } from "preact";
import { render } from "preact";
import maplibregl from "maplibre-gl";
import {
  TerraDraw,
  TerraDrawSelectMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawCircleMode,
  TerraDrawLineStringMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { SelectIcon } from "../components/SelectIcon.js";
import { PolygonIcon } from "../components/PolygonIcon.js";
import { RectangleIcon } from "../components/RectangleIcon.js";
import { CircleIcon } from "../components/CircleIcon.js";
import { LineIcon } from "../components/LineIcon.js";
import type { IControl } from "maplibre-gl";
import type { GeoJSONStoreFeatures } from "terra-draw";
import type { MapkaMap } from "../map.js";

export type DrawMode = "static" | "select" | "polygon" | "rectangle" | "circle" | "linestring";

type ActiveDrawMode = Exclude<DrawMode, "static">;

export interface MapkaDrawControlOptions {
  /** Default mode when control is added */
  defaultMode?: DrawMode;
  /** Modes to enable in the control */
  modes?: DrawMode[];
}

interface ToolbarProps {
  activeMode?: DrawMode;
  availableModes: DrawMode[];
  onModeChange: (mode: DrawMode) => void;
}

const ModeButton = ({
  mode,
  isActive,
  onClick,
}: {
  mode: DrawMode;
  isActive: boolean;
  onClick: () => void;
}) => {
  if (mode === "static") return null;

  const icons: Record<ActiveDrawMode, preact.JSX.Element> = {
    select: <SelectIcon />,
    polygon: <PolygonIcon />,
    rectangle: <RectangleIcon />,
    circle: <CircleIcon />,
    linestring: <LineIcon />,
  };

  const titles: Record<ActiveDrawMode, string> = {
    select: "Select features",
    polygon: "Draw polygon",
    rectangle: "Draw rectangle",
    circle: "Draw circle",
    linestring: "Draw line",
  };

  return (
    <button
      type="button"
      className={`mapka-draw-control-button ${isActive ? "mapka-draw-control-button--active" : ""}`}
      title={titles[mode]}
      aria-label={titles[mode]}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {icons[mode]}
    </button>
  );
};

const Toolbar = ({ activeMode, availableModes, onModeChange }: ToolbarProps) => {
  return (
    <div className="maplibregl-ctrl maplibregl-ctrl-group">
      {availableModes.map((mode) => (
        <ModeButton
          key={mode}
          mode={mode}
          isActive={activeMode === mode}
          onClick={() => onModeChange(mode)}
        />
      ))}
    </div>
  );
};

const defaultModes: DrawMode[] = ["select", "polygon", "rectangle", "circle", "linestring"];
const defaultDefaultMode: DrawMode = "static";

export class MapkaDrawControl implements IControl {
  private map: MapkaMap | undefined;
  private container: HTMLDivElement | undefined;
  private draw: TerraDraw | undefined;
  private options: Required<MapkaDrawControlOptions>;

  constructor({
    modes = defaultModes,
    defaultMode = defaultDefaultMode,
  }: MapkaDrawControlOptions = {}) {
    this.options = {
      defaultMode: defaultMode,
      modes: modes,
    };
  }

  private whenMapLoaded(callback: () => void) {
    if (this.map?.isStyleLoaded()) {
      callback();
    } else {
      this.map?.once("style.load", callback);
    }
  }

  private initTerraDraw() {
    if (!this.map) {
      throw new Error("Map is not initialized");
    }

    const modes = [];

    if (this.options.modes.includes("select")) {
      modes.push(
        new TerraDrawSelectMode({
          flags: {
            polygon: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            rectangle: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            circle: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: false,
                  draggable: false,
                  deletable: false,
                },
              },
            },
            linestring: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
          },
        }),
      );
    }

    if (this.options.modes.includes("polygon")) {
      modes.push(new TerraDrawPolygonMode());
    }

    if (this.options.modes.includes("rectangle")) {
      modes.push(new TerraDrawRectangleMode({ drawInteraction: "click-move-or-drag" }));
    }

    if (this.options.modes.includes("circle")) {
      modes.push(new TerraDrawCircleMode({ drawInteraction: "click-move-or-drag" }));
    }

    if (this.options.modes.includes("linestring")) {
      modes.push(new TerraDrawLineStringMode());
    }

    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map: this.map,
        lib: maplibregl,
      }),
      modes,
    });

    this.whenMapLoaded(() => {
      this.draw?.start();
      if (this.options.defaultMode) {
        this.draw?.setMode(this.options.defaultMode);
      }
      this.render();
    });
  }

  private handleModeChange = (mode: DrawMode): void => {
    if (!this.draw) return;

    const activeMode = this.draw?.getMode();

    if (activeMode === mode) {
      this.draw.setMode("static");
      this.render();
    } else {
      this.draw.setMode(mode);
      this.render();
    }
  };

  private render(): void {
    if (!this.container) {
      this.map?.logger.error("Draw control container not found for rendering");
      return;
    }

    const activeMode = this.getMode();
    render(
      <Toolbar
        activeMode={activeMode}
        availableModes={this.options.modes}
        onModeChange={this.handleModeChange}
      />,
      this.container,
    );
  }

  private unmount(): void {
    if (!this.container) {
      this.map?.logger.error("Draw control container not found during unmount");
      return;
    }
    render(null, this.container);
  }

  public onAdd(map: MapkaMap): HTMLElement {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "mapka-draw-control";

    this.initTerraDraw();

    return this.container;
  }

  public onRemove(): void {
    this.draw?.stop();

    this.unmount();

    this.container?.remove?.();

    this.container = undefined;
    this.map = undefined;
    this.draw = undefined;
  }

  /** Get the TerraDraw instance for advanced usage */
  public getTerraDraw(): TerraDraw | undefined {
    return this.draw;
  }

  /** Get all drawn features as GeoJSON */
  public getFeatures(): GeoJSONStoreFeatures[] | undefined {
    return this.draw?.getSnapshot();
  }

  /** Clear all drawn features */
  public clear(): void {
    this.draw?.clear();
  }

  /** Set the active drawing mode programmatically */
  public setMode(mode: DrawMode): void {
    if (!this.draw) return;

    this.draw.setMode(mode);
    this.render();
  }

  /** Get the current active mode */
  public getMode() {
    return this.draw?.getMode() as DrawMode | undefined;
  }
}
