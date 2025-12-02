import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "codemirror/index": "src/codemirror/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: [
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/highlight",
  ],
});
