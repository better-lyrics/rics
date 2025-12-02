# rics

A fast, lightweight SCSS-like preprocessor that runs anywhere JavaScript runs. Built for real-time compilation in browsers, editors, and build tools.

## Why rics?

- **Zero dependencies** — Single ~50KB bundle, no PostCSS, no Dart Sass
- **Blazing fast** — Compiles thousands of rules in milliseconds
- **Browser-native** — Works in any JavaScript environment without WASM or workers
- **Real-time ready** — Designed for live preview in CodeMirror, Monaco, or any editor
- **SCSS-compatible** — Variables, nesting, mixins, functions, loops, conditionals
- **Full color manipulation** — `darken()`, `lighten()`, `mix()`, `saturate()`, and more
- **Smart pass-through** — Native CSS features like `var()`, `calc()`, `@container` work unchanged

## Installation

```bash
npm install rics
```

## Quick Start

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
    transform: translateY(-1px);
  }

  &--large {
    padding: 16px 32px;
    font-size: 18px;
  }
}
`);
```

## Features

### Variables & Math

```scss
$base: 4px;
$primary: #f43f5e;

.element {
  padding: $base * 4;           // 16px
  margin: $base * 2 $base * 3;  // 8px 12px
  width: 100% - 20px;
  color: $primary;
}
```

### Nesting

```scss
.card {
  padding: 16px;

  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  &--featured { border: 2px solid gold; }
  &__title { font-size: 24px; }

  .icon {
    margin-right: 8px;
    &.left { margin-left: 0; }
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

.btn-primary { @include button(#f43f5e); }
.btn-secondary { @include button(#6366f1, white, 8px); }
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
  font-size: #{rem(18)};      // 1.125rem
  padding: spacing(4);         // 16px
  margin-bottom: spacing(6);   // 24px
}
```

### Loops

```scss
// Generate utility classes
@for $i from 1 through 8 {
  .gap-#{$i} { gap: #{$i * 4}px; }
  .p-#{$i} { padding: #{$i * 4}px; }
  .m-#{$i} { margin: #{$i * 4}px; }
}

// Iterate maps
$colors: (primary: #f43f5e, success: #22c55e, warning: #f59e0b);

@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name} {
    background: $color;
    &:hover { background: darken($color, 10%); }
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

Manipulate colors with built-in functions:

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

## CodeMirror Integration

First-class CodeMirror v6 support with syntax highlighting, linting, and live compilation:

```typescript
import { EditorView, basicSetup } from "codemirror";
import { ricsLanguage, ricsLinter, onChangeCompile } from "rics/codemirror";

const editor = new EditorView({
  extensions: [
    basicSetup,
    ricsLanguage(),
    ricsLinter({ delay: 300 }),
    onChangeCompile((css, result) => {
      if (result.errors.length === 0) {
        updatePreview(css);
      }
    }),
  ],
  parent: document.getElementById("editor"),
});
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
console.log(result.errors);      // CompileError[]
console.log(result.warnings);    // CompileWarning[]
console.log(result.stats);       // { duration, rules, iterations, inputSize, outputSize }
```

### compileAsync(input, config?)

Non-blocking compilation for large inputs:

```typescript
const result = await compileAsync(largeStylesheet);
```

## Configuration

```typescript
compile(scss, {
  timeout: 5000,           // Max compilation time (ms)
  maxIterations: 10000,    // Max loop iterations
  maxNestingDepth: 64,     // Max selector nesting
  minify: false,           // Minify output
  strictMode: false,       // Throw on first error
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
