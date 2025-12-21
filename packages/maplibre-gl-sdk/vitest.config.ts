import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: "./src",
    environment: "happy-dom",
    setupFiles: [
      "./vitest.setup.ts",
    ],
  },
});
