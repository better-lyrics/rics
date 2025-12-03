<h1 align="center"><img src="images/logo.svg" alt="rics" width="128" height="128"></h1>

<p align="center">
  A fast, lightweight SCSS-like preprocessor that runs anywhere JavaScript runs.<br>
  Built for real-time compilation in browsers, editors, and build tools.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/rics"><img src="https://badgen.net/npm/v/rics" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/rics"><img src="https://badgen.net/bundlephobia/minzip/rics" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/rics"><img src="https://badgen.net/npm/dm/rics" alt="downloads"></a>
  <a href="https://github.com/user/rics/blob/master/LICENSE"><img src="https://badgen.net/npm/license/rics" alt="license"></a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Benchmarks](#benchmarks)
	- [Performance (ops/sec, higher is better)](#performance-opssec-higher-is-better)
	- [Package Size (minzipped, smaller is better)](#package-size-minzipped-smaller-is-better)
- [Why rics?](#why-rics)
- [Packages](#packages)
- [Installation](#installation)
- [Quick Start](#quick-start)
	- [Node.js / Browser](#nodejs--browser)
	- [CLI](#cli)
	- [Vite](#vite)
	- [Webpack](#webpack)
	- [CodeMirror 6](#codemirror-6)
	- [Prettier](#prettier)
	- [ESLint](#eslint)
- [Features](#features)
	- [Variables \& Math](#variables--math)
	- [Nesting](#nesting)
	- [Mixins with Parameters](#mixins-with-parameters)
	- [Custom Functions](#custom-functions)
	- [Loops](#loops)
	- [Conditionals](#conditionals)
	- [Color Functions](#color-functions)
	- [Interpolation](#interpolation)
- [API](#api)
	- [compile(input, config?)](#compileinput-config)
	- [compileWithDetails(input, config?)](#compilewithdetailsinput-config)
	- [compileAsync(input, config?)](#compileasyncinput-config)
- [Configuration](#configuration)
- [Built-in Functions](#built-in-functions)
	- [Math](#math)
	- [Strings](#strings)
	- [Lists](#lists)
	- [Maps](#maps)
	- [Introspection](#introspection)
- [Native CSS Pass-through](#native-css-pass-through)
- [License](#license)

## Benchmarks

> Auto-generated. Run `pnpm bench` in the benchmarks folder to regenerate.

### Performance (ops/sec, higher is better)

| Preprocessor | ops/sec | Comparison |
|--------------|---------|------------|
| rics | 927 | **fastest** |
| stylus | 306 | 3.0x slower |
| sass | 265 | 3.5x slower |
| less | 222 | 4.2x slower |

### Package Size (minzipped, smaller is better)

| Package | Size | Dependencies | Comparison |
|---------|------|--------------|------------|
| rics | 10.5 KB | 0 | **smallest** |
| less | 47.2 KB | 3 | 4x larger |
| stylus | 82.8 KB | 5 | 8x larger |
| sass | 669.8 KB | 3 | 63x larger |

## Why rics?

**rics vs Stylis** — Stylis handles nesting and autoprefixing (~3KB), but that's it. rics adds full SCSS features — variables, mixins, functions, loops, conditionals, color manipulation — while staying small (~10KB minzipped) and fast.

**rics vs Sass/Less/Stylus** — These need Node.js or WASM. rics runs anywhere JavaScript runs, compiles in milliseconds, and has zero dependencies.

| Feature | rics | Stylis | Sass | Less |
|---------|------|--------|------|------|
| Variables | Yes | No | Yes | Yes |
| Nesting | Yes | Yes | Yes | Yes |
| Mixins | Yes | No | Yes | Yes |
| Functions | Yes | No | Yes | Yes |
| Loops | Yes | No | Yes | Yes |
| Color functions | Yes | No | Yes | Yes |
| Browser-native | Yes | Yes | No | No |
| Zero dependencies | Yes | Yes | No | No |

## Packages

| Package                                                                    | Description            | Size   |
| -------------------------------------------------------------------------- | ---------------------- | ------ |
| [rics](https://www.npmjs.com/package/rics)                                 | Core compiler          | ~40KB  |
| [rics-cli](https://www.npmjs.com/package/rics-cli)                         | Command-line interface | ~2KB   |
| [vite-plugin-rics](https://www.npmjs.com/package/vite-plugin-rics)         | Vite plugin            | ~1KB   |
| [webpack-loader-rics](https://www.npmjs.com/package/webpack-loader-rics)   | Webpack loader         | ~0.5KB |
| [codemirror-lang-rics](https://www.npmjs.com/package/codemirror-lang-rics) | CodeMirror 6 support   | ~3KB   |
| [prettier-plugin-rics](https://www.npmjs.com/package/prettier-plugin-rics) | Prettier formatter     | ~1KB   |
| [eslint-plugin-rics](https://www.npmjs.com/package/eslint-plugin-rics)     | ESLint plugin          | ~2KB   |
| [rics-vscode](https://marketplace.visualstudio.com/)                       | VS Code extension      | -      |

## Installation

```bash
# Core compiler
npm install rics

# CLI (global)
npm install -g rics-cli

# Build tools
npm install vite-plugin-rics      # Vite
npm install webpack-loader-rics   # Webpack

# Editor support
npm install codemirror-lang-rics  # CodeMirror 6

# Code quality
npm install prettier-plugin-rics  # Prettier
npm install eslint-plugin-rics    # ESLint
```

## Quick Start

### Node.js / Browser

```typescript
import { compile } from "rics";

const css = compile(`
$primary: #f43f5e;
$radius: 8px;

.button {
  background: $primary;
  border-radius: $radius;
  padding: 12px 24px;

  &:hover {
    background: darken($primary, 10%);
  }
}
`);
```

### CLI

```bash
# Compile to stdout
rics styles.rics

# Compile to file
rics styles.rics -o styles.css

# Watch mode
rics styles.rics -o styles.css --watch

# Minify output
rics styles.rics -o styles.css --minify
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { ricsPlugin } from "vite-plugin-rics";

export default defineConfig({
  plugins: [ricsPlugin()],
});
```

```typescript
// main.ts
import "./styles.rics"; // Auto-compiled and injected
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.rics$/,
        use: ["style-loader", "css-loader", "webpack-loader-rics"],
      },
    ],
  },
};
```

### CodeMirror 6

```typescript
import { EditorView, basicSetup } from "codemirror";
import { ricsLanguage, ricsLinter } from "codemirror-lang-rics";

const editor = new EditorView({
  extensions: [basicSetup, ricsLanguage(), ricsLinter({ delay: 300 })],
  parent: document.getElementById("editor"),
});
```

### Prettier

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-rics"]
}
```

### ESLint

```javascript
// eslint.config.js
import ricsPlugin from "eslint-plugin-rics";

export default [
  {
    files: ["**/*.rics"],
    ...ricsPlugin.configs.recommended,
    plugins: { rics: ricsPlugin },
  },
];
```

## Features

### Variables & Math

```scss
$base: 4px;
$primary: #f43f5e;

.element {
  padding: $base * 4; // 16px
  margin: $base * 2 $base * 3; // 8px 12px
  width: 100% - 20px;
  color: $primary;
}
```

### Nesting

```scss
.card {
  padding: 16px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  &--featured {
    border: 2px solid gold;
  }
  &__title {
    font-size: 24px;
  }

  .icon {
    margin-right: 8px;
    &.left {
      margin-left: 0;
    }
  }
}
```

### Mixins with Parameters

```scss
@mixin button($bg, $color: white, $radius: 4px) {
  background: $bg;
  color: $color;
  border-radius: $radius;
  border: none;
  cursor: pointer;

  &:hover {
    background: darken($bg, 10%);
  }
}

.btn-primary {
  @include button(#f43f5e);
}
.btn-secondary {
  @include button(#6366f1, white, 8px);
}
```

### Custom Functions

```scss
@function rem($px) {
  @return #{$px / 16}rem;
}

@function spacing($n) {
  @return 4px * $n;
}

.text {
  font-size: #{rem(18)}; // 1.125rem
  padding: spacing(4); // 16px
  margin-bottom: spacing(6); // 24px
}
```

### Loops

```scss
// Generate utility classes
@for $i from 1 through 8 {
  .gap-#{$i} {
    gap: #{$i * 4}px;
  }
  .p-#{$i} {
    padding: #{$i * 4}px;
  }
  .m-#{$i} {
    margin: #{$i * 4}px;
  }
}

// Iterate maps
$colors: (
  primary: #f43f5e,
  success: #22c55e,
  warning: #f59e0b,
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
  .bg-#{$name} {
    background: $color;
    &:hover {
      background: darken($color, 10%);
    }
  }
}
```

### Conditionals

```scss
@mixin theme($mode) {
  @if $mode == dark {
    background: #0a0a0a;
    color: #fafafa;
  } @else if $mode == light {
    background: #ffffff;
    color: #0a0a0a;
  } @else {
    background: inherit;
  }
}

.panel {
  @include theme(dark);
}
```

### Color Functions

```scss
$brand: #f43f5e;

.palette {
  --light: #{lighten($brand, 20%)};
  --dark: #{darken($brand, 20%)};
  --muted: #{desaturate($brand, 30%)};
  --complement: #{complement($brand)};
  --mix: #{mix($brand, #3b82f6, 50%)};
  --transparent: #{rgba($brand, 0.5)};
}
```

**Available:** `lighten`, `darken`, `saturate`, `desaturate`, `adjust-hue`, `mix`, `complement`, `invert`, `grayscale`, `rgba`, `rgb`, `hsl`, `hsla`, `red`, `green`, `blue`, `alpha`, `hue`, `saturation`, `lightness`

### Interpolation

```scss
$prop: margin;
$side: top;
$i: 5;

.item {
  #{$prop}-#{$side}: 10px;
}

.col-#{$i} {
  width: percentage($i / 12);
}

[data-count="#{$i * 10}"] {
  content: "#{$i} items";
}
```

## API

### compile(input, config?)

Returns compiled CSS string.

```typescript
const css = compile(scss);
```

### compileWithDetails(input, config?)

Returns full compilation result with errors, warnings, and stats:

```typescript
const result = compileWithDetails(scss);

console.log(result.css);
console.log(result.errors); // CompileError[]
console.log(result.warnings); // CompileWarning[]
console.log(result.stats); // { duration, rules, iterations, inputSize, outputSize }
```

### compileAsync(input, config?)

Non-blocking compilation for large inputs:

```typescript
const result = await compileAsync(largeStylesheet);
```

## Configuration

```typescript
compile(scss, {
  timeout: 5000, // Max compilation time (ms)
  maxIterations: 10000, // Max loop iterations
  maxNestingDepth: 64, // Max selector nesting
  minify: false, // Minify output
  strictMode: false, // Throw on first error
});
```

## Built-in Functions

### Math

`round`, `ceil`, `floor`, `abs`, `min`, `max`, `percentage`, `random`

### Strings

`str-length`, `str-slice`, `str-index`, `str-insert`, `to-upper-case`, `to-lower-case`, `quote`, `unquote`

### Lists

`length`, `nth`, `join`, `append`, `index`

### Maps

`map-get`, `map-keys`, `map-values`, `map-has-key`

### Introspection

`type-of`, `unit`, `unitless`, `if`, `inspect`

## Native CSS Pass-through

Modern CSS features work unchanged:

- Custom properties: `var(--color)`, `env(safe-area-inset-top)`
- Functions: `calc()`, `min()`, `max()`, `clamp()`
- At-rules: `@media`, `@container`, `@supports`, `@layer`, `@scope`
- Selectors: `:has()`, `:is()`, `:where()`, `@starting-style`

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
