import { render } from "preact";
import maplibregl from "maplibre-gl";
import {
  TerraDraw,
  TerraDrawSelectMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawCircleMode,
  TerraDrawLineStringMode,
  TerraDrawFreehandMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { SelectIcon } from "../components/SelectIcon.js";
import { PolygonIcon } from "../components/PolygonIcon.js";
import { RectangleIcon } from "../components/RectangleIcon.js";
import { CircleIcon } from "../components/CircleIcon.js";
import { LineIcon } from "../components/LineIcon.js";
import { TrashIcon } from "../components/TrashIcon.js";
import { FreehandIcon } from "../components/FreehandIcon.js";
import { isEmpty } from "es-toolkit/compat";
import type { IControl } from "maplibre-gl";
import type { GeoJSONStoreFeatures } from "terra-draw";
import type { MapkaMap } from "../map.js";

export type DrawMode =
  | "static"
  | "select"
  | "polygon"
  | "rectangle"
  | "circle"
  | "linestring"
  | "freehand";

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
  hasFeatures: boolean;
  onModeChange: (mode: DrawMode) => void;
  onClear: () => void;
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
    freehand: <FreehandIcon />,
  };

  const titles: Record<ActiveDrawMode, string> = {
    select: "Select features",
    polygon: "Draw polygon",
    rectangle: "Draw rectangle",
    circle: "Draw circle",
    linestring: "Draw line",
    freehand: "Draw freehand",
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

const ClearButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      className="mapka-draw-control-button mapka-draw-control-button--clear"
      title="Clear all drawings"
      aria-label="Clear all drawings"
      onClick={onClick}
    >
      <TrashIcon />
    </button>
  );
};

const Toolbar = ({
  activeMode,
  availableModes,
  hasFeatures,
  onModeChange,
  onClear,
}: ToolbarProps) => {
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
      {hasFeatures && <ClearButton onClick={onClear} />}
    </div>
  );
};

const defaultModes: DrawMode[] = [
  "select",
  "polygon",
  "rectangle",
  "circle",
  "linestring",
  "freehand",
];
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
            freehand: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: false,
                  draggable: false,
                  deletable: false,
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

    if (this.options.modes.includes("freehand")) {
      modes.push(new TerraDrawFreehandMode());
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
      this.draw?.setMode(this.options.defaultMode);

      // Re-render when features change to update clear button visibility
      this.draw?.on("finish", this.render);
      this.draw?.on("change", this.render);

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

  private handleClear = (): void => {
    this.clear();
  };

  private render = () => {
    if (!this.container) {
      this.map?.logger.error("Draw control container not found for rendering");
      return;
    }

    const activeMode = this.getMode();
    const features = this.getFeatures();
    const hasFeatures = !isEmpty(features);

    render(
      <Toolbar
        activeMode={activeMode}
        availableModes={this.options.modes}
        hasFeatures={hasFeatures}
        onModeChange={this.handleModeChange}
        onClear={this.handleClear}
      />,
      this.container,
    );
  };

  private unmountControl(): void {
    if (!this.container) {
      this.map?.logger.error("Draw control container not found during unmount");
      return;
    }
    render(null, this.container);
  }

  private cleanListeners(): void {
    this.draw?.off("finish", this.render);
    this.draw?.off("change", this.render);
  }

  public onAdd(map: MapkaMap): HTMLElement {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "mapka-draw-control";

    this.initTerraDraw();

    return this.container;
  }

  public onRemove(): void {
    this.draw?.clear();
    this.draw?.stop();

    this.cleanListeners();
    this.unmountControl();

    this.container?.remove?.();

    this.container = undefined;
    this.map = undefined;
    this.draw = undefined;
  }

  /**
   * Get the TerraDraw instance for advanced usage,
   * Instance is only available after the control is added to the map
   */
  public getTerraDraw(): TerraDraw | undefined {
    return this.draw;
  }

  /** Get all drawn features as GeoJSON */
  public getFeatures(): GeoJSONStoreFeatures[] | undefined {
    return this.draw?.getSnapshot();
  }

  /** Clear all drawn features */
  public clear(): void {
    if (!this.draw) return;

    this.draw.clear();
    this.render();
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
