# prettier-plugin-rics

## 0.3.15

### Patch Changes

- bb79518: Fix formatter incorrectly adding space after double colons in pseudo-elements (e.g., `::before` becoming `: :before`)

## 0.3.14

### Patch Changes

- 93e800d: Add proper npm metadata fields (author, repository, homepage, bugs, engines, sideEffects).

## 0.3.12

### Patch Changes

- 97a11a9: prettier-plugin-rics: Fix formatting of comments - single-line comments (`// ...`) and inline comments (`/* ... */`) no longer affect indentation tracking or receive colon normalization.

## 0.3.11

### Patch Changes

- e238699: Fix indentation for maps and lists - formatter now handles `(` and `)` parentheses for proper nesting, not just `{` and `}` braces.

## 0.3.1

### Patch Changes

- 1b6b472: Remove named exports to fix CJS mixed exports warning. All exports are still accessible via the default export object (e.g., `plugin.configs`, `plugin.rules`, `plugin.parser`).
- d16c19e: fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

  fix: Font shorthand `font: 16px/1.5` no longer incorrectly interpreted as division

  fix: Warnings now include position information for accurate linter highlighting

  fix: Add missing named exports for prettier-plugin-rics and eslint-plugin-rics

## 0.1.6

### Patch Changes

- 0a9e2a5: Fix TypeScript errors by updating parser function signature to match Prettier's interface.

## 0.1.2

### Patch Changes

- Added MIT license files to all packages

## 0.1.1

### Patch Changes

- Added comprehensive documentation
