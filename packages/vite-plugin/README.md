# vite-plugin-rics

[![npm version](https://badgen.net/npm/v/vite-plugin-rics)](https://www.npmjs.com/package/vite-plugin-rics)
[![minzipped size](https://badgen.net/bundlephobia/minzip/vite-plugin-rics)](https://bundlephobia.com/package/vite-plugin-rics)
[![downloads](https://badgen.net/npm/dm/vite-plugin-rics)](https://www.npmjs.com/package/vite-plugin-rics)

Vite plugin for the rics CSS preprocessor. Enables importing `.rics` files directly in your Vite projects.

## Installation

```bash
npm install vite-plugin-rics
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { ricsPlugin } from "vite-plugin-rics";

export default defineConfig({
  plugins: [ricsPlugin()],
});
```

Import `.rics` files in your code:

```typescript
// main.ts
import "./styles.rics"; // Compiled to CSS and injected
```

### Raw Imports

Use `?raw` to import the source content without compilation:

```typescript
import source from "./styles.rics?raw"; // Raw rics source as string
```

This is useful for editors, playgrounds, or when you need the unprocessed source.

## Options

```typescript
ricsPlugin({
  // Compilation options passed to rics compiler
  minify: false,
  timeout: 5000,
  maxIterations: 10000,
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minify` | `boolean` | `false` | Minify compiled CSS |
| `timeout` | `number` | `5000` | Max compilation time (ms) |
| `maxIterations` | `number` | `10000` | Max loop iterations |

## How It Works

The plugin transforms `.rics` files to CSS during Vite's build process:

1. Intercepts imports of `.rics` files
2. Compiles the rics source to CSS using the core compiler
3. Returns the CSS for Vite's CSS pipeline to handle

In development mode, changes to `.rics` files trigger hot module replacement.

## TypeScript

Add type declarations for `.rics` imports:

```typescript
// vite-env.d.ts or global.d.ts
declare module "*.rics" {
  const css: string;
  export default css;
}

declare module "*.rics?raw" {
  const source: string;
  export default source;
}
```

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
