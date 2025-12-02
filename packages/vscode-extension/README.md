# rics for VS Code

Syntax highlighting for rics - a lightweight SCSS-like CSS preprocessor.

## Features

- Syntax highlighting for `.rics` files
- Support for all rics features:
  - Variables (`$variable`)
  - Nesting and parent selector (`&`)
  - Mixins (`@mixin`, `@include`)
  - Functions (`@function`, `@return`)
  - Control flow (`@if`, `@else`, `@for`, `@each`, `@while`)
  - Interpolation (`#{...}`)
  - All CSS at-rules (`@media`, `@keyframes`, etc.)
- Auto-closing brackets and quotes
- Code folding

## Installation

### From VS Code Marketplace

Search for "rics" in the VS Code Extensions view.

### Manual Installation

1. Download the `.vsix` file from releases
2. Open VS Code
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Install from VSIX" and select the downloaded file

### From Source

```bash
cd packages/vscode-extension
npm install -g @vscode/vsce
vsce package
code --install-extension rics-vscode-0.1.0.vsix
```

## Usage

Create a file with the `.rics` extension and start writing:

```scss
$primary: #f43f5e;

.button {
  background: $primary;

  &:hover {
    background: darken($primary, 10%);
  }
}
```

## Related Packages

- [rics](https://www.npmjs.com/package/rics) - Core compiler
- [vite-plugin-rics](https://www.npmjs.com/package/vite-plugin-rics) - Vite plugin
- [codemirror-lang-rics](https://www.npmjs.com/package/codemirror-lang-rics) - CodeMirror 6 support

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
