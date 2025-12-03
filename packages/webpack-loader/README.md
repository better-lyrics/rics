<p align="center">
  <img src="https://raw.githubusercontent.com/better-lyrics/rics/master/images/logo.svg" alt="rics" width="96" height="96">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/webpack-loader-rics"><img src="https://badgen.net/npm/v/webpack-loader-rics" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/webpack-loader-rics"><img src="https://badgen.net/bundlephobia/minzip/webpack-loader-rics" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/webpack-loader-rics"><img src="https://badgen.net/npm/dm/webpack-loader-rics" alt="downloads"></a>
</p>

Webpack loader for the rics CSS preprocessor. Enables importing `.rics` files in Webpack projects.

## Installation

```bash
npm install webpack-loader-rics
```

## Usage

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

Import `.rics` files in your code:

```javascript
import "./styles.rics";
```

## Options

```javascript
{
  test: /\.rics$/,
  use: [
    "style-loader",
    "css-loader",
    {
      loader: "webpack-loader-rics",
      options: {
        minify: false,
        timeout: 5000,
        maxIterations: 10000,
      },
    },
  ],
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minify` | `boolean` | `false` | Minify compiled CSS |
| `timeout` | `number` | `5000` | Max compilation time (ms) |
| `maxIterations` | `number` | `10000` | Max loop iterations |

## With CSS Extraction

For production builds with extracted CSS:

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.rics$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "webpack-loader-rics",
        ],
      },
    ],
  },
};
```

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
