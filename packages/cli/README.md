# rics-cli

[![npm version](https://badgen.net/npm/v/rics-cli)](https://www.npmjs.com/package/rics-cli)
[![minzipped size](https://badgen.net/bundlephobia/minzip/rics-cli)](https://bundlephobia.com/package/rics-cli)
[![downloads](https://badgen.net/npm/dm/rics-cli)](https://www.npmjs.com/package/rics-cli)

Command-line interface for the rics CSS preprocessor.

## Installation

```bash
npm install -g rics-cli
```

## Usage

```bash
# Compile to stdout
rics styles.rics

# Compile to file
rics styles.rics -o styles.css

# Watch mode
rics styles.rics -o styles.css --watch

# Minify output
rics styles.rics -o styles.css --minify

# Multiple files
rics src/**/*.rics -o dist/
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output` | `-o` | Output file or directory |
| `--watch` | `-w` | Watch for changes and recompile |
| `--minify` | `-m` | Minify output |
| `--quiet` | `-q` | Suppress non-error output |
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |

## Examples

### Single file

```bash
rics input.rics -o output.css
```

### Watch mode

```bash
rics styles.rics -o styles.css --watch
```

### Minified production build

```bash
rics styles.rics -o styles.min.css --minify
```

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
