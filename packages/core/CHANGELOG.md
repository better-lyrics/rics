# rics

## 0.3.20

### Patch Changes

- 59cd92e: Fix custom @function calls in CSS declarations (no longer requires interpolation) and add negative index support to nth() function

## 0.3.19

### Patch Changes

- 6a46d2b: fix: unit conversion, @media variables, and named mixin arguments
  - Fixed inverted em/px conversion ratios in mixed unit math (e.g., `16px + 1em` now correctly outputs `32px`)
  - Fixed variables not resolving in @media query preludes (e.g., `@media (min-width: $breakpoint)` now works)
  - Added support for named mixin arguments (e.g., `@include button($color: yellow)`)
  - Fixed README to accurately describe mixin features (removed incorrect @content claim)

## 0.3.16

### Patch Changes

- c7266b7: fix: mixin with append in loop returning null
  - Fixed empty parens `()` returning null instead of empty list
  - Added variadic parameter support (`$props...`) for mixins and functions
  - Fixed space-separated variable expressions not being evaluated
  - Fixed `@each` not iterating over single values

## 0.3.14

### Patch Changes

- 93e800d: Add proper npm metadata fields (author, repository, homepage, bugs, engines, sideEffects).

## 0.3.13

### Patch Changes

- 0b5b356: Fix map/list parsing for quoted strings containing colons (e.g., `"#slider:not([disabled])"`)

## 0.3.12

### Patch Changes

- 97a11a9: rics: Multiple compiler fixes:
  - Fix "unclosed block" error when declaration lacks semicolon before closing brace
  - Fix `@each` with two variables inside mixin body (interpolation selectors like `#{$sel}` now work correctly)
  - Fix parsing of stray semicolons after block definitions (e.g., `@mixin foo { ... };`)

## 0.3.10

### Patch Changes

- b1f79fb: Remove unused tokenizer module (compiler uses inline character-based parsing).

## 0.3.7

### Patch Changes

- 93d2408: Fix nth() function not evaluating when passed a list variable without interpolation, fix nesting with combinator selectors (+, ~, >) not being recognized as nested rules, and fix SCSS functions inside CSS functions (e.g., `blur(nth($list, 1))`) not being evaluated.

## 0.3.6

### Patch Changes

- 5b27879: - Fix CodeMirror tokenizer to use `keyword` instead of `function` for CSS functions - `function` is a Lezer modifier
  - Fix infinite loop in `@font-face` and `mixin` bodies with incomplete declarations

## 0.3.4

### Patch Changes

- bbe9578: Fix CSS compatibility issues:
  - Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
  - Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
  - Fix @font-face and other declaration-block at-rules parsing
  - Fix inline comments in rule blocks being parsed as selectors/declarations
  - Add position info to compiler warnings for accurate linter highlighting
  - Fix CodeMirror tokenizer to use plain `variableName` tag (avoids Lezer modifier warning)

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
