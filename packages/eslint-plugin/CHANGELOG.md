# eslint-plugin-rics

## 0.3.1

### Patch Changes

- 1b6b472: Remove named exports to fix CJS mixed exports warning. All exports are still accessible via the default export object (e.g., `plugin.configs`, `plugin.rules`, `plugin.parser`).
- d16c19e: fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

  fix: Font shorthand `font: 16px/1.5` no longer incorrectly interpreted as division

  fix: Warnings now include position information for accurate linter highlighting

  fix: Add missing named exports for prettier-plugin-rics and eslint-plugin-rics

- Updated dependencies [d16c19e]
  - rics@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [5bfa8d5]
  - rics@0.3.0

## 0.1.8

### Patch Changes

- Updated dependencies [2e28af2]
  - rics@0.1.8

## 0.1.6

### Patch Changes

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
- Updated dependencies
  - rics@0.1.1
