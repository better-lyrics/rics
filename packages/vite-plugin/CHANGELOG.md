# vite-plugin-rics

## 0.3.4

### Patch Changes

- Updated dependencies [bbe9578]
  - rics@0.3.4

## 0.3.3

### Patch Changes

- Updated dependencies [00b64cb]
  - rics@0.3.3

## 0.3.2

### Patch Changes

- Updated dependencies [5b215d3]
  - rics@0.3.2

## 0.3.1

### Patch Changes

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

## 0.1.7

### Patch Changes

- 2ed87fd: Fix production build **DEFINES** error

## 0.1.6

### Patch Changes

- 0a9e2a5: Clean up unused exports and fix code organization:
  - Remove unused internal exports from core compiler (Compiler class, parseValue, compareValues, performMath, Tokenizer class)
  - Remove duplicate LinterConfig definition in codemirror package
  - Remove redundant default export from vite-plugin (use named import `{ ricsPlugin }` instead)
- 0a9e2a5: Fix TypeScript error where `enforce` property type was being widened to `string` instead of `"pre" | "post"`.
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
- Updated dependencies [0a9e2a5]
  - rics@0.1.6

## 0.1.4

### Patch Changes

- 642fe6f: Skip `?raw` imports to let Vite's native raw loader handle them

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
