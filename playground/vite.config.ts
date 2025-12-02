import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      rics: resolve(__dirname, "../src/index.ts"),
    },
  },
  build: {
    outDir: "dist",
  },
});
