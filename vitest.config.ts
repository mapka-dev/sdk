import { defineConfig } from "vitest/config";

const projects = ["maplibre-gl-sdk"];

export default defineConfig({
  test: {
    projects: projects.map((name) => {
      return {
        extends: `./packages/${name}/vitest.config.ts`,
        test: {
          root: `./packages/${name}/`,
          name,
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        },
      };
    }),
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact",
  },
});
