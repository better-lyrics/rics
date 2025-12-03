# codemirror-lang-rics

## 0.2.0

### Minor Changes

- af31ed2: Add color highlighter extension for inline color preview in editor. Includes `colorHighlighter()` function and `colorHighlighterStyles` theme. Supports hex, rgb, hsl, hwb, lab, lch, oklch, oklab, and color() formats. Automatically skips preprocessor variables and CSS custom properties.

## 0.1.8

### Patch Changes

- Updated dependencies [2e28af2]
  - rics@0.1.8

## 0.1.6

### Patch Changes

- 0a9e2a5: Clean up unused exports and fix code organization:
  - Remove unused internal exports from core compiler (Compiler class, parseValue, compareValues, performMath, Tokenizer class)
  - Remove duplicate LinterConfig definition in codemirror package
  - Remove redundant default export from vite-plugin (use named import `{ ricsPlugin }` instead)
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
  - rics@0.1.6

## 0.1.2

### Patch Changes

- Added MIT license files to all packages
- Updated dependencies
  - rics@0.1.2

## 0.1.1

### Patch Changes

- Added comprehensive documentation
- Fixed syntax highlighting for variables with hyphens
- Fixed property name highlighting conflicting with functions
- Updated dependencies
  - rics@0.1.1
