# prettier-plugin-rics

[![npm version](https://badgen.net/npm/v/prettier-plugin-rics)](https://www.npmjs.com/package/prettier-plugin-rics)
[![minzipped size](https://badgen.net/bundlephobia/minzip/prettier-plugin-rics)](https://bundlephobia.com/package/prettier-plugin-rics)
[![downloads](https://badgen.net/npm/dm/prettier-plugin-rics)](https://www.npmjs.com/package/prettier-plugin-rics)

Prettier plugin for formatting rics files.

## Installation

```bash
npm install prettier-plugin-rics
```

## Usage

Add the plugin to your Prettier configuration:

```json
{
  "plugins": ["prettier-plugin-rics"]
}
```

Or in `.prettierrc.js`:

```javascript
module.exports = {
  plugins: ["prettier-plugin-rics"],
};
```

## Command Line

```bash
# Format a single file
prettier --write styles.rics

# Format all rics files
prettier --write "**/*.rics"

# Check formatting
prettier --check "**/*.rics"
```

## Editor Integration

Most editors with Prettier support will automatically format `.rics` files once the plugin is configured.

### VS Code

Install the Prettier extension and add to your workspace settings:

```json
{
  "[rics]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Options

Standard Prettier options apply:

| Option | Default | Description |
|--------|---------|-------------|
| `tabWidth` | `2` | Spaces per indentation level |
| `useTabs` | `false` | Use tabs instead of spaces |
| `singleQuote` | `false` | Use single quotes for strings |

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
