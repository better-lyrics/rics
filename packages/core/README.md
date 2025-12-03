<p align="center">
  <img src="https://raw.githubusercontent.com/better-lyrics/rics/master/images/logo.svg" alt="rics" width="96" height="96">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/rics"><img src="https://badgen.net/npm/v/rics" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/rics"><img src="https://badgen.net/bundlephobia/minzip/rics" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/rics"><img src="https://badgen.net/npm/dm/rics" alt="downloads"></a>
</p>

Core compiler for the rics CSS preprocessor. A fast, lightweight SCSS-like preprocessor that runs anywhere JavaScript runs.

## Installation

```bash
npm install rics
```

## Usage

```typescript
import { compile } from "rics";

const css = compile(`
$primary: #f43f5e;

.button {
  background: $primary;

  &:hover {
    background: darken($primary, 10%);
  }
}
`);
```

## API

### compile(input, config?)

Compiles rics/SCSS input to CSS.

```typescript
const css = compile(input);
```

### compileWithDetails(input, config?)

Returns full compilation result including errors, warnings, and stats.

```typescript
const result = compileWithDetails(input);

console.log(result.css);
console.log(result.errors);      // CompileError[]
console.log(result.warnings);    // CompileWarning[]
console.log(result.stats);       // { duration, rules, iterations, inputSize, outputSize }
```

### compileAsync(input, config?)

Non-blocking compilation for large inputs.

```typescript
const result = await compileAsync(largeStylesheet);
```

## Configuration

```typescript
compile(input, {
  timeout: 5000,           // Max compilation time (ms)
  maxIterations: 10000,    // Max loop iterations
  maxNestingDepth: 64,     // Max selector nesting
  minify: false,           // Minify output
  strictMode: false,       // Throw on first error
});
```

## Features

- Variables and math operations
- Nesting with `&` parent selector
- Mixins with parameters and `@content`
- Custom functions with `@function` and `@return`
- Control flow: `@if`, `@else`, `@for`, `@each`, `@while`
- Color functions: `darken`, `lighten`, `mix`, `saturate`, and more
- String interpolation with `#{}`
- Native CSS pass-through for modern features

## Benchmarks

> Auto-generated. Run `pnpm bench` in the benchmarks folder to regenerate.

### Performance (ops/sec, higher is better)

| Preprocessor | ops/sec | Comparison |
|--------------|---------|------------|
| rics | 909 | **fastest** |
| stylus | 291 | 3.1x slower |
| sass | 231 | 3.9x slower |
| less | 176 | 5.2x slower |

### Package Size (unpacked, smaller is better)

| Package | Size | Dependencies | Comparison |
|---------|------|--------------|------------|
| rics | 92.1 KB | 0 | **smallest** |
| stylus | 357.2 KB | 5 | 4x larger |
| less | 2.8 MB | 3 | 32x larger |
| sass | 5.5 MB | 3 | 61x larger |

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
