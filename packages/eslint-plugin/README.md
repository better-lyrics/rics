<p align="center">
  <img src="https://raw.githubusercontent.com/better-lyrics/rics/master/images/logo.svg" alt="rics" width="96" height="96">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/eslint-plugin-rics"><img src="https://badgen.net/npm/v/eslint-plugin-rics" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/eslint-plugin-rics"><img src="https://badgen.net/bundlephobia/minzip/eslint-plugin-rics" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/eslint-plugin-rics"><img src="https://badgen.net/npm/dm/eslint-plugin-rics" alt="downloads"></a>
</p>

ESLint plugin for linting rics files.

## Installation

```bash
npm install eslint-plugin-rics
```

## Usage

### Flat Config (ESLint 9+)

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

### Legacy Config (ESLint 8)

```json
{
  "plugins": ["rics"],
  "overrides": [
    {
      "files": ["*.rics"],
      "extends": ["plugin:rics/recommended"]
    }
  ]
}
```

## Rules

### rics/no-compile-errors

Reports rics compilation errors.

```javascript
{
  rules: {
    "rics/no-compile-errors": "error",
  },
}
```

### rics/no-compile-warnings

Reports rics compilation warnings.

```javascript
{
  rules: {
    "rics/no-compile-warnings": "warn",
  },
}
```

### rics/max-nesting-depth

Limits nesting depth in rics files.

```javascript
{
  rules: {
    "rics/max-nesting-depth": ["warn", { max: 4 }],
  },
}
```

## Recommended Config

The recommended configuration enables:

- `rics/no-compile-errors`: error
- `rics/no-compile-warnings`: warn

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
