# rics

## 0.3.3

### Patch Changes

- 00b64cb: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting
  - Fix CodeMirror tokenizer modifier syntax (`variableName.special` instead of space-separated)

## 0.3.2

### Patch Changes

- 5b215d3: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting

## 0.3.1

### Patch Changes

- d16c19e: fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

  fix: Font shorthand `font: 16px/1.5` no longer incorrectly interpreted as division

  fix: Warnings now include position information for accurate linter highlighting

  fix: Add missing named exports for prettier-plugin-rics and eslint-plugin-rics

## 0.3.0

### Minor Changes

- 5bfa8d5: Add oklch color format support with format preservation. Colors now retain their original format (hex, rgb, hsl, oklch) through transformations like mix(), lighten(), and darken(). Fix color highlighter to prevent lch/lab from matching inside oklch/oklab.

## 0.1.8

### Patch Changes

- 2e28af2: Fix infinite loop when typing incomplete declarations like `.car{\nc\n}`

## 0.1.6

### Patch Changes

- 0a9e2a5: Clean up unused exports and fix code organization:
  - Remove unused internal exports from core compiler (Compiler class, parseValue, compareValues, performMath, Tokenizer class)
  - Remove duplicate LinterConfig definition in codemirror package
  - Remove redundant default export from vite-plugin (use named import `{ ricsPlugin }` instead)
- 0a9e2a5: Fix floating point precision issues in compiled output. Numbers are now rounded to 6 decimal places to avoid values like `0.3999999999999999` appearing instead of `0.4`.
- 0a9e2a5: Fix CSS function arguments being incorrectly evaluated as math expressions. Added transform functions (translateX, translateY, rotate, scale, etc.), filter functions, and other CSS functions to the list of functions that preserve their arguments.
- 0a9e2a5: Add error detection for unclosed braces in rulesets, @media blocks, and control flow blocks. Previously, unclosed braces would silently auto-close without reporting an error.
- 0a9e2a5: Undefined variables now only emit a warning instead of both an error and warning. The compiled output preserves the variable name as-is when undefined.

## 0.1.2

### Patch Changes

- Added MIT license files to all packages

## 0.1.1

### Patch Changes

- Added comprehensive documentation
- Performance optimizations and bug fixes
