import { spawnTask, parallelTask } from "@chyzwar/runner";

spawnTask("lint", "yarn", ["biome", "lint", "--write", "."]);
spawnTask("check", "yarn", ["biome", "check", "--write", "."]);

spawnTask("build", "yarn", ["tsc", "--build"]);
spawnTask("build:watch", "yarn", ["tsc", "--build", "--watch", "--preserveWatchOutput"]);

spawnTask("styles", "yarn", ["styles"], {
  cwd: "packages/maplibre-gl-sdk",
});

spawnTask("styles:watch", "yarn", ["styles:watch"], {
  cwd: "packages/maplibre-gl-sdk",
});

parallelTask("dev", ["build:watch", "styles:watch"]);
