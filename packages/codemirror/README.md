<p align="center">
  <img src="https://raw.githubusercontent.com/better-lyrics/rics/master/images/logo.svg" alt="rics" width="96" height="96">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/codemirror-lang-rics"><img src="https://badgen.net/npm/v/codemirror-lang-rics" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/codemirror-lang-rics"><img src="https://badgen.net/bundlephobia/minzip/codemirror-lang-rics" alt="minzipped size"></a>
  <a href="https://www.npmjs.com/package/codemirror-lang-rics"><img src="https://badgen.net/npm/dm/codemirror-lang-rics" alt="downloads"></a>
</p>

CodeMirror 6 language support for rics. Provides syntax highlighting and real-time linting.

## Installation

```bash
npm install codemirror-lang-rics
```

## Peer Dependencies

Requires CodeMirror 6 packages:

```bash
npm install @codemirror/language @codemirror/lint @codemirror/state @codemirror/view
```

## Usage

```typescript
import { EditorView, basicSetup } from "codemirror";
import {
  ricsLanguage,
  ricsLinter,
  colorHighlighter,
  colorHighlighterStyles,
} from "codemirror-lang-rics";

const editor = new EditorView({
  extensions: [
    basicSetup,
    ricsLanguage(),
    ricsLinter({ delay: 300 }),
    colorHighlighter(),
    colorHighlighterStyles,
  ],
  parent: document.getElementById("editor"),
});
```

## API

### ricsLanguage()

Returns a CodeMirror extension for rics syntax highlighting.

```typescript
import { ricsLanguage } from "codemirror-lang-rics";

const extensions = [ricsLanguage()];
```

### ricsLinter(options?)

Returns a CodeMirror linter extension that validates rics code in real-time.

```typescript
import { ricsLinter } from "codemirror-lang-rics";

const extensions = [
  ricsLinter({
    delay: 300,  // Debounce delay in ms (default: 300)
  }),
];
```

### ricsHighlighting()

Alias for `ricsLanguage()`.

### colorHighlighter(config?)

Returns a CodeMirror extension that highlights color values inline with their actual color as background.

```typescript
import { colorHighlighter, colorHighlighterStyles } from "codemirror-lang-rics";

const extensions = [
  colorHighlighter({
    className: "cm-color-preview",       // CSS class for preview (default)
    lightClassName: "cm-color-preview-light",  // Class for light colors
    darkClassName: "cm-color-preview-dark",    // Class for dark colors
    luminanceThreshold: 0.35,            // Light/dark text threshold (0-1)
  }),
  colorHighlighterStyles,  // Include default styles
];
```

**Supported formats:** hex, rgb, rgba, hsl, hsla, hwb, lab, lch, oklch, oklab, color()

**Note:** Preprocessor variables (`$var`) and CSS custom properties (`var()`) are automatically skipped.

### colorHighlighterStyles

Default CodeMirror theme for color previews. Include this alongside `colorHighlighter()` or define your own styles targeting `.cm-color-preview`.

## Features

- Full syntax highlighting for rics/SCSS syntax
- Variables (`$name`)
- Nesting and parent selector (`&`)
- Mixins and functions (`@mixin`, `@function`, `@include`)
- Control flow (`@if`, `@else`, `@for`, `@each`, `@while`)
- Color values and functions
- Real-time error detection
- Inline error markers
- Inline color previews with automatic contrast adjustment

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
