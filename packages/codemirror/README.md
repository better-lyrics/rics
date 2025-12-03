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
import { ricsLanguage, ricsLinter } from "codemirror-lang-rics";

const editor = new EditorView({
  extensions: [
    basicSetup,
    ricsLanguage(),
    ricsLinter({ delay: 300 }),
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

## Features

- Full syntax highlighting for rics/SCSS syntax
- Variables (`$name`)
- Nesting and parent selector (`&`)
- Mixins and functions (`@mixin`, `@function`, `@include`)
- Control flow (`@if`, `@else`, `@for`, `@each`, `@while`)
- Color values and functions
- Real-time error detection
- Inline error markers

## License

MIT

---

Built by [Better Lyrics](https://better-lyrics.boidu.dev)
