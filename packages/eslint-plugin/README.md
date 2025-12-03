# eslint-plugin-rics

[![npm version](https://badgen.net/npm/v/eslint-plugin-rics)](https://www.npmjs.com/package/eslint-plugin-rics)
[![minzipped size](https://badgen.net/bundlephobia/minzip/eslint-plugin-rics)](https://bundlephobia.com/package/eslint-plugin-rics)
[![downloads](https://badgen.net/npm/dm/eslint-plugin-rics)](https://www.npmjs.com/package/eslint-plugin-rics)

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

### rics/no-syntax-errors

Validates rics syntax and reports compilation errors.

```javascript
// eslint.config.js
{
  rules: {
    "rics/no-syntax-errors": "error",
  },
}
```

### rics/no-unused-variables

Warns about declared but unused variables.

```javascript
{
  rules: {
    "rics/no-unused-variables": "warn",
  },
}
```

### rics/no-undefined-variables

Reports usage of undefined variables.

```javascript
{
  rules: {
    "rics/no-undefined-variables": "error",
  },
}
```

## Recommended Config

The recommended configuration enables:

- `rics/no-syntax-errors`: error
- `rics/no-undefined-variables`: error
- `rics/no-unused-variables`: warn

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
