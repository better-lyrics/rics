# codemirror-lang-rics

## 0.3.6

### Patch Changes

- 5b27879: - Fix CodeMirror tokenizer to use `keyword` instead of `function` for CSS functions - `function` is a Lezer modifier
  - Fix infinite loop in `@font-face` and `mixin` bodies with incomplete declarations
- Updated dependencies [5b27879]
  - rics@0.3.6

## 0.3.5

### Patch Changes

- b6e330c: Fix CodeMirror tokenizer to use `keyword` instead of `function` for CSS functions (var, calc, rgb, etc.) - `function` is a Lezer modifier, not a base tag

## 0.3.4

### Patch Changes

- bbe9578: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting
  - Fix CodeMirror tokenizer to use plain `variableName` tag (avoids Lezer modifier warning)
- Updated dependencies [bbe9578]
  - rics@0.3.4

## 0.3.3

### Patch Changes

- 00b64cb: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting
  - Fix CodeMirror tokenizer modifier syntax (`variableName.special` instead of space-separated)
- Updated dependencies [00b64cb]
  - rics@0.3.3

## 0.3.2

### Patch Changes

- 5b215d3: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting
- Updated dependencies [5b215d3]
  - rics@0.3.2

## 0.3.1

### Patch Changes

- d16c19e: fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

  fix: Font shorthand `font: 16px/1.5` no longer incorrectly interpreted as division

  fix: Warnings now include position information for accurate linter highlighting

  fix: Add missing named exports for prettier-plugin-rics and eslint-plugin-rics

- Updated dependencies [d16c19e]
  - rics@0.3.1

## 0.3.0

### Patch Changes

- 5bfa8d5: Add oklch color format support with format preservation. Colors now retain their original format (hex, rgb, hsl, oklch) through transformations like mix(), lighten(), and darken(). Fix color highlighter to prevent lch/lab from matching inside oklch/oklab.
- Updated dependencies [5bfa8d5]
  - rics@0.3.0

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
