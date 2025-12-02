import { defineConfig } from "vite";
import { ricsPlugin } from "vite-plugin-rics";

export default defineConfig({
  plugins: [ricsPlugin()],
  build: {
    outDir: "dist",
  },
});
