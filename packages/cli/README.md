<p align="center">
  <img src="https://raw.githubusercontent.com/better-lyrics/rics/master/images/logo.svg" alt="rics" width="96" height="96">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/rics-cli"><img src="https://badgen.net/npm/v/rics-cli" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/rics-cli"><img src="https://badgen.net/bundlephobia/minzip/rics-cli" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/rics-cli"><img src="https://badgen.net/npm/dm/rics-cli" alt="downloads"></a>
</p>

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
